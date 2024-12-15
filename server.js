import express from "express";
import cors from "cors";
import { join } from "path";
import { Server } from "socket.io";
import session from "express-session";
import sharedsession from "express-socket.io-session";
import router from "./routes.js";
import {
  handleFinale,
  handleLobbyJoin,
  handleOver,
  handleClients,
  handleNewHorse,
  handleAskForHorse,
  handleNewStats,
  handleReady,
  handleFrame,
  handleDisconnect,
  getLobbyData,
} from "./socketHandlers.js";
import { MESSAGES, RACE_CONFIG } from "./constants.js";

const app = express(),
  port = process.env.PORT || 3007;

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: RACE_CONFIG.ONE_HOUR_IN_MILLISECONDS,
    secure: false,
    httpOnly: false,
    sameSite: "lax",
  },
});

app.use(sessionMiddleware);
app.use(express.json());
app.use(cors());
app.use(express.static(join(process.cwd(), "public")));

let clients = {};

const clearEmptyClients = () => {
  for (let client in clients) {
    if (Object.keys(clients[client]).length === 0) {
      delete clients[client];
    }
  }
};

app.use("/", router);

const server = app.listen(port, () => console.log("Horses are racing " + port));

const io = new Server(server);
io.use(sharedsession(sessionMiddleware, { autoSave: true }));

io.on("connection", (socket) => {
  const clientKey = socket.handshake.session.id;

  if (!clients[clientKey]) {
    clients[clientKey] = {};
  }

  const user = clients[clientKey];

  socket.on(MESSAGES.CLIENTS, handleClients(socket, clients));

  socket.on(MESSAGES.NEW_HORSE, (request) => {
    if (clients[clientKey] && clients[clientKey].horse) {
      return; // do NOT WANT MULTIPLE HORSES
    }
    try {
      handleNewHorse(request, clientKey, clients);
    } catch (error) {
      console.error(`YOU DONE TRY TO HAVE 2 HORSES COWBOY: ${error.message}`);
    }
  });

  socket.on(MESSAGES.ASK_FOR_HORSE, () => {
    if (!user || !user.horse) {
      console.error("NO HORSE.");
      socket.emit("redirect", "/");
      return;
    }
    handleAskForHorse({ horse: user.horse, socket: socket });
    console.log(user.horse.name);
  });

  socket.on(MESSAGES.JOIN_LOBBY, () => {
    if (Object.keys(user).length === 0) return;
    handleLobbyJoin(clients, io);
    if (!user.horse) {
      socket.emit("redirect", "/");
      socket.disconnect(true);
      return;
    }
  });

  socket.on(MESSAGES.READY, (request) => {
    clearEmptyClients();
    if (Object.keys(user).length === 0) return;
    handleNewStats(request, user);
    handleReady(user, clientKey, clients, io);
  });

  socket.on(MESSAGES.FRAME, () => {
    if (Object.keys(user).length === 0 || !user.horse) {
      console.log("User does not have a horse, ignoring frame.");
      return;
    }

    handleFrame(clients, io);
  });

  socket.on(MESSAGES.GET_STANDINGS, () => {
    if (Object.keys(user).length === 0) return;
    handleFinale(clientKey, clients, socket);
  });

  socket.on(MESSAGES.START_OVER, () => {
    if (Object.keys(user).length === 0) return;
    handleOver(clients);
    clients = {}; //reset FOR NEW RACE
  });

  socket.on(MESSAGES.DELETE_HORSE, () => {
    if (Object.keys(user).length === 0) return;
    clients[clientKey] = {};
    io.emit(MESSAGES.UPDATE_LOBBY, getLobbyData(clients));
  });
});

export const isAllClientsReady = (clientsList) => {
  return Object.values(clientsList).every((client) => client.ready);
};
