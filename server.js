import express from "express";

const app = express(),
  port = process.env.PORT || 3007,
  server = app.listen(port, () => console.log(`Preach It!! ${port}`));

app.use(express.static("public"));
