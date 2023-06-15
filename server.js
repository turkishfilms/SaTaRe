import express from "express";
import { join } from "path";

const app = express(),
  // router = express.Router(),
  port = process.env.PORT || 3007;
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(join(process.cwd(), "public")));

const horses = [];

app.get("/", (req, res) => {});

app.post("/submitHorseName", (req, res) => {
  const { name: horse, id } = req.body;
  horses.push({ client: id, name: horse, stats: {} });
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
  console.log(horses)
});


app.get("/race", (req, res) => {
  res.sendFile(join(process.cwd(), "public/race.html"));
});


app.get("*", (req, res) => {
  console.log("req", req.body);
  console.log("you are a pumpkin");
});

// app.use("/", router);

const server = app.listen(port, () => console.log("lets go " + port));

const keepTrackOfClients = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Store the response object in the array of connected clients
  connectedClients.push(res);

  // Remove the response object from the array when the client disconnects
  req.on("close", () => {
    const index = connectedClients.indexOf(res);
    if (index !== -1) {
      connectedClients.splice(index, 1);
    }
  });
};

const areAllPlayersready = (players) => {
  return players.filter((player) => player == false);
  for (let i = 0; i < areAllPlayersready.length; i++) {
    if (players[i] == false) {
      return false;
    }
  }
};
