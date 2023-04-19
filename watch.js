
const Character = require('./db/char.model')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');


function isNumber(value) {
    if (typeof value === "string") {
        return !isNaN(value);
    }
}



async function updateFighter(name, outcome) {
    let fighter = await Character.findOne({
        where: {
            name: name
        }
    })

    if (!fighter) {
        fighter = await Character.create({
            name: name
        })
    }

    if (outcome === 'win') {
        fighter.update({
            wins: fighter.wins + 1
        })
    } else if (outcome === 'loss') {
        fighter.update({
            losses: fighter.losses + 1
        })
    }
}

async function main() {
    if (driver === 0) {
        driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(new firefox.Options().headless()).build();
        await driver.get('https://www.saltybet.com/');
    }

    try {
        let status = await driver.findElement(By.id('betstatus')).getText()
        if (mode === 'waiting') { //look for fighters to be revealed and fight to start
            if (status === ' Bets are locked until the next match.') {
                startTime = new Time
                const blueNameRaw = await driver.findElement(By.className('bluetext')).getText()
                const redNameRaw = await driver.findElement(By.className('redtext')).getText()
                const blueName = isNumber(blueNameRaw.split('|')[0]) ? blueNameRaw.split('|')[1] : blueNameRaw.split('|')[0]
                const redName = isNumber(redNameRaw.split('|')[0]) ? redNameRaw.split('|')[1] : redNameRaw.split('|')[0]

                currentFighters.blue = blueName
                currentFighters.red = redName
            }
        }



    } catch (error) {
        console.log(error)
        await driver.quit();
    }
}

let startTime
let driver = 0
let mode = 'waiting' //waiting, watching
currentFighters = { 'blue': null, 'red': null }

setInterval(main, 1000)