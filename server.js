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
  handleClients,
  handleNewHorse,
  handleAskForHorse,
  handleNewStats,
  handleReady,
  handleFrame,
  handleDisconnect,
} from "./socketHandlers.js";
import {
  ASK_FOR_HORSE_MESSAGE,
  CLIENTS_MESSAGE,
  FRAME_MESSAGE,
  GET_STANDINGS_MESSAGE,
  JOIN_LOBBY_MESSAGE,
  NEW_HORSE_MESSAGE,
  READY_MESSAGE,
  ONE_HOUR_IN_MILLISECONDS,
} from "./constants.js";

const app = express(),
  port = process.env.PORT || 3007;

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: ONE_HOUR_IN_MILLISECONDS,
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
  clients[clientKey] = clients[clientKey] || {}; //FIXME: add supprt for arrays and stuff this need to be more thougtul

  const user = clients[clientKey];

  let clientNames = Object.values(clients)
    .filter((client) => client.horse && client.horse.name)
    .map((client) => client.horse.name);

  console.log(
    "User Assigned",
    user.horse ? user.horse.name : user,
    "Everyone",
    clientNames
  );

  socket.on(CLIENTS_MESSAGE, handleClients(socket, clients));

  socket.on(NEW_HORSE_MESSAGE, (socket) => {
    try {
      handleNewHorse(socket, clientKey, clients);
    } catch (error) {
      console.error(`Error handling new horse: ${error.message}`);
      socket.emit("error", {
        message: "An error occurred while creating a new horse.",
      });
    }
  });

  socket.on(ASK_FOR_HORSE_MESSAGE, (response) => {
    if (Object.keys(user).length === 0) return;
    handleAskForHorse(response, { user: user, clients: clients, io: io });
  });

  socket.on(JOIN_LOBBY_MESSAGE, () => {
    if (Object.keys(user).length === 0) return;
    handleLobbyJoin(clients, io);
  });

  socket.on(READY_MESSAGE, (request) => {
    clearEmptyClients();
    if (Object.keys(user).length === 0) return;
    handleNewStats(request, user);
    handleReady(user, clientKey, clients, io);
  });

  socket.on(FRAME_MESSAGE, () => {
    if (Object.keys(user).length === 0) return;
    handleFrame(clients, io);
  });

  socket.on(GET_STANDINGS_MESSAGE, () => {
    if (Object.keys(user).length === 0) return;
    handleFinale(clientKey, clients, socket);
  });

  socket.on("disconnect", () => {
    handleDisconnect(clientKey);
  });
});

export const isAllClientsReady = (clientsList)=>{
  return Object.values(clientsList).every((client)=>{
    return client.ready
  })
}
