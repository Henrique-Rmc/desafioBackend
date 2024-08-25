const mensagemService = require("../services/mensagemService");

const { Mensagem } = require("../models");

class mensagemController {

	async startMonitoringHandler(req, res) {

		const { ispb } = req.params;
		const acceptHeader = req.headers.accept;
		const iterationId = req.query.iterationIds || 0;

		mensagemService.monitoring[ispb] = true;

		await mensagemService.startMonitoring(ispb, acceptHeader, iterationId, res);
	}

	async stopMonitoringHandler(req, res) {
    	const { ispb } = req.params;
    	mensagemService.stopMonitoring(ispb);
    	res.status(200)
  	}
	

	async postMensagemHandler(req, res) {
		const { ispb, number } = req.params;
		const count = parseInt(number, 10);
		if (isNaN(count) || count <= 0) {
			return res
				.status(400)
				.json({ error: "Invalid number of mensagens to generate." });
		}
		try {
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
