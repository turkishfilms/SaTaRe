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
const socket = io()
socket.on('standings',({myHorseName,standings})=>{
     const podium = document.getElementById('podium')
     console.log("the best horse is: ",myHorseName)
     console.log("the standings are: ", standings)
    for(let horse in standings){
        const horseDiv = document.createElement('p')
        horseDiv.textContent = `${horse} finished in position ${standings[horse]}!`
        podium.appendChild(horseDiv)
    }
})

socket.emit('getStandings')


