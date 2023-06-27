
  const socket = io();
  const giddyUpAudio = new Audio("./assets/audio/giddyUp.mp3");

  let currentColor;
  let currentName;

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

  const setName = (name) => {
    currentName = name || `Horse${Math.random().toFixed(5)}`;
  };

  const setColor = (degree) => {
    currentColor = changeColor(degree);
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
