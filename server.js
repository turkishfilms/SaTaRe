import express from "express";
import cors from "cors";
import { join } from "path";
import { Server } from "socket.io";
import session from "express-session";
import sharedsession from "express-socket.io-session";
// import Horse from "./Horse.js";
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

const app = express(),
  port = process.env.PORT || 3007;

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000, // sets the cookie to expire in 1 hour
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

const clearEmptyClients = ()=>{
    for (let client in clients) {
      if (Object.keys(clients[client]).length === 0) {
        delete clients[client];
      }
    }
}

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

  console.log("User Assigned", user.horse ? user.horse.name:user, "Everyone", clientNames);

  socket.on("clients", handleClients(socket, clients));

  socket.on("newHorse", (socket) => {
    handleNewHorse(socket, clientKey, clients);
  });

  socket.on("askForHorse", (response) => {
    if (Object.keys(user).length === 0) return;
    handleAskForHorse(response, { user: user, clients: clients, io: io });
  });

  socket.on("joinLobby", () => {
    if (Object.keys(user).length === 0) return;
    handleLobbyJoin(clients, io);
  });

  socket.on("ready", (request) => {
    clearEmptyClients();
    if (Object.keys(user).length === 0) return;
    handleNewStats(request, user);
    handleReady(user, clientKey, clients, io);
  });

  socket.on("frame", () => {
    if (Object.keys(user).length === 0) return;
    handleFrame(clients, io);
  });

  socket.on("getStandings", () => {
    if (Object.keys(user).length === 0) return;
    handleFinale(clientKey, clients, socket);
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
};
