const socket = io();

const newHorseName = (name) => {
  socket.emit("newHorseName", name);
};
