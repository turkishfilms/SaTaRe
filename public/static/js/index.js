import Horse from "./Horse.js";

let h = new Horse(12, 45);

let s = h.speed;

h.speed = 20;
console.log(s, h.speed);
