'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Mensagens", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			endToEndId: {
				type: Sequelize.STRING,
			},
			valor: {
				type: Sequelize.FLOAT,
			},
			campoLivre: {
				type: Sequelize.STRING,
			},
			txId: {
				type: Sequelize.STRING,
			},
			dataHoraPagamento: {
				type: Sequelize.DATE,
			},
			pagadorId: {
				type: Sequelize.INTEGER,
				references: {
					model: "Clientes",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			recebedorId: {
				type: Sequelize.INTEGER,
				references: {
					model: "Clientes",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "SET NULL",
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Mensagens');
  }
};