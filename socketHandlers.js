import Horse from "./Horse.js";
import { isAllClientsReady } from "./server.js";

export const ROADHEIGHT = 100

export const handleNewHorse = (request, clientKey, clients) => {
  const { name, color } = request;
  console.log("handler", request);
  let newHorse = new Horse({ name: name, color: color });
  clients[clientKey] = {
    horse: newHorse,
    ready: false,
  };
  console.log("New horse " + name + " was added", " with " + color + " color");
};

export const handleAskForHorse = (response, user) => {
  console.log("the user", user)
  console.log("Horse name was asked for by: ", user.horse.name);
  response({ horse: { name: user.horse.name }, name: user.horse.name });
};

export const handleNewStats = (request, user) => {
  const { stats } = request;
  console.log("reg", request);
  console.log(user, " Is getting new stats!: " + stats);
  const horse = user.horse;
  horse.stats = { ...horse.stats, ...stats };
};

export const handleReady = (user, clientKey, clients, io) => {
  const client = user;
  client.ready = true;
  console.log("Readied up: " + clientKey);

  if (isAllClientsReady(clients)) {
    Object.keys(clients).forEach((client, i) => {
      const raceLane = (i / Object.keys(clients).length) * ROADHEIGHT;
      clients[client].physics = { speed: 0, position: { x: 0, y: raceLane } };
    });
    io.emit("start", clients);
  } else {
    
    console.log("Not everyone is ready", clients);
  }
};

export const handleClients = (socket, clients) => (data, response) => {
  console.log("clients asked for", clients);
  response(clients);
};

export const handleFrame = (clientsList, io) => {
  console.log("this is a frame")
  const horses = {};
  console.log("handling frame");
  Object.keys(clientsList).forEach((client) => {
    const horse = clientsList[client].horse;
    const physics = clientsList[client].physics;

    if (Math.random() * 100 > horse.stats.balance) {
      console.log("tripped");
      physics.speed = 0;
    }
    physics.speed = Math.max(
      Math.min(physics["speed"] + horse.acceleration, horse.maxSpeed),
      0
    );
    physics.position.x += physics.speed;
console.log(physics);
horses[horse.name] = {
  color: horse.color,
  position: physics.position,
  speed: 3,
  rank: 1,
};

    if (physics.position.x > 1000) {
      console.log("we have a winner", client);
      io.emit("over", horse.name);
    }
  });
//check here for position and update the horses to show their rank (1st 2nd 3rd)
  io.emit("frame", horses);

};

export const handleDisconnect = (clientKey) => {
  console.log("Bye Client: " + clientKey);
};

export const handleRaceOrder = (clientsList, clientKey, response) => {
  console.log("handling race order", "list", clientsList, "key", clientKey);
  response({
    order: Object.keys(clientsList).findIndex((client) => {
      return client == clientKey;
    }),
  });
};
