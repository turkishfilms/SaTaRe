import "./scripts/p5.min.js";
import Horse from "./Horse.js";

const main = (p) => {
  p.horses;
  p.setup = () => {
    const { clientWidth, clientHeight } = document.getElementById("raceCanvas");
    let cnv = p.createCanvas(clientWidth, clientHeight);
    cnv.parent("canvasContainer");
    p.background(0);

    p.horses = makeHorses(10);

    console.log(p.horses);
    p.horses.forEach((horse) => console.log([horse.speed, horse.balance]));
    console.log("op");
  };

  p.draw = () => {};
};

const myP5 = new p5(main);
window.myP5 = myP5;

const makeHorses = (number) => {
  return Array.from(
    { length: number },
    () => new Horse({ speed: Math.random() * 20, balance: Math.random() * 30 })
  );
};
