/**
 * TODO:
 * bring in standings
 * find out if weve won
 * conditionally render title text
 * add in p5
 * draw stands with text
 * place a horse on each level
 * place horse on side
 *
 *
 *
 *
 */
const socket = io();
socket.on("standings", ({ myHorseName, standings }) => {
  const winLossHeader = document.getElementById("winLossMessage");
  const podium = document.getElementById("podium");
  for (let horse in standings) {
    if (horse == myHorseName) {
      document.title =
        standings[horse] == 0
          ? "Winner Chicken Dinner"
          : "Better Luck next Time";
      winLossHeader.textContent =
        standings[horse] == 0 ? "You Win" : "You Lost";
    }
    const horseDiv = document.createElement("h2");
    horseDiv.textContent = `${horse} finished in position ${
      standings[horse] + 1
    }!`;
    podium.appendChild(horseDiv);
  }
});

socket.emit("getStandings");
