const sequelize = require('../configs/connection')
const { DataTypes } = require('sequelize');

const Health = sequelize.define('Health', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    temperature_1: DataTypes.FLOAT(3),
    heart_rate_1: DataTypes.FLOAT(3),
    spo2_1: DataTypes.FLOAT(3),
    temperature_2: DataTypes.FLOAT(3),
    heart_rate_2: DataTypes.FLOAT(3),
    spo2_2: DataTypes.FLOAT(3),
    temperature_3: DataTypes.FLOAT(3),
    heart_rate_3: DataTypes.FLOAT(3),
    spo2_3: DataTypes.FLOAT(3),
    predict_result: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
        tableName: 'health_result',
        allowNull: true, // Allow null values for all columns
        timestamps: true, // This enables automatic timestamp tracking
})

module.exports = Health;