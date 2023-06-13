const actions = ["walked", "fed", "rested"];
actions.forEach((action) => {
  document
    .getElementById(action)
    .addEventListener("click", () => changeStat(action));
});

// let walkButton = document.getElementById("walk");
// let feedButton = document.getElementById("feed")
// let restButton = document.getElementById("rest");

let trainedHistory = document.getElementById("trainedHistory");

// walkButton.addEventListener("click", () => changeStat("walked"));
// feedButton.addEventListener("click", () => changeStat("fed"));
// restButton.addEventListener("click", () => changeStat("rested"));

function changeStat(stat) {
  //stat += 1; edit the class of the horse here to change stat based on parameter stat which receives walk, feed, and rest
  let statChanged = document.createElement("h2");
  statChanged.style.backgroundColor = "greenyellow";
  statChanged.textContent = "You have " + stat + " your horse.";

  trainedHistory.prepend(statChanged);
}
