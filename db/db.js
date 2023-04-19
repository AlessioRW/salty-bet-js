const { Sequelize } = require('sequelize');

const db = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/fights.sqlite',
    logging: false
});

module.exports = db