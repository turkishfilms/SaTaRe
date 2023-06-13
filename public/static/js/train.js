const horseEatAudio = new Audio('assets/audio//horseEat.mp3')
const horseWalkAudio = new Audio('assets/audio//horseRun.mp3')
const horseRestAudio = new Audio('assets/audio/horseSleep.mp3')
const horseNeighAudio = new Audio('assets/audio/horseNeigh.mp3')


const trainedHistory = document.getElementById("trainedHistory");

const submitButton = document.getElementById("readyUp");
submitButton.addEventListener("click", () => horseNeighAudio.play());

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
  statChanged.style.opacity = "0.9";
  statChanged.textContent = "You have " + stat + " your horse.";
  statChanged.style.borderBottom = 'solid black 3px';


  switch(stat){
    case 'walked': horseWalkAudio.play();
    break;
    case 'fed':  horseEatAudio.play();
    break;
    case 'rested':  horseRestAudio.play();
    break;
  }
 

  trainedHistory.prepend(statChanged);
}
