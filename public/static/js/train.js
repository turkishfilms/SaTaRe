const socket = io();
let horseName;
// fetch("/retrieveHorseName")
//   .then((response) => {
//     return response.text();
//   })
//   .then((data) => {
//     const { name } = JSON.parse(data);
//     horseName = name;
// document.getElementById("trainTitle").textContent = `Train ${name}`;
//   });
socket.emit("askForHorse", ({ name: data }) => {
  horseName = data.name;
  console.log("HNN", horseName);
  document.getElementById("trainTitle").textContent = `Train ${horseName}`;
});

socket.on("start", (horses) => {
  socket.on("start", (horses) => {
    console.log(horses);
    window.location.href = "/race";
  });
});
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

const makeActionsIntoButtons = () => {
  for (let act in actions) {
    const action = actions[act];
    const button = document.createElement("button");
    button.id = action.text;
    button.textContent = action.text;
    button.addEventListener("click", () => changeStat(action.text));
    document.getElementById("trainOptions").appendChild(button);
  }
};

const trainedHistory = document.getElementById("trainedHistory");
const submitButton = document.getElementById("readyUp");
makeActionsIntoButtons();
const horseNeighAudio = new Audio("assets/audio/horseNeigh.mp3");

submitButton.addEventListener("click", () => readiedUp());

const savedStats = { balance: 10, weight: 10 };

function changeStat(stat) {
  const statChanged = document.createElement("h2");
  const updates = {
    backgroundColor: "grey",
    opacity: "0.9",
    borderBottom: "solid black 3px",
  };
  Object.keys(updates).forEach((key) => {
    statChanged.style[key] = updates[key];
  });

  statChanged.textContent = "You have " + stat + " your horse.";

  for (let act in actions) {
    const action = actions[act];
    if (action.text == stat) {
      action.sound.play();
      for (let delta in action.stats) {
        savedStats[delta] += action.stats[delta];
      }
    }
  }

  const stats = {
    maxSpeed: { str: "Max Speed:  ", statDelta: savedStats.weight },
    Weight: { str: "Weight:  ", statDelta: savedStats.weight },
    Acceleration: { str: "Acceleration:  ", statDelta: -savedStats.weight },
    Balance: { str: "Balance:  ", statDelta: savedStats.balance },
  };

  Object.keys(stats).forEach((stat) => {
    document.getElementById(stat).textContent = stats[stat].str + stats[stat].statDelta
  });
  
  trainedHistory.prepend(statChanged);
}

const readiedUp = () => {
  horseNeighAudio.play();
  socket.emit("newStats", { name: horseName, stats: savedStats });
  socket.emit("ready");
};

const shotgun = document.getElementById("shotgun");

shotgun.addEventListener("click", () => {
  const bullet = document.createElement("div");
  bullet.id = "bullet";
  document.body.append(bullet);

  document.getElementById("profilePic").src =
    "assets/graphics/s_horseHeadDead.png";
});
