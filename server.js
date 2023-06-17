import express from "express";
import { join } from "path";
import { Server } from "socket.io";
import session from "express-session";
import sharedsession from "express-socket.io-session";
import Horse from "./Horse.js";

const app = express(),
  port = process.env.PORT || 3007;

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: false,
});

app.use(sessionMiddleware);
app.use(express.json());

app.use(express.static(join(process.cwd(), "public")));

const clients = [];
// filled with {clientId:id, horse:Horse, ready:Bool}

app.get("/train", (req, res) => {
  console.log("entered training");
  res.sendFile(join(process.cwd(), "public/train.html"));
});

app.get("/race", (req, res) => {
  console.log("off to the races");
  res.sendFile(join(process.cwd(), "public/race.html"));
});

app.get("*", (req, res) => {
  console.log("wildcard activated", "Someone's off the map");
});

// app.use("/", router);
const server = app.listen(port, () => console.log("lets go " + port));
const io = new Server(server);

io.use(sharedsession(sessionMiddleware, { autoSave: true }));

io.on("connection", (request) => {
  const socket = request;
  console.log(socket.id + "Just Joined");

  if (!socket.handshake.session.clientId) {
    socket.handshake.session.clientId =
      Date.now().toString() + Math.random().toPrecision(2).toString();
    socket.handshake.session.save();
  }

  socket.on("giveHorse", (request, response) => {
    console.log("give horse");
    const horseName = request;
    clients.push({
      clientId: socket.id,
      horse: new Horse({ name: horseName }),
      ready: false,
    });
    console.log("New horse " + horseName + " was added");
    console.log(clients);
  });

  socket.on("askForHorse", (message, response) => {
    console.log("Horse name was asked for: ", message);
    response({ name: clients[clients.length - 1].horse.name });
  });

  socket.on("newStats", (request, response) => {
    const { name, stats } = request;
    console.log(name, " Is getting new stats!: " + stats);
    const horse = clients[Math.floor(Math.random() * clients.length)].horse; //FIXME: Random horse instead of clients
    horse.stats = { ...horse.stats, ...stats };
    console.log(clients);
  });

  socket.on("ready", () => {
    const r = Math.floor(Math.random() * clients.length);

    const client = clients[r]; //FIXME: find the horse based on clientID
    client.ready = true;
    console.log("ready ready " + socket.id, clients);
    if (isAllClientsReady()) {
      io.emit("start", clients);
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
  });
});

const isAllClientsReady = () => {
  return (
    clients.filter((client) => client.ready !== true).length == 0
  );
};
