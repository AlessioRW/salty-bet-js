const { Model, DataTypes } = require('sequelize');
const db = require('./db');

class Fight extends Model { }
Fight.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    winner: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    loser: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    time: {
        type: DataTypes.INTEGER,
    }
}, { sequelize: db, timestamps: false })

module.exports = Fight