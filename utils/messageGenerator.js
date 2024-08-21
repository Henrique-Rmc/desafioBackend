/* eslint-disable no-undef */
const { v4: uuidv4 } = require("uuid");
const { Message } = require("../models");

const generateRandomPixMessages = (ispb, count) => {
	const messages = [];
	for (let i = 0; i < count; i++) {
		const message = {
			endToEndId: `E${ispb}${new Date().getTime()}${i}`,
			valor: parseFloat((Math.random() * 1000).toFixed(2)),
			pagador: {
				nome: `Pagador ${i}`,
				cpfCnpj: `0000000000${i}`,
				ispb: "32074986",
				agencia: `${Math.floor(1000 + Math.random() * 8999)}`,
				contaTransacional: `${Math.floor(100000 + Math.random() * 899999)}`,
				tipoConta: ["CACC", "SVGS"][Math.floor(Math.random() * 2)],
			},
			recebedor: {
				nome: `Recebedor ${i}`,
				cpfCnpj: `9999999999${i}`,
				ispb: ispb,
				agencia: `${Math.floor(1000 + Math.random() * 8999)}`,
				contaTransacional: `${Math.floor(100000 + Math.random() * 899999)}`,
				tipoConta: ["CACC", "SVGS"][Math.floor(Math.random() * 2)],
			},
			campoLivre: "",
			txId: uuidv4(),
			dataHoraPagamento: new Date(),
		};
		messages.push(message);
	}
	return messages;
};

const insertMessages = async (ispb, count) => {
	const messages = generateRandomPixMessages(ispb, count);
	console.log(messages);
	try {
		await Message.bulkCreate(messages);
		console.log(`${messages.length} messages have been inserted.`);
	} catch (error) {
		console.error("Failed to insert messages:", error);
	}
};

module.exports = {
	insertMessages,
	generateRandomPixMessages,
};
