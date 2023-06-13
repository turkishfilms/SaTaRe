import "./scripts/p5.min.js";
import Horse from "./Horse.js";

const main = (p) => {
  p.horses;
  p.setup = () => {
    const canvasDiv = document.getElementById('raceCanvas'); 
    let cnv = p.createCanvas(canvasDiv.clientWidth, canvasDiv.clientHeight); // set the width and height of the canvas to the width and height of the div
    cnv.parent('canvasContainer');
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(0);
    p.horses = Array.from(
      { length: 5 },
      () =>
        new Horse({ speed: Math.random() * 20, balance: Math.random() * 30 })
    );
    console.log(p.horses);
    p.horses.forEach((horse) => console.log([horse.speed, horse.balance]));
    console.log("op");
  };

  p.draw = () => {};
};

const myP5 = new p5(main);
window.myP5 =myP5
