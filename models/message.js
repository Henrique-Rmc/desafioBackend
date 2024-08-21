'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Message extends Model {
		static associate(models) {}
	}
	Message.init(
		{
			endToEndId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			valor: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			pagador: {
				type: DataTypes.JSON,
				allowNull: false,
			},
			recebedor: {
				type: DataTypes.JSON,
				allowNull: false,
			},
			campoLivre: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			txId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			dataHoraPagamento: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		},
		{}
	);

	Message.associate = function (models) {
	};

	return Message;
};