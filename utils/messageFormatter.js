class MessageFormatter {
	static formatMessages(mensagens, acceptHeader) {
		const formattedMessages = mensagens.map((mensagem) => ({
			endToEndId: mensagem.endToEndId,
			valor: mensagem.valor,
			pagador: {
				nome: mensagem.pagador.nome,
				cpfCnpj: mensagem.pagador.cpfCnpj,
				ispb: mensagem.pagador.ispb,
				agencia: mensagem.pagador.agencia,
				contaTransacional: mensagem.pagador.contaTransacional,
				tipoConta: mensagem.pagador.tipoConta,
			},
			recebedor: {
				nome: mensagem.recebedor.nome,
				cpfCnpj: mensagem.recebedor.cpfCnpj,
				ispb: mensagem.recebedor.ispb,
				agencia: mensagem.recebedor.agencia,
				contaTransacional: mensagem.recebedor.contaTransacional,
				tipoConta: mensagem.recebedor.tipoConta,
			},
			campoLivre: mensagem.campoLivre,
			txId: mensagem.txId,
			dataHoraPagamento: mensagem.dataHoraPagamento,
		}));

		if (acceptHeader === "multipart/json") {
			let responseBody = "";

			formattedMessages.forEach((mensagem) => {
				responseBody += `--simple boundary\r\n`;
				responseBody += `Content-Type: application/json\r\n\r\n`;
				responseBody += JSON.stringify(mensagem);
				responseBody += `\r\n`;
			});

			responseBody += `--simple boundary--`;

			return { multipart: true, body: this.parseMultipartBody(responseBody) };
		} else {
			return { multipart: false, mensagem: formattedMessages[0] };
		}
	}

	static parseMultipartBody(body) {
		const parts = body.split("--simple boundary");

		const jsonParts = parts
			.filter((part) => part.includes("Content-Type: application/json"))
			.map((part) => {
				const jsonString = part.split("\r\n\r\n")[1];
				return JSON.parse(jsonString);
			});

		return jsonParts;
	}
}

module.exports = MessageFormatter;
