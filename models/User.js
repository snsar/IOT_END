const sequelize = require('../configs/connection')
const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', 
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			set(value) {
				const hashedPassword = bcrypt.hashSync(value, 10); // 10 is the number of salt rounds
            	this.setDataValue('password', hashedPassword);
			}
		},
		full_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
	}, {
		sequelize,
		modelName: 'User',
		tableName: 'users',
		timestamps: false,
	}
)


module.exports = User;