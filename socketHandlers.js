import Horse from "./Horse.js";
import { isAllClientsReady } from "./server.js";

export const handleNewHorseName = (request, clientKey, clients) => {
  const horseName = request;
  console.log("handler", request);
  let newHorse = new Horse({ name: horseName });
  clients[clientKey] = {
    horse: newHorse,
    ready: false,
  };
  console.log("New horse " + horseName + " was added");
};

export const handleAskForHorse = (response, user) => {
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
    Object.keys(clients).forEach((client) => {
      clients[client].physics = { speed: 0, position: { x: 0, y: 0 } };
    });
    io.emit("start", clients);
  } else {
    console.log("Not everyone is ready", clients);
  }
};

export const handleFrame = (clients, io) => {
  Object.keys(clients).forEach((client) => {
    const horse = clients[client].horse;
    const physics = clients[client].physics;
    if (Math.random() * 100 < horse["stats"].balance) {
      console.log("tripped");
      physics.speed = 0;
    }
    physics.speed = Math.max(
      Math.min(physics["speed"] + horse.acceleration, horse.maxSpeed),
      0
    );

    physics.position.x += physics.speed;
    if (physics.position.x > 1000) {
      console.log("we have a winner", client);
      io.emit("over", horse.name);
    }
  });

  io.emit("frame", clients);
};

export const handleDisconnect = (clientKey) => {
  console.log("Bye Client: " + clientKey);
};
