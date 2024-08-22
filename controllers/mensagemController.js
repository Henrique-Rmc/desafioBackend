const mensagemService  = require("../services/mensagemService");

const { Mensagem } = require("../models");

class mensagemController {

	async postMensagemHandler(req, res) {
		const { ispb, number } = req.params;
		const count = parseInt(number, 10);
		console.log(count);
		if (isNaN(count) || count <= 0) {
			return res
				.status(400)
				.json({ error: "Invalid number of mensagens to generate." });
		}

		try {
			console.log("inserting");
			const mensagens = await mensagemService.generateRandomMensagens(
				ispb,
				count
			);
			return res.status(201).json({ mensagens });
		} catch (error) {
			console.error("Error generating mensagens:", error);
			return res.status(500).json({ error: "Error generating mensagens." });
		}
	}
}

module.exports = new mensagemController();
