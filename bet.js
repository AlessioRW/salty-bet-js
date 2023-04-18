const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const {email, password} = require('./credentials.json');
const Character = require('./db/char.model');
//   await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
//   await driver.wait(until.titleIs('webdriver - Google Search'), 1000);

function isNumber(value) {
    if (typeof value === "string") {
        return !isNaN(value);
    }
}

async function login(){
    await driver.findElement(By.className('nav-text')).click()
    await driver.findElement(By.id('email')).sendKeys(email)
    await driver.findElement(By.id('pword')).sendKeys(password)
    await driver.findElement(By.className('graybutton')).click()
}

async function calculate(redName,blueName){
    let redPoints = 0
    redFighter = await Character.findOne({
        name: redName
    })
    if (redFighter){
        redPoints += (redFighter.wins + redFighter.losses)
    }

    let bluePoints = 0
    blueFighter = await Character.findOne({
        name: blueName
    })
    if (blueFighter){
        bluePoints += (redFighter.wins + redFighter.losses)
    }

    return (redPoints >= blueName) ? 'red' : 'blue'
}

async function wagerAmount(){
    let balance = await driver.findElement(By.id('balance')).getText()
    console.clear();
    console.log(`Balance: ${balance}`)
    return Math.round(balance/10)
}

async function bet(){
    let status = await driver.findElement(By.id('betstatus')).getText()
    
    if (status === 'Bets are OPEN!'){
        const blueNameRaw = await driver.findElement(By.className('bluetext')).getText()
        const redNameRaw = await driver.findElement(By.className('redtext')).getText()

        const blueName = isNumber(blueNameRaw.split('|')[0]) ? blueNameRaw.split('|')[1] : blueNameRaw.split('|')[0]
        const redName = isNumber(redNameRaw.split('|')[0]) ? redNameRaw.split('|')[1] : redNameRaw.split('|')[0]
        
        const betSide = calculate(redName,blueName)
        await driver.findElement(By.id('wager')).sendKeys(wagerAmount())

        if (betSide === 'red'){
            await driver.findElement(By.id('player1')).click()
        } else {
            await driver.findElement(By.id('player2')).click()
        }

    }   

}

async function main(){
    driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(new firefox.Options().headless()).build();
    try {
        await driver.get('https://www.saltybet.com/');
        await login()

        setInterval(bet, 10000);
    
    } catch {
        await driver.quit();
    }
}


let driver
main()