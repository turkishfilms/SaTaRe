import Horse from "./Horse.js";
import { isAllClientsReady } from "./server.js";

export const ROADHEIGHT = 100;

export const handleNewHorse = (request, clientKey, clients) => {
  const { name, color } = request;
  let newHorse = new Horse({ name: name, color: color });
  clients[clientKey] = {
    horse: newHorse,
    ready: false,
  };
  console.log("New Horse Handled", request);
};

export const handleAskForHorse = (response, {user,clients,io}) => {
  if (Object.keys(user).length !== 0) {
    // console.log("Horse name was asked for by: ", user.horse.name);
    console.log("wtw", clients)
    io.emit("updateReadied", getReadiness(clients))
    response({ horse: { name: user.horse.name }, name: user.horse.name });
  }
};

export const handleNewStats = (request, user) => {
  const { stats } = request;

  const horse = user.horse;
  horse.stats = { ...horse.stats, ...stats };
  console.log(user.horse.name, " Is getting new stats!: " + stats);
};

export const handleReady = (user, clientKey, clients, io) => {
  const client = user;
  client.ready = true;
  console.log("Readied up: " + clientKey);

  if (Object.keys(user).length === 0) {
    return;
  }
  const horses = getReadiness(clients)
  io.emit("updateReadied", horses);

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

export const handleClients = (socket, clients) => (user) => {
  console.log("clients asked for", clients, "by", user);
  // if (Object.keys(user).length !== 0) {
  console.log("omg he sent it");
  const horses = getReadiness(clients);
  console.log(
    "about to send out horses, it looks like this: ",
    horses,
    horses instanceof Map
  );
  socket.emit("clientsSend", horses);
  //
};

export const handleFrame = (clientsList, io) => {
  const horses = {};
  // console.log("Handling frame: ClientsList", clientsList)
  Object.keys(clientsList).forEach((client) => {
    const horse = clientsList[client].horse;
    const physics = clientsList[client].physics;
    if (Math.random() * 100 > horse.balance) {
      physics.speed = 0;
    }
    physics.speed = Math.max(
      Math.min(physics["speed"] + horse.acceleration, horse.maxSpeed),
      0
    );
    physics.position.x += physics.speed;
    horses[horse.name] = {
      //problematic, multiple identical keys possible
      color: horse.color,
      position: physics.position,
      speed: physics.speed,
    };

    if (physics.position.x > 1000) {
      console.log("we have a winner", client);
      io.emit("over", horse.name);
    }
  });
  let horseNames = Object.keys(horses);
  horseNames.sort((a, b) => horses[b].position.x - horses[a].position.x);
  for (let i = 0; i < horseNames.length; i++) {
    horses[horseNames[i]].rank = i + 1;
  }
  io.emit("frame", horses);
};

export const handleDisconnect = (clientKey) => {
  console.log("Bye Client: " + clientKey);
};

export const getReadiness = (clients) => {
  console.log("bloatwareready", clients)
  const horses = new Map();
  for (let client in clients) {
    // console.log("idiota",client)
    if (clients[client].horse) {
      console.log("same", client, clients[client].horse);
      horses.set(clients[client].horse.name, { ready: clients[client].ready });
      console.log("curretn state of horses", horses);
    }
  }
  return Object.fromEntries(horses);
};
