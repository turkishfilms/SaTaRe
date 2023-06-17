import "./scripts/p5.min.js";
const socket = io();

// socket.emit("askForHorse", ({ horse }) => {
//   const name = horse.name;
//   console.log("horse", horse);
//   console.log("name", name);
// });

const main = (p) => {
  p.horse;
  p.horseImg;
  p.backImg;
  p.pause = false;
  p.cir = true;
  p.x = 100;
  p.preload = () => {
    p.horseImg = p.loadImage(
      "./assets/graphics/horse/s_horseRun1.png",
      () => console.log("Image loaded barely!"),
      (err) => console.error("Error loading image:", err)
    );
    p.horseImg2 = p.loadImage(
      "./assets/graphics/horse/s_horseRun2.png",
      () => console.log("Image loaded fully!"),
      (err) => console.error("Error loading image:", err)
    );
  };
  p.setup = () => {
    p.frameRate(2);
    socket.on("frame", (data) => {
      Object.keys(data).forEach((client) => {
        const horse = data[client].physics.position;
        p.showHorse(horse);
      });
    });
    socket.on("over", (winner) => {
      console.log(winner);
      p.noLoop();
    });
    const div = document.getElementById("raceCanvas");
    const { clientWidth, clientHeight } = div;
    let cnv = p.createCanvas(clientWidth, clientHeight);
    cnv.parent("raceCanvas");
    // p.background(150);
    p.fill(255);
  };

  p.showHorse = (horse) => {
    // p.ellipse(horse.x, horse.y, 20);

    p.image(p.frameCount % 2 == 0 ? p.horseImg : p.horseImg2, horse.x, horse.y);
  };

  p.keyPressed = () => {
    if (p.key == " ") {
      p.pause = !p.pause;
    }
  };

  p.draw = () => {
    if (!p.pause) {
      p.clear();
      socket.emit("frame");
    }
  };
};

const myP5 = new p5(main);
window.myP5 = myP5;
