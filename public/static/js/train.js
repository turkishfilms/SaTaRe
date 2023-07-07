const socket = io();

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

const LOBBY_IMG_WIDTH = 96;
const LOBBY_LEFT_OFFSET = 200;
const LOBBY_TEXT_HEIGHT = 80;
const ALPHA = 25;

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

socket.on("updateReadied", (horses) => {
  clearDiv("clientsBar");
  fillDiv("clientsBar", horses);
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
    ur.deadHorse();
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
    p.fill(0);

    let cnv = p.createCanvas(p.clientWidth, p.clientHeight);
    cnv.parent("clientsBar");

    socket.on("updateLobby", (horses) => {
      p.updateHorseData(horses);
      p.showHorses(p.allHorseData);
    });
    socket.emit("joinLobby");
  };

  p.updateHorseData = (data) => {
    for (let client in data) {
      const horseIndex = p.allHorseData.findIndex(
        (horse) => horse.name === client
      );

      if (horseIndex === -1) {
        const newPic = p.addFilter(p.horseImg.get(), data[client].color);

        const newHorseData = {
          name: client,
          images: [p.horseImg.get(), newPic],
          ready: data[client].ready,
        };
        p.allHorseData.push(newHorseData);
      } else {
        p.allHorseData[horseIndex].ready = data[client].ready;
      }
    }
  };

  p.showHorses = (horses) => {
    p.clear();
    let index = 0;
    for (let horse of horses) {
      p.showHorse(horse, index);
      index++;
    }
  };

  p.showHorse = (horse, index) => {
    p.fill(0);
    const horseData = p.allHorseData.find((h) => h.name === horse.name);
    const img = horseData.ready ? horseData.images[1] : horseData.images[0];
    p.image(img, index * LOBBY_IMG_WIDTH + LOBBY_LEFT_OFFSET, 0);
    p.text(
      horseData.name,
      index * LOBBY_IMG_WIDTH + LOBBY_LEFT_OFFSET,
      LOBBY_TEXT_HEIGHT
    );
  };

  p.addFilter = (img, { r, g, b, a = ALPHA }) => {
    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        const index = 4 * (j * img.width + i);
        const alpha = img.pixels[index + 3];
        const bright = (r + g + b) / 3;
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
    p.image(img, r, 0);
    return img;
  };
};

const my = new p5(main);

const char = (p) => {
  p.preload = () => {
    p.horseImg = p.loadImage(
      "/assets/graphics/s_horseHeadGS.png",
      () => console.log("Grey Scale Horse Head Image loaded fully!"),
      (err) => console.error("Error loading Grey Scale Horse Head Image:", err)
    );
  };

  p.setup = () => {
    const div = document.getElementById("profilePic2");
    const { clientWidth, clientHeight } = div;
    p.clientHeight = clientHeight;
    p.clientWidth = clientWidth;
    let cnv = p.createCanvas(p.clientWidth, p.clientHeight);
    cnv.parent("profilePic2");
    p.image(
      p.addFilter(p.horseImg, clientHorseColor),
      0,
      0,
      p.horseImg.width * 2,
      p.horseImg.height * 2
    );
  };

  p.addFilter = (img, { r, g, b, a = ALPHA }) => {
    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        const index = 4 * (j * img.width + i);
        const alpha = img.pixels[index + 3];
        const bright = (r + g + b) / 3;
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

  p.deadHorse = () => {
    p.clear();
  };
};

const ur = new p5(char);
