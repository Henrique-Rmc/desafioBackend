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

		if (formattedMessages.length > 1) {
			return {
				multipart: true,
				body: JSON.stringify(formattedMessages),
			};
		} else {
			return { multipart: false, mensagem: formattedMessages[0] };
		}
	}
}

module.exports = MessageFormatter;
