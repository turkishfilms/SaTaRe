import express from "express";
import { join } from "path";
import { Server } from "socket.io";
import session from "express-session";
import sharedsession from "express-socket.io-session";

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

const horses = [];
// filled with {client id, Horse}

app.post("/submitHorseName", (req, res) => {
  const { name: horse, id } = req.body;
  horses.push({ client: id, name: horse, stats: {} }); // client and Horse
  console.log("new horse " + horse + " was added");
});

app.get("/train", (req, res) => {
  console.log("entered training");
  res.sendFile(join(process.cwd(), "public/train.html"));
});

app.get("/retrieveHorseName", (req, res) => {
  console.log("they asked  for ", horses[horses.length - 1]);
  res.send(horses[horses.length - 1]);
});

app.post("/statsUp", (req, res) => {
  const { name: name, stats } = req.body;
  const horse = horses.find((h) => h.name == name);
  horse.stats = { ...horse.stats, ...stats };
  console.log(" horse " + horse + " was updated");
  console.log(horses);
});

app.get("/race", (req, res) => {
  console.log("off to the races, ");
  res.sendFile(join(process.cwd(), "public/race.html"));
});

app.get("*", (req, res) => {
  console.log("req", req.body);
  console.log("you are a pumpkin");
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
  // response({ clientId: socket.handshake.session.clientId });

  socket.on("giveHorse", (request, response) => {
    const horse = request;
    horses.push({ clientId: socket.id, name: horse, stats: {} });
    console.log("new horse " + horse + " was added");
  });

  socket.on("askForHorse", (message, response) => {
    console.log("yay", message);
    response({ name: horses[horses.length - 1] });
  });

  socket.on("newStats", (request, response) => {
    const { name, stats } = request;
    const mainHorse = horses[Math.floor(Math.random() * horses.length)];
    mainHorse.stats = { ...mainHorse.stats, ...stats };
    console.log(horses);
  });

  socket.on("ready", () => {
    const r = Math.floor(Math.random() * horses.length);

    const ourHorse = horses[r]; //FIXME: find the horse based on clientID
    ourHorse.ready = true;
    console.log("ready ready " + socket.id, horses);
    if (isAllHorsesReady()) {
      io.emit("start", horses);
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
  });
});

const isAllHorsesReady = () => {
  return horses.filter((horse) => horse.ready == false);
};
