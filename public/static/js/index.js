const socket = io();
let currColor;

const nameBox = document.getElementById("name");
const giddyUpAudio = new Audio("./assets/audio/giddyUp.mp3");
nameBox.addEventListener("click", () => giddyUpAudio.play());

const newHorse = (name) => {
  socket.emit("newHorse", { name: name, color: currColor || 180 });
};
function changeColor() {
  currColor = document.getElementById("colorChooser").value;
  document.getElementById("horse").style.filter = `hue-rotate(${currColor}deg)`;
}
