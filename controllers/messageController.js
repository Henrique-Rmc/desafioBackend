const { insertMessages } = require("../utils/messageGenerator");
const { Message } = require("../models");


class messageController {

	async postMessageHandler(req, res) {
		const { ispb, number } = req.params;
		const count = parseInt(number);

		if (isNaN(count) || count <= 0) {
			return res
				.status(400)
				.json({ error: "Invalid number of messages to generate." });
		}

		try {
			const messages = insertMessages(ispb, count);
			await Message.bulkCreate(messages);
			return res
				.status(201)
				.json({ message: `${count} messages created successfully.` });
		} catch (error) {
			return res.status(500).json({ error: "Error generating messages." });
		}
	}
}

module.exports = new messageController();
