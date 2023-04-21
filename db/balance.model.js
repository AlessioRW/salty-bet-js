const { Model, DataTypes } = require('sequelize');
const db = require('./db');

class Balance extends Model { }
Balance.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    balance: {
        type: DataTypes.INTEGER,
    }
}, { sequelize: db, timestamps: false })

module.exports = Balance