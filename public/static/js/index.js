import Horse from "./Horse.js";

let horses;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  horses = Array.from("iiiii", (item) => {
    return new Horse(random(20), random(30));
  });
  horses.forEach((horse) => console.log([horse.speed, horse.balance]));
}

function draw() {}

export default horses