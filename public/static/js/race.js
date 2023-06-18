import "./scripts/p5.min.js";
const socket = io();

// socket.emit("askForHorse", ({ horse }) => {
//   const name = horse.name;
//   console.log("horse", horse);
//   console.log("name", name);
// });

const main = (p) => {
  const { clientWidth, clientHeight } = document.getElementById("raceCanvas");
  p.clientHeight = clientHeight;
  p.clientWidth = clientWidth;
  p.horseImg;
  p.backImg;
  p.order;

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
    p.frameRate(60);

    socket.on("frame", (data) => {
      p.clear()
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
    // console.log("horse shown, "+horse)
    const y = p.clientHeight - 100 - horse.position.y;
    p.text(horse.name, horse.position.x, y);
    p.image(
      p.frameCount % 3 == 0 ? p.horseImg : p.horseImg2,
      horse.position.x,
      y
    );
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
      // p.clear();
  };
};

const myP5 = new p5(main);
window.myP5 = myP5;
