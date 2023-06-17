const socket = io();
socket.on("connect");

const newHorseName = (name) => {
  socket.emit("newHorseName", name);
};
