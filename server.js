import express from "express";
import path from "path";

const app = express(),
  router = express.Router(),
  port = process.env.PORT || 3007;
// app.use(express.static("public"));

router.get("/", (req, res) => {
  res.sendFile("/public/index.html");
});

router.get("*", (req, res) => {
  res.send("you are a pumpkin");
});

app.use("/", router);

const server = app.listen(port,() => console.log("lets go " + port));
