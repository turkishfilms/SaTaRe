const socket = io();
console.log(socket);

//putting horse name in the title
let horseName;
// fetch("/retrieveHorseName")
//   .then((response) => {
//     return response.text();
//   })
//   .then((data) => {
//     const { name } = JSON.parse(data);
//     horseName = name;
//     document.getElementById("trainTitle").textContent = `Train ${name}`;
//   });
socket.on("askForHorse", "hi", (name) => {
  console.log("cold")
  horseName = name;
  console.log("HNN", horseName);
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

const savedStats = { balance: 0, weight: 0 };

function changeStat(stat) {
  //stat += 1; edit the class of the horse here to change stat based on parameter stat which receives walk, feed, and rest
  const statChanged = document.createElement("h2");
  statChanged.style.backgroundColor = "grey";
  statChanged.style.opacity = "0.9";
  statChanged.textContent = "You have " + stat + " your horse.";
  statChanged.style.borderBottom = "solid black 3px";

  for (let act in actions) {
    const action = actions[act];
    if (action.text == stat) {
      action.sound.play();
      for (let delta in action.stats) {
        savedStats[delta] += action.stats[delta];
      }
    }
  }

  trainedHistory.prepend(statChanged);
}

const readiedUp = () => {
  horseNeighAudio.play();
  console.log("name", horseName);
  //send stat updates to server
  //tell them we are ready
  fetch("/statsUp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: horseName, stats: savedStats }),
  })
    .then((response) => {
      return response.json();
    })
    .then((Rs) => {
      console.log("nice", Rs);
    });
  socket.emit("ready");
};

const updateScoreDivs = (stats) => {
  const divs = ["maxSpeed", "Weight", "Acceleration", "Balance"];
  divs.forEach((div) => {
    const statDiv = document.getElementById(div);
  });
};

socket.on("raceStart", () => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
});
