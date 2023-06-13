const trainedHistory = document.getElementById("trainedHistory");

const actions = { walked: "Walk", fed: "Feed", rested: "Rest" };

for (let action in actions) {
  const button = document.createElement("button");
  button.id = action;
  button.textContent = actions[action];
  button.addEventListener("click", () => changeStat(action));
  document.getElementById("trainOptions").appendChild(button);
}

function changeStat(stat) {
  //stat += 1; edit the class of the horse here to change stat based on parameter stat which receives walk, feed, and rest
  const statChanged = document.createElement("h2");
  statChanged.style.backgroundColor = "grey";
  statChanged.style.opacity = "0.95";
  statChanged.textContent = "You have " + stat + " your horse.";
  statChanged.style.borderBottom = 'solid black 3px';

  trainedHistory.prepend(statChanged);
}
