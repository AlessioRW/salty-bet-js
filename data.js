const Fight = require('./db/fights.model')

const checkIfKeyExist = (objectName, keyName) => {
    let keyExist = Object.keys(objectName).some(key => key === keyName);
    return keyExist;
};

async function allFighters(){
    const allFights = await Fight.findAll()


    let fighters = {}
    for (let fight of allFights){
        const winner = fight.winner
        const loser = fight.loser
        const time = (fight.time)/1000

        if (!checkIfKeyExist(fighters, winner)){
            fighters[winner] = {}
            fighters[winner].wins = 0
            fighters[winner].losses = 0
        }
        if (!checkIfKeyExist(fighters, loser)){
            fighters[loser] = {}
            fighters[loser].wins = 0
            fighters[loser].losses = 0
        }

        fighters[winner].wins += 1
        fighters[loser].losses += 1

    }

    console.log(fighters)
}

async function fighterStats(fighter){

    const wins = await Fight.findAll({
        where:{
            winner: fighter
        }
    })
    const losses = await Fight.findAll({
        where:{
            loser: fighter
        }
    })
    return {wins: wins.length, losses: losses.length}
}

module.exports = {fighterStats, allFighters, checkIfKeyExist}