import "./scripts/p5.min.js" 

const socket = io();

const main = (p) => {
  p.clientHeight;
  p.clientWidth;
  p.horseImg;
  p.horseImg2;
  p.horseImg3;
  p.order = 1;
  p.horses = new Map();
  
  p.sendClients = () => {
    socket.emit("clients", {}, (data) => {
      console.log(data);
    });
  };
  
  p.preload = () => {
    p.horseImg = p.loadImage(
      "/assets/graphics/horse/s_horseRunG1.png",
      () => console.log("Image loaded barely!"),
      (err) => console.error("Error loading image:", err)
    );
    p.horseImg2 = p.loadImage(
      "/assets/graphics/horse/s_horseRunG2.png",
      () => console.log("Image loaded fully!"),
      (err) => console.error("Error loading image:", err)
    );
  };

  p.setup = () => {
    // p.loop();
    const div = document.getElementById("raceCanvas");
    const { clientWidth, clientHeight } = div;
    p.clientHeight = clientHeight;
    p.clientWidth = clientWidth;
    p.frameRate(60);
    socket.on("frame", (data) => {
      p.clear();

      console.log("noway", p.horses);
      if (p.horses.size === 0) {
        Object.keys(data)
          .reverse()
          .forEach((horse) => {
            debugger
            p.horses.set(data[horse].position.y, {
              name: horse,
              images: [
                p.addFilter(p.horseImg.get(), data[horse].color),
                p.addFilter(p.horseImg2.get(), data[horse].color),
              ],
            });
          });
      }
      console.log("hey", p.horses);

      Object.keys(data)
        .reverse()
        .forEach((horse) => {
          p.showHorse({
            name: horse,
            position: data[horse].position,
            color: data[horse].color,
          });
        });
    });
    p.horses.set(200, {name:"harvey", color:{r:255,g:0,b:0,a:25}})

socket.emit("frame")
    socket.on("over", (winner) => {
      console.log(winner);
      // p.noLoop();
    });

    // socket.emit("raceOrder", (order) => {
    // p.order = order;
    // });

    let cnv = p.createCanvas(p.clientWidth, p.clientHeight);
    cnv.parent("raceCanvas");
  };

  p.addFilter = (img, { r, g, b, a }) => {
    img.loadPixels();
    console.log("filtering");
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        let index = 4 * (j * img.width + i);
        let alpha = img.pixels[index + 3];

        if (alpha !== 0) {
          // if pixel is not transparent
          img.pixels[index] = img.pixels[index] + r; // Red
          img.pixels[index + 1] = img.pixels[index + 1] + g; // Green
          img.pixels[index + 2] = img.pixels[index + 2] + b; // Blue
          img.pixels[index + 3] = img.pixels[index + 3] + a; // Blue
        }
      }

      img.updatePixels();
    }
  };

  p.showHorse = (horse) => {
    console.log("showing");
    const cadence = 2;
    const animationWindow = 5;
    const x = horse.position.x;
    const y = p.clientHeight - 100 - horse.position.y;
    const stepInCycle = p.frameCount % animationWindow;
    const cycleRatio = animationWindow / cadence;
    const pic = p.horses.get(horse.position.y).images[
      stepInCycle <= cycleRatio ? 0 : 1
    ];
    p.text(horse.name, x, y);
    console.log("about ot add filter",pic);
    p.image(pic, x, y);
  };

  p.keyPressed = () => {
    if (p.key === " ") {
      p.order = -1;
    }
  };

  p.draw = () => {
    console.log("drawing");
    p.showHorse(horse);
    console.log("horsse is shown");
    // if (p.order == -1) {
    // socket.emit("frame");
    // }
  };
};

const my = new p5(main);
window.my = my;
