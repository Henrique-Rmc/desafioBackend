'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Messages", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			endToEndId: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			valor: {
				type: Sequelize.FLOAT,
				allowNull: false,
			},
			pagador: {
				type: Sequelize.JSON,
				allowNull: false,
			},
			recebedor: {
				type: Sequelize.JSON,
				allowNull: false,
			},
			campoLivre: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			txId: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			dataHoraPagamento: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  }
};