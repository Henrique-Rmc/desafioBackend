'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
        await queryInterface.changeColumn("Mensagens", "pagadorId", {
					type: Sequelize.INTEGER,
					allowNull: false,
				});

				await queryInterface.changeColumn("Mensagens", "recebedorId", {
					type: Sequelize.INTEGER,
					allowNull: false,
				});
  },

  async down (queryInterface, Sequelize) {
        await queryInterface.changeColumn("Mensagens", "pagadorId", {
					type: Sequelize.INTEGER,
					allowNull: true,
				});

				await queryInterface.changeColumn("Mensagens", "recebedorId", {
					type: Sequelize.INTEGER,
					allowNull: true,
				});
  }
};
