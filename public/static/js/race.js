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
      "./assets/graphics/horse/s_horseRunG1.png",
      () => console.log("Image loaded barely!"),
      (err) => console.error("Error loading image:", err)
    );
    p.horseImg2 = p.loadImage(
      "./assets/graphics/horse/s_horseRun2S.png",
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
          p.showHorse({ name: horse, position: data[horse].position,color:data[horse].color });
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

p.addFilter = (image,color)=>{
   loadPixels();
   for (let y = 0; y < height; y++) {
     for (let x = 0; x < width; x++) {
       const index = (x + y * width) * 4;
       const r = pixels[index + 0];
       const g = pixels[index + 1];
       const b = pixels[index + 2];
       const a = pixels[index + 3];
       if (a !== 0) {
         pixels[index + 0] += color.r
         pixels[index + 1] += color.g
         pixels[index + 2] += color.b
       }
     }
   }
      updatePixels(); 
}

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
    p.addFilter(image, horse.color);
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
