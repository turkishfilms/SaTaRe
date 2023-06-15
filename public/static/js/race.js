import "./scripts/p5.min.js";
import Horse from "./Horse.js";

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
    const {clientWidth,clientHeight} = div
    console.log("CLH",clientHeight)
    let cnv = p.createCanvas(clientWidth, clientHeight);

    cnv.parent("raceCanvas");
    p.background(0);

    p.horses = makeHorses(p, 10);
  };

  p.moveHorse = (horse) => {
    if (p.random(100) < horse.stats.balance) return; //tripped

    horse.stats.speed = p.max(
      p.min(horse.stats.speed + horse.stats.acceleration, horse.stats.maxSpeed),
      0
    );

    horse.x += horse.stats.speed;
  };

  p.showHorse = (horse) => {
    p.ellipse(horse.x, horse.y,20)
    // p.image(p.horseImg, horse.x, horse.y);
  };

  p.draw = () => {
    // p.background(0);
    // p.horses.forEach((horse) => {
    //   // p.moveHorse(horse);
    //   p.showHorse(horse);
    // });
  };
};

const myP5 = new p5(main);
window.myP5 = myP5;

const makeHorses = (p, number) => {
  return Array.from({ length: number }, () => {
    return {
      x: 0,
      y: 0,
      stats: new Horse({
        speed: p.random() * 20,
        balance: p.random() * 30,
      }),
    };
  });
};
