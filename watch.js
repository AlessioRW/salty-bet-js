
const Character = require('./db/char.model')
const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');


function isNumber(value) {
    if (typeof value === "string") {
        return !isNaN(value);
    }
}

async function updateFighter(name,outcome){
    let fighter = await Character.findOne({
        where: {
            name: name
        }
    })

    if (!fighter){
        fighter = await Character.create({
            name: name
        })
    }

    if (outcome === 'win'){
        fighter.update({
            wins: fighter.wins+1
        })
    } else if (outcome === 'loss'){
        fighter.update({
            losses: fighter.losses+1
        })
    }

}

async function result(){
    let status = await driver.findElement(By.id('betstatus')).getText()
    status = status.toLowerCase()
    if (status.includes('payout')){
        const blueNameRaw = await driver.findElement(By.className('bluetext')).getText()
        const redNameRaw = await driver.findElement(By.className('redtext')).getText()

        const blueName = isNumber(blueNameRaw.split('|')[0]) ? blueNameRaw.split('|')[1] : blueNameRaw.split('|')[0]
        const redName = isNumber(redNameRaw.split('|')[0]) ? redNameRaw.split('|')[1] : redNameRaw.split('|')[0]
        
        if (status.includes('blue')) { //blue wins
            updateFighter(blueName,'win')
            updateFighter(redName, 'loss')
        } else if (status.includes('red')) { //red wins
            updateFighter(blueName,'loss')
            updateFighter(redName, 'win')
        }
    }
}

async function main(){
    driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(new firefox.Options().headless()).build();
    try {
        await driver.get('https://www.saltybet.com/');
        setInterval(result, 5000);
    } catch {
        await driver.quit();
    }
}


let driver
main()