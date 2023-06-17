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
// filled with key =id, value= {horse:Horse, ready:Bool}

app.use("/", router);

const server = app.listen(port, () => console.log("Horses are racing " + port));
const io = new Server(server);
console.log("starting tribe: ", Object.keys(clients).length);
io.use(sharedsession(sessionMiddleware, { autoSave: true }));

io.on("connection", (socket) => {
  const clientKey = socket.handshake.session.id;
  console.log("Howdy: ", clientKey);
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
    let newHorse = new Horse({ name: horseName });
    clients[clientKey] = {
      horse: newHorse,
      ready: false,
    };
    console.log("New horse " + horseName + " was added");
  });

  socket.on("askForHorse", (response) => {
    console.log("Horse name was asked for by: ", clientKey, user.horse.name);
    response({ horse: { name: user.horse.name }, name: user.horse.name });
  });

  socket.on("newStats", (request, response) => {
    const { stats } = request;
    console.log("reg", request);
    console.log(user, " Is getting new stats!: " + stats);
    const horse = user.horse;
    console.log("WHAT THE DEVIL", JSON.stringify(clients));
    horse.stats = { ...horse.stats, ...stats };
  });

  socket.on("ready", () => {
    const client = user;
    client.ready = true;
    console.log("Readied up: " + clientKey);

    if (isAllClientsReady(clients)) {
      Object.keys(clients).forEach((client) => {
        clients[client].physics = { speed: 0, position: { x: 0, y: 0 } };
      });
      io.emit("start", clients);
    } else {
      console.log("Not everyone is ready");
    }
  });

  socket.on("frame", () => {
    io.emit("frame", nextFrame(testClientsList));
  });

  socket.on("disconnect", () => {
    
    console.log("Bye Client: " + socket.handshake.session.id);
  });
});

const isAllClientsReady = (clients) => {
  return Object.values(clients).every((client) => client.ready === true);
};

const nextFrame = (clientList) => {
  Object.keys(clientList).forEach((client) => {
    const horse = clientList[client].horse;
    const physics = clientList[client].physics;
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
  return clientList;
};
