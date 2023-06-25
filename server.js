import express from "express";
import cors from "cors";
import { join } from "path";
import { Server } from "socket.io";
import session from "express-session";
import sharedsession from "express-socket.io-session";
import Horse from "./Horse.js";
import router from "./routes.js";
import {
  handleClients,
  handleNewHorse,
  handleAskForHorse,
  handleNewStats,
  handleReady,
  handleFrame,
  handleDisconnect,
  handleRaceOrder,
} from "./socketHandlers.js";

const app = express(),
  port = process.env.PORT || 3007;

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // sets the cookie to expire in 1 day
    secure: false, // true for https
    httpOnly: false, // if true prevents client side JS from reading the cookie
    sameSite: "lax", // protection against cross site request forgery attacks
  },
});

app.use(sessionMiddleware);
app.use(express.json());
app.use(cors());
app.use(express.static(join(process.cwd(), "public")));

const clients = {};

const testHorses = [
  new Horse({
    name: "Harold Jr.",
    stats: {
      balance: 10,
      weight: 10,
    },
  }),
  new Horse({
    name: "cade",
    color: { r: 255, g: 0, b: 0 },
    stats: {
      balance: 21,
      weight: 20,
    },
  }),
  new Horse({
    name: "LightningSmith",
    stats: {
      weight: 21,
      balance: 19,
    },
  }),
];

const testClientsList = {
  client1: {
    ready: false,
    horse: testHorses[0],
    physics: {
      speed: 0,
      position: {
        x: 0,
        y: 220,
      },
    },
  },
  client2: {
    ready: false,
    horse: testHorses[1],
    physics: {
      speed: 0,
      position: {
        x: 0,
        y: 250,
      },
    },
  },
  client3: {
    ready: false,
    horse: testHorses[2],
    physics: {
      speed: 0,
      position: {
        x: 0,
        y: 280,
      },
    },
  },
};

app.use("/", router);

const server = app.listen(port, () => console.log("Horses are racing " + port));
const io = new Server(server);

io.use(sharedsession(sessionMiddleware, { autoSave: true }));

Object.keys(testClientsList).forEach((client, i) => {
  const height = (i / Object.keys(testClientsList).length) * 100;
  testClientsList[client].physics = { speed: 0, position: { x: 0, y: height } };
});

io.on("connection", (socket) => {
  const clientKey = socket.handshake.session.id;
  clients[clientKey] = clients[clientKey] || {};

  const user = clients[clientKey];

  console.log("User Assigned", user, "Everyone", clients);
  socket.on("clients", handleClients(socket, clients));

  socket.on("newHorse", (socket) => {
    handleNewHorse(socket, clientKey, clients);
  });

  socket.on("askForHorse", (response) => {
    handleAskForHorse(response, user);
  });

  socket.on("newStats", (request) => {
    handleNewStats(request, user);
  });

  socket.on("ready", () => {
    for (let client in clients) {
      if (Object.keys(clients[client]).length === 0) {
        delete clients[client];
        console.log("Eliminated")
      }
    }
    handleReady(user, clientKey, clients, io);
  });

  socket.on("raceOrder", (response) =>
    handleRaceOrder(clients, clientKey, response)
  );

  socket.on("frame", () => {
    handleFrame(clients, io);
  });

  socket.on("disconnect", () => {
    handleDisconnect(clientKey);
  });
});

export const isAllClientsReady = (clients) => {
  const clientel = Object.values(clients);
  let counter = 0;
  for (let i = 0; i < clientel.length; i++) {
    if (clientel[i].ready === false) {
      counter++;
    }
  }
  return counter === 0;
  // return Object.values(clients).every((client) => client.ready === true);
};
