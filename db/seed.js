const db = require('./db');
const Character = require('./char.model');


(async function(){
    await db.sync({
        force: true
    })

    await Character.sync({
        force: true
    })
})()