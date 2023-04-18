const {Model, DataTypes} = require('sequelize');
const db = require('./db');

class Character extends Model{}
Character.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    losses: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {sequelize: db, timestamps: false})

module.exports = Character