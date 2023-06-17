import "./scripts/p5.min.js";
const socket = io();

const main = (p) => {
  p.horse;
  p.horseImg;
  // p.preload = () => {
  //   // p.horseImg = p.loadImage("../assets/graphics/horse RGB f1.png");
  //   p.horseImg = p.loadImage("./assets/graphics/horse/horse RGB f2.png", () =>
  //     console.log("Image loaded successfully! hoe")
  //   );
  // };
  p.horses;
  p.setup = () => {
    const div = document.getElementById("raceCanvas");
    const { clientWidth, clientHeight } = div;
    console.log("CLH", clientHeight);
    let cnv = p.createCanvas(clientWidth, clientHeight);

    cnv.parent("raceCanvas");
    p.background(0);

    p.horses = makeHorses(p, 10);
  };

  p.showHorse = (horse) => {
    p.ellipse(horse.x, horse.y, 20);
    // p.image(p.horseImg, horse.x, horse.y);
  };

  p.draw = () => {
    let clientData;
    socket.emit("frame");
    socket.on("frame", (data) => {
      clientData = data;
    });
    Object.keys(clientData).forEach((client) => {
      const horse = clientData[client].physics;
      p.showHorse(horse);
    });
  };
};

const myP5 = new p5(main);
window.myP5 = myP5;
