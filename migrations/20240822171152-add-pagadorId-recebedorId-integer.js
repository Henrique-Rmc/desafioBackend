"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Mensagens", "pagadorId", {
			type: Sequelize.INTEGER,
			allowNull: true,
		});

		await queryInterface.addColumn("Mensagens", "recebedorId", {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn("Mensagens", "pagadorId");
		await queryInterface.removeColumn("Mensagens", "recebedorId");
	},
};
