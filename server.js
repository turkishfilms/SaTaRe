import express from "express";
import { join } from "path";

const app = express(),
  // router = express.Router(),
  port = process.env.PORT || 3007;

app.use(express.static(join(process.cwd(), "public")));

app.get("/", (req, res) => {
  res.sendFile(join(process.cwd(), "public/index.html"));
});

app.get("/race", (req, res) => {
  res.sendFile(join(process.cwd(), "public/race.html"));
});

app.get("*", (req, res) => {
  res.send("you are a pumpkin");
});

// app.use("/", router);

const server = app.listen(port, () => console.log("lets go " + port));
