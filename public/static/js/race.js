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
      () => console.log("Image1 loaded barely!"),
      (err) => console.error("Error loading image:", err)
    );
    p.horseImg2 = p.loadImage(
      "/assets/graphics/horse/s_horseRunG2.png",
      () => console.log("Image2 loaded fully!"),
      (err) => console.error("Error loading image:", err)
    );
    p.horseImg3 = p.loadImage(
      "/assets/graphics/horse/s_horseRunG3.png",
      () => console.log("Image3 loaded fully!"),
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
        p.dyeHorses(data);
      }

      Object.keys(data)
        .reverse()
        .forEach((horse) => {
          p.showHorse({
            name: horse,
            position: data[horse].position,
            color: data[horse].color,
            speed: data[horse].speed,
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
      window.location.href = "/end";
    });

    let cnv = p.createCanvas(p.clientWidth, p.clientHeight);
    cnv.parent("raceCanvas");
  };

  p.dyeHorses = (data) => {
    Object.keys(data)
      .reverse()
      .forEach((horse) => {
        const pics = [p.horseImg.get(), p.horseImg2.get(), p.horseImg3.get()];
        data[horse].color.a = 5; // hack, put this in server or soemthing
        pics.forEach((pic) => {
          p.addFilter(pic, data[horse].color);
        });
        p.horses.set(data[horse].position.y, {
          name: horse,
          images: pics,
          offset: Math.floor(p.random(10)),
          frame: 0,
        });
      });
  };

  p.addFilter = (img, { r, g, b, a }) => {
    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        const index = 4 * (j * img.width + i);
        const alpha = img.pixels[index + 3];
        const bright = (r + g + b) / 3;

        if (alpha !== 0) {
          img.pixels[index] += (r - bright) * (bright / 255); // Red
          img.pixels[index + 1] += (g - bright) * (bright / 255); // Green    ///get pixel, add color, subract brightness, increase contrast
          img.pixels[index + 2] += (b - bright) * (bright / 255); // Blue
          img.pixels[index + 3] += a; // Blue
        }
      }
      img.updatePixels();
    }
  };

  p.showHorse = (horse) => {
    const horseIndex = horse.position.y
    const horseData = p.horses.get(horseIndex);
    const x = horse.position.x,
      y = p.clientHeight - 110 - horse.position.y;
    const stepInCycle = Math.floor((p.frameCount % 20) / 7);
    const pic = horseData.images[stepInCycle];
    p.text(horse.name, x, y);
    p.image(pic, x, y);
  };

  p.draw = () => {
    socket.emit("frame");
  };
};

const my = new p5(main);
window.my = my;