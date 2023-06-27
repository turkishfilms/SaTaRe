
import "./scripts/p5.min.js";
  const socket = io();
  const giddyUpAudio = new Audio("./assets/audio/giddyUp.mp3");

  const submitForm = (event) =>{
    event.preventDefault()
    newHorse(changeColor(document.getElementById('colorChooser').value), document.getElementById('name').value || `Horse${Math.random().toFixed(5)}`);
  } 

  const newHorse = (color, name) => {
    const data = { name: name, color: color || {r:255,g:0,b:0} };
    console.log(data);
    socket.emit("newHorse", data);
    window.location.href = "/train" 
  };

  const numberToRGB = (number) => {
    let h = number / 360;
    let s = 1,
      v = 1;
    let r, g, b, i, f, p, q, t;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        (r = v), (g = t), (b = p);
        break;
      case 1:
        (r = q), (g = v), (b = p);
        break;
      case 2:
        (r = p), (g = v), (b = t);
        break;
      case 3:
        (r = p), (g = q), (b = v);
        break;
      case 4:
        (r = t), (g = p), (b = v);
        break;
      case 5:
        (r = v), (g = p), (b = q);
        break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  function changeColor(degree) {
    document.getElementById("horse").style.filter = `hue-rotate(${degree}deg)`; //side effect
    const color = numberToRGB(degree);
    return color;
  }

window.onload = () => {
  document
    .getElementById("name")
    .addEventListener("click", () => giddyUpAudio.play());

}  

const sendClients=()=>{
  socket.emit("clients",{},(data)=>{
    return data
  })
  
}
//---------
/**
 * COlored horse itnro image
 * todo
 * add canvas to div
 * set w and h 
 * preload image
 * add updete image fx
 * UIF(deg)
 * when slider change run updateimgfx
 * slider outputs deg
 * convert to rgb
 * feed into add filter
 * add copy of img into add filter
 * display copied image
 * 
 * todone
 * bring in p5
 */


const main = (p) => {
  p.clientHeight;
  p.clientWidth;
  p.horseHeadLiving
  p.horseHeadDead;

  p.preload = () => {
    p.horseHeadDead = p.loadImage(
      "/assets/graphics/horse/s_horseRunG1.png",
      () => console.log("Image loaded barely!"),
      (err) => console.error("Error loading image:", err)
    );
    p.horseHeadLiving = p.loadImage(
      "/assets/graphics/horse/s_horseRunG2.png",
      () => console.log("Image loaded fully!"),
      (err) => console.error("Error loading image:", err)
    );
  };

  p.setup = () => {
    const div = document.getElementById("horseHead");
    const { clientWidth, clientHeight } = div;
    let cnv = p.createCanvas(clientWidth, clientHeight);
    cnv.parent("raceCanvas");
  };

  p.addFilter = (img, { r, g, b, a }) => {
    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        let index = 4 * (j * img.width + i);
        let alpha = img.pixels[index + 3];
        let bright = (r + g + b) / 3;

        if (alpha !== 0) {
          // if pixel is not transparent
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
    const pic = horseHead.get()
    p.image(pic, x, y);
  };


};

const my = new p5(main);
window.my = moy