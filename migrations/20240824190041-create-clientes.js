'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("Clientes", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			nome: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			cpfCnpj: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			ispb: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			agencia: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			contaTransacional: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			tipoConta: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
  },

  async down (queryInterface, Sequelize) {
      await queryInterface.dropTable("Clientes");
  }
};
