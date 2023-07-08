import Horse from "./Horse.js";
import { isAllClientsReady } from "./server.js";
import {
  MAX_RANDOM_VALUE,
  ROADHEIGHT,
  FINISH_LINE,
  UPDATE_LOBBY_MESSAGE,
  START_RACE_MESSAGE,
  CLIENTS_LIST_SEND_MESSAGE,
  RACE_END_MESSGAE,
  FRAME_MESSAGE,
  SEND_STANDINGS_MESSAGE,
} from "./constants.js";

export const handleNewHorse = (request, clientKey, clients) => {
  const { name, color } = request;
  let uniqueName = name;
  let i = 1;
  const nonEmptyClients = Object.values(clients).filter((client) => {
    return client.horse && client.horse.name;
  });
  const isUniqueName = (name) => {
    return nonEmptyClients.some((client) => {
      return client.horse.name === name;
    });
  };

  while (isUniqueName(uniqueName)) {
    //guarantee unique name *faster way is to keep track of the biggest number used so far across all numbers, then add that number +1 to any repeated name
    uniqueName = name + i;
    i++;
  }

  clients[clientKey] = {
    horse: new Horse({ name: uniqueName, color: color }),
    ready: false,
  };
  console.log("New Horse Handled", request);
};

export const handleAskForHorse = (response, { user, clients, io }) => {
  if (Object.keys(user).length !== 0) {
    response({ horse: { name: user.horse.name, color: user.horse.color } });
  }
};

export const handleNewStats = (request, user) => {
  const { stats } = request;
  user.horse.stats = { ...user.horse.stats, ...stats };
};

export const handleLobbyJoin = (clients, io) => {
  console.log("someone joined lobby");
  io.emit(UPDATE_LOBBY_MESSAGE, getLobbyData(clients));
};

export const handleReady = (user, clientKey, clients, io) => {
  if (Object.keys(user).length === 0) {
    return;
  }
  user.ready = true;
  console.log("Readied up: " + clientKey);
  io.emit(UPDATE_LOBBY_MESSAGE, getLobbyData(clients));

  if (isAllClientsReady(clients)) {
    Object.keys(clients).forEach((client, i) => {
      const raceLane = (i / Object.keys(clients).length) * ROADHEIGHT;
      clients[client].physics = { speed: 0, position: { x: 0, y: raceLane } };
    });
    io.emit(START_RACE_MESSAGE, clients);
  } else {
    console.log("Not everyone is ready");
  }
};

export const handleClients = (socket, clients) => (user) => {
  socket.emit(CLIENTS_LIST_SEND_MESSAGE, getLobbyData(clients));
};

export const handleFrame = (clientsList, io) => {
  const horses = {};
  Object.keys(clientsList).forEach((client) => {
    const horse = clientsList[client].horse;
    const physics = clientsList[client].physics;
    if (Math.random() * MAX_RANDOM_VALUE > horse.balance) {
      physics.speed = 0;
    }
    physics.speed = Math.max(
      Math.min(physics["speed"] + horse.acceleration, horse.maxSpeed),
      0
    );
    physics.position.x += physics.speed;
    horses[horse.name] = {
      color: horse.color,
      position: physics.position,
      speed: physics.speed,
    };

    if (physics.position.x > FINISH_LINE) {
      console.log("we have a winner", client);
      io.emit(RACE_END_MESSGAE, horse.name);
    }
  });
  let horseNames = Object.keys(horses);
  horseNames.sort((a, b) => horses[b].position.x - horses[a].position.x);
  for (let i = 0; i < horseNames.length; i++) {
    horses[horseNames[i]].rank = i + 1;
  }
  io.emit(FRAME_MESSAGE, horses);
};

export const handleFinale = (clientKey, clients, socket) => {
  socket.emit(SEND_STANDINGS_MESSAGE, generateStandings(clientKey, clients));
};

export const getLobbyData = (clients) => {
  //returns ready and color as values for key horse name
  const horses = {};
  for (let client in clients) {
    if (clients[client].horse) {
      horses[clients[client].horse.name] = {
        ready: clients[client].ready,
        color: clients[client].horse.color,
      };
    }
  }
  return horses;
};

export const generateStandings = (clientKey, clients) => {
  const clientHorseName = clients[clientKey].horse.name;
  const horses = {};
  for (let client in clients) {
    horses[clients[client].horse.name] = clients[client].physics.position.x;
  }
  const names = Object.keys(horses);
  names.sort((a, b) => {
    return horses[a] - horses[b];
  });

  names.forEach((name, index) => {
    horses[name] = index;
  });
  return { myHorseName: clientHorseName, standings: horses };
};

export const handleDisconnect = (clientKey) => {
  console.log("Bye Client: " + clientKey);
};
