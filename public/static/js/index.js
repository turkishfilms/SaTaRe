const socket = io();
let currColor;

const nameBox = document.getElementById("name");
const giddyUpAudio = new Audio("./assets/audio/giddyUp.mp3");

const newHorseName = (name) => {
  socket.emit("newHorseName", { name: name, color: currColor || 180 });
};
function changeColor() {
  nameBox.addEventListener("click", () => giddyUpAudio.play());
  currColor = document.getElementById("colorChooser").value;
  document.getElementById("horse").style.filter = `hue-rotate(${currColor}deg)`;
}
