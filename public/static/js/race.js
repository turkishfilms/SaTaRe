import "./scripts/p5.min.js";
const socket = io();

socket.on("over", (winner) => {
  console.log(winner);
  noLoop();
});

const main = (p) => {
  p.horse;
  p.horseImg;
  p.backImg;
  p.pause = false;
  p.preload = () => {
    // p.horseImg = p.loadImage("../assets/graphics/horse RGB f1.png");
    p.backImg = p.loadImage(
      "./assets/graphics/horse/bg_mountains.png",
      () => console.log("Image2 loaded successfully!"),
      (err) => console.error("Error loading image:", err)
    );
    p.horseImg = p.loadImage(
      "./assets/graphics/horse/s_horseRun1.png",
      () => console.log("Image loaded barely!"),
      (err) => console.error("Error loading image:", err)
    );
  };
  p.setup = () => {
    p.frameRate(1);
    socket.on("frame", (data) => {
      console.log("data: ", data);
      // Object.keys(data).forEach((client) => {
      //   const horse = data[client].physics;
      //   p.showHorse(horse);
      image(horseImg)
    });
    const div = document.getElementById("raceCanvas");
    const { clientWidth, clientHeight } = div;
    console.log("CLH", clientHeight);
    let cnv = p.createCanvas(clientWidth, clientHeight);
    cnv.parent("raceCanvas");
    background()
  };

  p.showHorse = (horse) => {
    p.ellipse(horse.x, horse.y, 20);
    // p.image(p.horseImg, horse.x, horse.y);
  };

  p.keyPressed = () => {
    if (p.key == " ") {
      p.pause = !p.pause;
    }
  };

  p.draw = () => {
    if (!p.pause) {
      socket.emit("frame");
    }
  };
};

const myP5 = new p5(main);
window.myP5 = myP5;
