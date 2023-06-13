import "./scripts/p5.min.js";
import Horse from "./Horse.js";

const main = (p) => {
  p.horse;
  p.preload = () => {
    p.horseImg = loadImage("../assets/graphics/horse RGB f1.png");
  };
  p.horses;
  p.setup = () => {
    const { clientWidth, clientHeight } = document.getElementById("raceCanvas");
    let cnv = p.createCanvas(clientWidth, clientHeight);
    cnv.parent("canvasContainer");
    p.background(0);

    p.horses = makeHorses(10);
  };

  p.moveHorse = (horse) => {
    if (random(100) < horse.stats.balance) return; //tripped

    horse.stats.speed = Math.max(
      Math.min(
        horse.stats.speed + horse.stats.acceleration,
        horse.stats.maxSpeed
      ),
      0
    );

    horse.x += horse.stats.speed;
  };

  p.showHorse = (horse) => {
    image(p.imageImg)
  };

  p.draw = () => {
    background(0);
    p.horses.forEach((horse) => {
      moveHorse(horse);
      showHorse(horse);
    });
  };
};

const myP5 = new p5(main);
window.myP5 = myP5;

const makeHorses = (number) => {
  return Array.from({ length: number }, () => {
    return {
      x: 0,
      y: 0,
      stats: new Horse({
        speed: Math.random() * 20,
        balance: Math.random() * 30,
      }),
    };
  });
};
