const socket = io();
let clientHorseName;
let clientHorseColor;

socket.emit("askForHorse", ({ horse }) => {
  const { name, color } = horse;
  clientHorseName = name;
  clientHorseColor = color;
  document.getElementById("trainTitle").textContent = `Train ${name}`;
});

socket.on("start", (horses) => {
  window.location.href = "/race";
});

const clearDiv = (id) => {
  const div = document.getElementById(id);
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
};

const createClientDiv = (name, horse) => {
  const clientDiv = document.createElement("p");
  clientDiv.textContent = name;
  clientDiv.id = name;
  // clientDiv.style.marginRight = "3rem";
  clientDiv.classList.add(horse.ready ? "ready" : "unready");
  return clientDiv;
};

const fillDiv = (div, horses) => {
  const clientsBar = document.getElementById(div);
  for (let horse in horses) {
    if (Object.keys(horses[horse]).length === 0) {
      continue;
    }
    clientsBar.appendChild(createClientDiv(horse, horses[horse]));
  }
};

socket.on("clientsSend", (horses) => {
  console.log("horses reeturned based on the clients messgae: ", horses);
  // fillDiv("clientsBar",horses);
});

const savedStats = { balance: 10, weight: 10 };

const actions = {
  walked: {
    text: "Walk",
    sound: new Audio("assets/audio//horseRun.mp3"),
    stats: { weight: 1, balance: -1 },
  },
  fed: {
    text: "Feed",
    sound: new Audio("assets/audio//horseEat.mp3"),
    stats: { weight: -1, balance: 1 },
  },
  rested: {
    text: "Rest",
    sound: new Audio("assets/audio/horseSleep.mp3"),
    stats: { weight: -1, balance: -1 },
  },
};

const makeActionsIntoButtons = (actions) => {
  for (let act in actions) {
    const action = actions[act];
    const button = document.createElement("button");
    button.id = action.text;
    button.textContent = action.text;
    button.addEventListener("click", () => handleStats(action.text));
    document.getElementById("trainOptions").appendChild(button);
  }
};

const makeShotgun = () => {
  const shotgun = document.getElementById("shotgun");

  shotgun.addEventListener("click", () => {
    const bullet = document.createElement("div");
    bullet.id = "bullet";
    document.body.append(bullet);

    document.getElementById("profilePic").src =
      "assets/graphics/s_horseHeadDead.png";
  });
};

const makeActionCard = (stat) => {
  const trainedHistory = document.getElementById("trainedHistory");

  const statCard = document.createElement("h2");
  const styles = {
    backgroundColor: "grey",
    opacity: "0.9",
    borderBottom: "solid black 3px",
  };
  Object.keys(styles).forEach((style) => {
    statCard.style[style] = styles[style];
  });
  statCard.textContent = "You have " + stat + " your horse.";
  trainedHistory.prepend(statCard);
};

function handleStats(stat) {
  const stats = {
    maxSpeed: { str: "Max Speed:  ", statDelta: savedStats.weight },
    Weight: { str: "Weight:  ", statDelta: savedStats.weight },
    Acceleration: { str: "Acceleration:  ", statDelta: -savedStats.weight },
    Balance: { str: "Balance:  ", statDelta: savedStats.balance },
  };

  makeActionCard(stat);
  updateSavedStats(stat);
  updateStatsDisplay(stats, stat);
}

const updateSavedStats = (stat) => {
  for (let act in actions) {
    const action = actions[act];
    if (action.text !== stat) {
      continue;
    }
    action.sound.play();
    for (let delta in action.stats) {
      savedStats[delta] += action.stats[delta];
    }
  }
};

const updateStatsDisplay = (stats) => {
  Object.keys(stats).forEach((stat) => {
    document.getElementById(stat).textContent =
      stats[stat].str + stats[stat].statDelta;
  });
};

const readiedUp = () => {
  const horseNeighAudio = new Audio("assets/audio/horseNeigh.mp3");
  horseNeighAudio.play();
  socket.emit("ready", { stats: savedStats });
};

makeActionsIntoButtons(actions);
makeShotgun();

const sendClients = () => {
  socket.emit("clients", {}, (data) => {
    console.log(data);
  });
};

//p5 stuff for the ready up upgrade
const main = (p) => {
  p.clientHeight;
  p.clientWidth;
  p.horseImg;
  p.allHorseData = [];

  p.preload = () => {
    p.horseImg = p.loadImage(
      "/assets/graphics/s_horseHeadGS.png",
      () => console.log("Image loaded fully!"),
      (err) => console.error("Error loading image:", err)
    );
  };

  p.setup = () => {
    const div = document.getElementById("clientsBar");
    const { clientWidth, clientHeight } = div;
    p.clientHeight = clientHeight;
    p.clientWidth = clientWidth;

    let cnv = p.createCanvas(p.clientWidth, p.clientHeight);
    cnv.parent("clientsBar");
    // p.allHorseData.push({
    //   name: clientHorseName,
    //   images: [
    //     p.horseImg.get(),
    //     p.addFilter(p.horseImg.get(), clientHorseColor),
    //   ],
    // });

    socket.on("updateLobby", (horses) => {
      p.updateHorseData(horses);
      p.showHorses(p.allHorseData);
    });
    socket.emit("joinLobby");
  };

  p.updateHorseData = (data) => {
    for (let client in data) {
      if (!p.allHorseData.some((horse) => horse.name === client)) {
        const newHorseData = {
          name: clientHorseName,
          images: [
            p.horseImg.get(),
            p.addFilter(p.horseImg.get(), clientHorseColor),
          ],
        };
        p.allHorseData.push({ ...newHorseData, ...data[client] });
      }
    }
    // p.allHorseData = data;
  };

  p.showHorses = (horses) => {
    console.log("showHorses: horses=>", horses);
    p.clear();
    let index = 0;
    for (let horse of horses) {
      p.showHorse(horse, index);
      index++;
    }
  };
  p.addHorseToData = (horse) => {
    p.allHorseData.push({
      name: horse.name,
      images: [p.horseImg, p.dyeHorse(horse)],
      ready: horse.ready,
    });
  };

  p.showHorse = (horse, index) => {
    let imgWidth = 96;
    let imgHeight = 96;
    let gap = 10;
    let perRow = Math.floor(p.clientWidth / (imgWidth + gap));

    let x = (index % perRow) * (imgWidth + gap);
    let y = Math.floor(index / perRow) * (imgHeight + gap);
    let horseData = p.allHorseData.find((h) => h.name === horse.name);
    console.log("showhorse:x,horseData,horse=>",x, horseData, horse)
    let img = horseData.ready ? horseData.images[1] : horseData.images[0];
    p.image(img, 0, 0);
    p.fill(0); // Setting the fill color for the text
    p.text(horseData.name, x, y - 10); // Display the name above the image
    // p.image(img, x, y, imgWidth, imgHeight); // Display the image
  };

  // p.addHorseToData = (horse) => {
  // p.horses.set(data[horse].position.y, {
  // name: horse,
  // images: [p.horseImage.get(), p.dyeHorse(horse)],
  // });
  // p.horseData.something(horse);
  // };

  p.dyeHorse = (horse) => {
    horse.color.a = 5; // hack, put this in server or soemthing
    return p.addFilter(p.horseImg.get(), horse.color);
  };

  p.fillHorseData = (data) => {
    Object.keys(data)
      .reverse()
      .forEach((horse) => {
        p.addHorseToData(horse);
      });
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
          img.pixels[index + 3] += a;
        }
      }
      img.updatePixels();
    }
    return img;
  };

  p.showHorse2 = (horse) => {
    const horseIndex = horse.name;
    const horseData = p.horses.get(horseIndex);
    const x = horse.position.x,
      y = p.clientHeight - 100 - horse.position.y;
    const pic = horseData.images[stepInCycle];
    p.text(horse.name, x, y);
    console.log("showhorse pic", pic, stepInCycle);
    p.image(pic, x, y);
  };

  p.updateLobby = (horses) => {
    if (horses.length == p.horseData.length) {
      // just change the colors
    } else {
      //add needed horses and change colorsgg
    }
  };
};
const my = new p5(main);
/**
 * first loads-> grab our name and send new unready person in lobby messag to everyonw
 * hits ready-> send new person is ready to everyone
 * someone else loads -> we need to show them neing unready
 * someone else readies -> we need to show them being ready
 *
 * clients
 * 1.one message to say plaer joined lobby
 * 2.one message to say lobby player is ready
 *
 * server
 * always sends updated lobby unless everyone is ready
 * only updates ready status if 2. is fired
 *
 *
 */
