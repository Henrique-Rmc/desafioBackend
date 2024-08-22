"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.sequelize.transaction(async (transaction) => {
			
			await queryInterface.bulkDelete("Mensagens", null, {
				truncate: true,
				restartIdentity: true,
				cascade: false,
				transaction,
			});

			await queryInterface.bulkDelete("Clientes", null, {
				truncate: true,
				restartIdentity: true,
				cascade: false,
				transaction,
			});
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	},
};
