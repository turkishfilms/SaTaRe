import "./scripts/p5.min.js";
const socket = io();

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
  };

  p.setup = () => {
    const div = document.getElementById("raceCanvas");
    const { clientWidth, clientHeight } = div;
    p.clientHeight = clientHeight;
    p.clientWidth = clientWidth;

    p.frameRate(60);

    socket.on("frame", (data) => {
      p.clear();
      Object.keys(data)
        .reverse()
        .forEach((horse) => {
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
    const cadence = 1 / 2;
    const animationWindow = 20;
    const x = horse.position.x;
    const y = p.clientHeight - 100 - horse.position.y;
    const pic =
      p.frameCount % animationWindow <= animationWindow / cadence
        ? p.horseImg
        : p.horseimg2;
    p.text(horse.name, x, y);
    p.image(pic, x, y);

    // p.blendMode(p.MULTIPLY);
    // console.log(horse)
    // const col = horse.color;
    // p.fill(col[0], col[1], col[2], 100); // Adjust color and transparency here
    // p.rect(yx, y, pic.width, pic.height);

    // p.blendMode(p.BLEND);
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
