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
});

app.get("/race", (req, res) => {
  res.sendFile(join(process.cwd(), "public/race.html"));
});

app.get("/train", (req, res) => {
  res.sendFile(join(process.cwd(), "public/train.html"));
});

app.post("/horse", (req, res) => {
  const horse = req.body.name;
  horses.push(horse);
  console.log("new horse " + horse + " was added");
});

app.post("/statsUp", (req, res) => {
  const horse = req.body.name;
  const stats = req.body.stats
  for(let stat in stats){
    horses
  }
  horses.push(horse);
  console.log("new horse " + horse + " was added");
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

const horses = [];

const areAllPlayersready = (players) => {
  return players.filter((player) => player == false);
  for (let i = 0; i < areAllPlayersready.length; i++) {
    if (players[i] == false) {
      return false;
    }
  }
};
