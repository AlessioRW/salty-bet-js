const db = require('./db');
const Fight = require('./fights.model');


(async function(){
    await db.sync({
        force: true
    })

    await Fight.sync({
        force: true
    })
})()