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

const server = app.listen(port, () => console.log("lets go " + port));
const io = new Server(server);

io.use(sharedsession(sessionMiddleware, { autoSave: true }));

io.on("connection", (socket) => {
  console.log("New connection: " + socket.id);

  const clientKey = socket.handshake.session.id;
  for (let key in clients) {
    console.log("bag", key);
  }

  if (
    Object.keys(clients).find((key) => {
      return key === clientKey;
    }) == undefined
  ) {
    // socket.handshake.session.clientId =
    // Date.now().toString() + Math.floor(Math.random()).toString();
    // socket.handshake.session.save();
    clients[clientKey] = {};
    console.log("Handshake started, New Client Added: " + clientKey);
  } else {
    console.log("You have been here before: " + clientKey);
  }

  socket.on("newHorseName", (request, response) => {
    console.log("New name entered");
    const horseName = request;
    clients[clientKey] = {
      horse: new Horse({ name: horseName }),
      ready: false,
    };
    const somrh = Object.keys(clients[clientKey].horse);
    console.log(somrh, "somrh", somrh.length);
    for (let i = 0; i < somrh.length; i++) {
      console.log("YAAAAAAA", somrh[i]);
    }
    console.log("New horse " + horseName + " was added");
    console.log(clients);
    response({ yeah: clients });
  });

  socket.on("askForHorse", (response) => {
    console.log(
      "Horse name was asked for by: ",
      clientKey,
      clients[clientKey].horse
    );
    response({ name: clients[clientKey].horse });
  });

  socket.on("newStats", (request, response) => {
    const { name, stats } = request;
    console.log(name, " Is getting new stats!: " + stats);
    const horse = clients[clientKey].horse; //FIXME: Random horse instead of clients
    horse.stats = { ...horse.stats, ...stats };
    console.log(clients);
  });

  socket.on("ready", () => {
    const client = clients[clientKey]; //FIXME: find the horse based on id
    client.ready = true;
    console.log("ready ready " + socket.id, clients);
    if (isAllClientsReady()) {
      io.emit("start", clients);
    }
  });

  socket.on("disconnect", () => {
    console.log(
      "Left-- Socket: " + socket.id + "Client: " + socket.handshake.session.id
    );
  });
});

const isAllClientsReady = () => {
  return Object.values(clients).every((client) => client.ready === true);
};
