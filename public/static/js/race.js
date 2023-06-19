import "./scripts/p5.min.js";
const socket = io();

// socket.emit("askForHorse", ({ horse }) => {
//   const name = horse.name;
//   console.log("horse", horse);
//   console.log("name", name);
// });

const main = (p) => {
  p.clientHeight;
  p.clientWidth;
  p.horseImg;
  p.horseImg2;
  p.horseImg3;
  p.order = 1;

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
    p.horseImg3 = p.loadImage(
      "./assets/graphics/horse/s_horse.png",
      () => console.log("Image loaded fully!"),
      (err) => console.error("Error loading image:", err)
    );
  };

  p.setup = () => {
    const div = document.getElementById("raceCanvas");
    const { clientWidth, clientHeight } = div;
    p.clientHeight = clientHeight;
    p.clientWidth = clientWidth;

    p.frameRate(60);

    socket.on("frame", (data) => {
      p.clear();
      Object.keys(data).forEach((horse) => {
        p.showHorse({ name: horse, position: data[horse].position });
      });
    });

    socket.on("over", (winner) => {
      console.log(winner);
      p.noLoop();
    });

    socket.emit("raceOrder", (order) => {
      p.order = order;
    });

    let cnv = p.createCanvas(p.clientWidth, p.clientHeight);
    cnv.parent("raceCanvas");
  };

  p.showHorse = (horse) => {
    const win = 50;
    let x = horse.position.x
    let y = p.clientHeight - 100 - horse.position.y;
    let textX = horse.position.x;
    let textY = p.clientHeight - 100 - horse.position.y;
    let pic;

    if (p.frameCount % win <= (2 * win) / (win/10)) {
      pic = p.horseImg2;
    } else if (p.frameCount % win <= (4 * win) / (win/10)) {
      pic = p.horseImg;
    } else {
      y = p.clientHeight - 85 - horse.position.y;
      x = horse.position.x + 10
      pic = p.horseImg3;
    }

    p.text(horse.name, textX, textY);
    p.image(pic, x, y);
  };

  p.keyPressed = () => {
    if (p.key === " ") {
      p.order = -1;
    }
  };

  p.draw = () => {
    if (p.order == -1) {
      socket.emit("frame");
    }
  };
};

const myP5 = new p5(main);
window.myP5 = myP5;
