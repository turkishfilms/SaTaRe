const socket = io();

socket.emit("askForHorse", ({ name }) => {
  document.getElementById("trainTitle").textContent = `Train ${name}`;
});

socket.on("start", (horses) => {
  window.location.href = "/race";
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
    if (action.text == stat) {
      action.sound.play();
      for (let delta in action.stats) {
        savedStats[delta] += action.stats[delta];
      }
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
  socket.emit("newStats", { stats: savedStats });
  socket.emit("ready");
};

makeActionsIntoButtons(actions);
makeShotgun();
