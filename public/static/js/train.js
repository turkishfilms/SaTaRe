const socket = io();
socket.on("test", (data) => {
  console.log("wait, ", data);
});
socket.emit("askForHorse", ({ name }) => {
  console.log("Server responded to askforHorse wiht: ", name);
  document.getElementById("trainTitle").textContent = `Train ${name}`;
});

socket.on("start", (horses) => {
  window.location.href = "/race";
});

socket.on("updateReadied", (horses)=>{
  updateReadied(horses)
})
const clearDiv = (id) => {
  const div = document.getElementById(id);
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
};

const updateReadied = (horses) => {
  clearDiv("clientsBar");
  fillDiv("clientsBar",horses);
  console.log("horses nigrumps",horses)
};

const createClientDiv = (name, horse) => {
  const clientDiv = document.createElement("p");
  clientDiv.textContent = name;
  clientDiv.id = name;
  // clientDiv.style.marginRight = "3rem";
  clientDiv.classList.add(horse.ready ? "ready" : "unready");
  return clientDiv;
};

const fillDiv = (div,horses) => {
  const clientsBar = document.getElementById(div);
  for (let horse in horses) {
    if (Object.keys(horses[horse]).length === 0) {
      continue;
    }
    console.log("omghedid it");
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

const setUpClientsBar = () => {
  socket.emit("clients", {});
};

const updateClientBar = () => {};

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
//setUpClientsBar();
console.log("barstuff");

const sendClients = () => {
  socket.emit("clients", {}, (data) => {
    console.log(data);
  });
};
