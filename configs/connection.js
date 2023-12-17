const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'iot_db',
    'root',
    '998326',
    {
        host: 'localhost',
        dialect: 'mysql',
        port: 3307,
    }
);

module.exports = sequelize;