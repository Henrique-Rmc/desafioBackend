"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Mensagem extends Model {
		static associate(models) {
			Mensagem.belongsTo(models.Cliente, {
				foreignKey: "pagadorId",
				as: "pagador",
			});

			Mensagem.belongsTo(models.Cliente, {
				foreignKey: "recebedorId",
				as: "recebedor",
			});
		}
	}

	Mensagem.init(
		{
			endToEndId: DataTypes.STRING,
			valor: DataTypes.FLOAT,
			campoLivre: DataTypes.STRING,
			txId: DataTypes.STRING,
			dataHoraPagamento: DataTypes.DATE,
			lida: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			sequelize,
			modelName: "Mensagem",
			tableName: "Mensagens",
		}
	);

	return Mensagem;
};
