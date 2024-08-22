/* eslint-disable no-undef */
const express = require("express");
const mensagem = require("../routes/mensagemRoutes");
const { sequelize } = require("../models");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", mensagem);

sequelize
	.sync({ force: false })
	.then(() => {
		console.log("Database synced!");
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error("Unable to sync database:", err);
	});
