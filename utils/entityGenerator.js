const { v4: uuidv4 } = require("uuid");

class Generator {
	static generateCpfCnpj() {
		return Math.floor(10000000000 + Math.random() * 90000000000).toString();
	}

	static generateValor() {
		return parseFloat((Math.random() * 1000).toFixed(2));
	}

	static generateCliente(tipo, ispb) {
		return {
			id: uuidv4(), 
			nome: `${tipo} ${Math.floor(Math.random() * 1000)}`,
			cpfCnpj: Generator.generateCpfCnpj(),
			ispb: ispb || Math.floor(10000000 + Math.random() * 90000000).toString(),
			agencia: Math.floor(1000 + Math.random() * 9000).toString(),
			contaTransacional: Math.floor(100000 + Math.random() * 900000).toString(),
			tipoConta: ["CACC", "SVGS"][Math.floor(Math.random() * 2)],
		};
	}

	static generateMensagem(ispb, pagadorId, recebedorId, index) {
		return {
			id: uuidv4(), 
			endToEndId: `E${ispb}${new Date().getTime()}${index}`,
			valor: Generator.generateValor(),
			campoLivre: "",
			txId: uuidv4(),
			dataHoraPagamento: new Date(),
			pagadorId,
			recebedorId,
		};
	}
}

module.exports = Generator;
