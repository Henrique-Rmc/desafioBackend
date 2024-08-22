const { v4: uuidv4 } = require("uuid");
const { Mensagem, Cliente } = require("../models");

class MensagemService {



	static generateCpfCnpj() {
		return Math.floor(10000000000 + Math.random() * 90000000000).toString();
	}

	static generateValor() {
		return parseFloat((Math.random() * 1000).toFixed(2));
	}

	static generateCliente(tipo, ispb) {
		return {
			nome: `${tipo} ${Math.floor(Math.random() * 1000)}`,
			cpfCnpj: MensagemService.generateCpfCnpj(),
			ispb: ispb || Math.floor(10000000 + Math.random() * 90000000).toString(),
			agencia: Math.floor(1000 + Math.random() * 9000).toString(),
			contaTransacional: Math.floor(100000 + Math.random() * 900000).toString(),
			tipoConta: ["CACC", "SVGS"][Math.floor(Math.random() * 2)],
		};
	}

	static async generateRandomMensagens(ispb, count) {
		const mensagens = [];

		const recebedorData = MensagemService.generateCliente("Recebedor", ispb);
		const [recebedor] = await Cliente.findOrCreate({
			where: { cpfCnpj: recebedorData.cpfCnpj },
			defaults: recebedorData,
		});

		for (let i = 0; i < count; i++) {
			const pagadorData = MensagemService.generateCliente("Pagador");
			const [pagador] = await Cliente.findOrCreate({
				where: { cpfCnpj: pagadorData.cpfCnpj },
				defaults: pagadorData,
			});

			const mensagem = {
				endToEndId: `E${ispb}${new Date().getTime()}${i}`,
				valor: MensagemService.generateValor(),
				campoLivre: "",
				txId: uuidv4(),
				dataHoraPagamento: new Date(),
				pagadorId: pagador.id,
				recebedorId: recebedor.id,
			};

			mensagens.push(mensagem);
		}

		await Mensagem.bulkCreate(mensagens);
		return mensagens;
	}
}

module.exports = MensagemService;
