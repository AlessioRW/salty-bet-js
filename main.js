const Fight = require('./db/fights.model')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const {email, password} = require('./credentials.json');
const Balance = require('./db/balance.model');
const {fighterStats, allFighters, checkIfKeyExist} = require('./data')


function isNumber(value) {
    if (typeof value === "string") {
        return !isNaN(value);
    }
}


async function getOdds(fighter, enemy){
    const winAdd = 1 // +/- odds for winning/losing
    const matchUpWin = 5 // adding odds for winning same matchup
    const timeMultiplier = 1/100000 // +/- multiplier odds for average time

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
    const sameMatchUp = await Fight.findAll({
        where: {
            winner: fighter,
            loser: enemy
        }
    })

    let averageTime = 0
    for (let match of wins){
        averageTime += match.time
    }
    for (let match of losses){
        averageTime -= match.time
    }

    //getting the number of wins/losses of the character each fighter has won/lost against
    let enemyStrength = 0
    let loserWins = []
    for (let fight of wins){ //find number of wins opponets have who our fighter has beat
        loserWins = await Fight.findAll({
            where:{
                winner: fight.loser
            }
        })
    }
    enemyStrength += loserWins.length

    let winnerLosses = []
    for (let fight of losses){ //find number of wins opponets have who our fighter has beat
        winnerLosses = await Fight.findAll({
            where:{
                loser: fight.winner
            }
        })
    }
    enemyStrength -= winnerLosses.length

    let odds = 0
    odds += (wins.length)*winAdd
    odds -= (losses.length)*winAdd
    odds += (sameMatchUp.length)*matchUpWin
    odds += (averageTime)*timeMultiplier
    odds += enemyStrength

    return odds
}

async function calculateWager(redOdds,blueOdds){
    let balance = await driver.findElement(By.id('balance')).getText()
    console.log(`Balance: $${balance}`)
    balance = (balance.split(',')).join('')
    Balance.create({ //not awaiting like a bawse
        balance: balance
    })

    let wager
    let tournamentText = await driver.findElements(By.id('tournament-note'))
    if (tournamentText.length !== 0){ //if betting during tournament, be more risky with money
        wager = Math.round((balance/2))
    } else {
        wager = Math.round(((balance % 5000)/10)) //if balance is over 5000, bet using money over that amount
    }
    return wager
}

async function bet(){
    const redOdds = await getOdds(currentFighters.red, currentFighters.blue)
    const blueOdds = await getOdds(currentFighters.blue, currentFighters.red)
    const wagerAmount = await calculateWager(redOdds,blueOdds)
    await driver.findElement(By.id('wager')).sendKeys(wagerAmount)
    if (tournamentOnly){
        console.log('Tournament Mode')
        let tournamentText = await driver.findElements(By.id('tournament-note'))
        if (tournamentText.length === 0){
            return
        }
    }
    
    if (redOdds >= blueOdds){
        await driver.findElement(By.id('player1')).click()
        console.log(`Placed $${wagerAmount} on ${currentFighters.red}`)
    } else {
        await driver.findElement(By.id('player2')).click()
        console.log(`Placed $${wagerAmount} on ${currentFighters.blue}`)
    }
}


async function main() {
    if (loadingDriver){
        return
    }

    if (driver === 0) {
        loadingDriver = true
        driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(new firefox.Options().headless()).build();
        //driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(new firefox.Options()).build();
        await driver.get('https://www.saltybet.com/');
        console.log('Driver Loaded')
        if (betting){
            await driver.findElement(By.className('nav-text')).click()
            await driver.findElement(By.id('email')).sendKeys(email)
            await driver.findElement(By.id('pword')).sendKeys(password)
            await driver.findElement(By.className('graybutton')).click()
            console.log('Logged In')
            if (tournamentOnly){
                console.log('Tournament Mode')
            }
        }
        
        loadingDriver = false
    } 
    
    else {
        try {
            if (check === true){
                return
            }
            check = true
            let status = await driver.findElement(By.id('betstatus')).getText()
            if (mode === 'waiting') { //look for fighters to be revealed and fight to start
                if (status === 'Bets are OPEN!') {
                    startTime = Date.now()
                    const blueNameRaw = await driver.findElement(By.className('bluetext')).getText()
                    const blueName = isNumber(blueNameRaw.split('|')[0]) ? blueNameRaw.split('|')[1] : blueNameRaw.split('|')[0]
                    const redNameRaw = await driver.findElement(By.className('redtext')).getText()
                    const redName = isNumber(redNameRaw.split('|')[0]) ? redNameRaw.split('|')[1] : redNameRaw.split('|')[0]
    
                    currentFighters.blue = blueName
                    currentFighters.red = redName

                    const blueStats = await fighterStats(blueName)
                    const redStats = await fighterStats(redName)

                    console.clear()
                    console.log(`Current Fight: ${currentFighters.red} [${redStats.wins}|${redStats.losses}] vs ${currentFighters.blue} [${blueStats.wins}|${blueStats.losses}]`)

                    if (betting){
                        bet()
                    }
                    mode = 'watching'
                }
            } else if (mode === 'watching'){
                if (status.toLowerCase().includes('payout')){ //fight is over
                    const fightTime = Date.now() - startTime
                     mode = 'waiting'
    
                    if (status.toLowerCase().includes('blue')){ //blue wins
                        await Fight.create({
                            winner: currentFighters.blue,
                            loser: currentFighters.red,
                            time: fightTime
                        })
                    } else if (status.toLowerCase().includes('red')){ //red wins
                        await Fight.create({
                            winner: currentFighters.red,
                            loser: currentFighters.blue,
                            time: fightTime
                        })
                    }
                }
                
            }
            check = false
        } catch (error) {
            console.log(error)
            await driver.quit();
        }
    }

    
}

let check = false
let betting = true
let tournamentOnly = false //only bet during tournaments
let startTime
let driver = 0
let loadingDriver = false
let mode = 'waiting' //waiting, watching
currentFighters = { 'blue': null, 'red': null }

setInterval(main, 1000)