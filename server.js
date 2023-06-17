import express from "express";
import cors from "cors";
import { join } from "path";
import { Server } from "socket.io";
import session from "express-session";
import sharedsession from "express-socket.io-session";
import Horse from "./Horse.js";
import router from "./routes.js";

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
// filled with key =id, value= {horse:Horse, ready:Bool}

app.use("/", router);

const server = app.listen(port, () => console.log("Horses are racing " + port));
const io = new Server(server);

io.use(sharedsession(sessionMiddleware, { autoSave: true }));

io.on("connection", (socket) => {
  const clientKey = socket.handshake.session.id;
  if (
    Object.keys(clients).find((key) => {
      return key === clientKey;
    }) == undefined
  ) {
    clients[clientKey] = {};
  }
  const user = clients[clientKey];

  socket.on("newHorseName", (request) => {
    const horseName = request;
    clients[clientKey] = {
      horse: new Horse({ name: horseName }),
      ready: false,
    };
    console.log("here is the new client  entry: ", JSON.stringify(user));
    console.log("New horse " + horseName + " was added");
  });

  socket.on("askForHorse", (response) => {
    console.log("Horse name was asked for by: ", clientKey, user.horse.name);
    console.log(Object.keys(user["horse"]));
    response({ name: user.horse.name });
  });

  socket.on("newStats", (request, response) => {
    const { name, stats } = request 
    console.log(name, " Is getting new stats!: " + stats);
    const horse = user.horse;
    console.log("WHAT THE DEVIL", JSON.stringify(clients));
    horse.stats = { ...horse.stats, ...stats };
  });

  socket.on("ready", () => {
    const client = user;
    client.ready = true;
    console.log("Readied up: " + clientKey);
    if (isAllClientsReady()) {
      Object.keys(clients).forEach((client) => {
        clients[client].physics = { speed: 0, position: { x: 0, y: 0 } };
      });
      io.emit("start", clients);
    } else {
      console.log("Not everyone is ready");
    }
  });

  socket.on("frame", () => {
    io.emit("frame", nextFrame());
  });

  socket.on("disconnect", () => {
    console.log("Bye Client: " + socket.handshake.session.id);
  });
});

const isAllClientsReady = () => {
  return Object.values(clients).every((client) => client.ready === true);
};

const nextFrame = () => {
  Object.keys(clients).forEach((client) => {
    const horse = clients[client.horse];
    const physics = clients[client].physics;

    if (Math.random(100) < horse.stats.balance) {
      console.log(client, "tripped");
    }

    physics.speed = Math.max(
      Math.min(physics.speed + horse.stats.acceleration, horse.stats.maxSpeed),
      0
    );

    physics.position.x += physics.speed;
  });

  return clients;
};
