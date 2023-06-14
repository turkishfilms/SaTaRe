import express from "express";
import { join } from "path";
import ejs from "ejs";

const app = express(),
  // router = express.Router(),
  port = process.env.PORT || 3007;
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(join(process.cwd(), "public")));

app.get("/", (req, res) => {
  console.log("brokeboi");
  res.sendFile(join(process.cwd(), "public/index.html"));
  keepTrackOfClients(req, res);
});

app.get("/race", (req, res) => {
  res.sendFile(join(process.cwd(), "public/race.html"));
});

app.get("/train", (req, res) => {
  console.log("entered training")
  res.sendFile(join(process.cwd(), "public/train.html"));
});

app.post("/horse", (req, res) => {
  const horse = req.body.name;
  horses.push({ client: id, name: horse });
  console.log("new horse " + horse + " was added");
});

app.post("/statsUp", (req, res) => {
  const horse = horses.find((horsey) => horsey.name === req.body.name);
  const { stats } = req.body;
  horse.stats = { ...horse.stats, ...stats };
  console.log(" horse " + horse + " was updated");
});

app.get("/horseName", (req, res) => {
  res.send(horses[horses.length - 1]);
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

const horses = [];

const areAllPlayersready = (players) => {
  return players.filter((player) => player == false);
  for (let i = 0; i < areAllPlayersready.length; i++) {
    if (players[i] == false) {
      return false;
    }
  }
};
