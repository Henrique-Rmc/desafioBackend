/* eslint-disable no-undef */
const express = require("express");
const mensagem = require("../routes/mensagemRoutes");
const { sequelize } = require("../models");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", mensagem);

async function startServer() {
	try {
		await sequelize.authenticate(); 
		console.log("Sucess.");

		app.listen(PORT, () => {
			console.log(`Server running on port: ${PORT}`);
		});
	} catch (error) {
		console.error("Error", error);
	}
}

startServer();