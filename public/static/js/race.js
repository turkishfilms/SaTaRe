import "./scripts/p5.min.js";

const socket = io();

const main = (p) => {
  p.clientHeight;
  p.clientWidth;
  p.horseImg;
  p.horseImg2;
  p.horseImg3;
  p.order = 1;
  p.horses = new Map();

  socket.emit("askForHorse", ({ name }) => {
    document.getElementById("horsename").textContent = `Name: ${name}`;
  });
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

      if (p.horses.size === 0) {
        Object.keys(data)
          .reverse()
          .forEach((horse) => {
            const pic1 = p.horseImg.get();
            const pic2 = p.horseImg2.get();
            data[horse].color.a = 5; // hack, put this in server or soemthing
            p.addFilter(pic1, data[horse].color);
            p.addFilter(pic2, data[horse].color);
            p.horses.set(data[horse].position.y, {
              name: horse,
              images: [pic1, pic2],
            });
          });
      }

      Object.keys(data)
        .reverse()
        .forEach((horse) => {
          p.showHorse({
            name: horse,
            position: data[horse].position,
            color: data[horse].color,
          });
          document.getElementById(
            "placement"
          ).textContent = `Place: ${data[horse].rank}`;
          document.getElementById(
            "speed"
          ).textContent = `Speed: ${data[horse].speed}`;
        });
    });

    socket.emit("frame");
    socket.on("over", (winner) => {
      console.log(winner);
      p.noLoop();
    });

    // socket.emit("raceOrder", (order) => {
    // p.order = order;
    // });

    let cnv = p.createCanvas(p.clientWidth, p.clientHeight);
    cnv.parent("raceCanvas");
  };

  p.addFilter = (img, { r, g, b, a }) => {
    img.loadPixels();
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
    const cadence = 2,
      animationWindow = 20,
      x = horse.position.x,
      y = p.clientHeight - 100 - horse.position.y,
      stepInCycle = p.frameCount % animationWindow,
      cycleRatio = animationWindow / cadence,
      horseData = p.horses.get(horse.position.y),
      pic = horseData.images[stepInCycle <= cycleRatio ? 0 : 1];
    p.text(horse.name, x, y);
    p.image(pic, x, y);
  };

  p.keyPressed = () => {
    if (p.key === " ") {
      console.log("Spacebaar");
      socket.emit("clients", {}, (data) => {
        console.log("a thing");
        console.log(data);
      });
    }
  };

  p.draw = () => {
    // if (p.order == -1) {
    socket.emit("frame");
    // }
  };
};

const my = new p5(main);
window.my = my;
