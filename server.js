import express from "express";
import cors from "cors";
import { join } from "path";
import { Server } from "socket.io";
import session from "express-session";
import sharedsession from "express-socket.io-session";
import Horse from "./Horse.js";
import router from "./routes.js";
import {
  handleNewHorseName,
  handleAskForHorse,
  handleNewStats,
  handleReady,
  handleFrame,
  handleDisconnect,
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

const testHorse = new Horse({
  name: "Harold",
  stats: {
    balance: 11,
    weight: 20,
  },
});

const testClientsList = {
  client1: {
    ready: false,
    horse: new Horse({ name: "cade", stats: { balance: 100, weight: 100 } }),
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
    horse: testHorse,
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
    horse: testHorse,
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

io.on("connection", (socket) => {
  const clientKey = socket.handshake.session.id;
  console.log("Howdy: ", clientKey);
  clients[clientKey] = clients[clientKey] || {};

  const user = clients[clientKey];

  socket.on("newHorseName", (socket) => {
    handleNewHorseName(socket, clientKey, clients);
  });

  socket.on("askForHorse", (response) => {
    handleAskForHorse(response, user);
  });

  socket.on("newStats", (request) => {
    handleNewStats(request, user);
  });

  socket.on("ready", () => {
    handleReady(user, clientKey, clients, io);
  });

  socket.on("frame", () => {
    handleFrame(clients, io);
  });

  socket.on("disconnect", () => {
    handleDisconnect(clientKey);
  });
});

export const isAllClientsReady = (clients) => {
  return Object.values(clients).every((client) => client.ready === true);
};
