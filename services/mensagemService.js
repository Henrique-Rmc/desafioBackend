const { Mensagem, Cliente } = require("../models");
const Generator = require("../utils/generator"); // Importando a nova classe Generator

class MensagemService {


	
	static async generateRandomMensagens(ispb, count) {
		try {
			const mensagens = [];

			const recebedorData = Generator.generateCliente("Recebedor", ispb);
			const [recebedor] = await Cliente.findOrCreate({
				where: { cpfCnpj: recebedorData.cpfCnpj },
				defaults: recebedorData,
			});

			for (let i = 0; i < count; i++) {
				const pagadorData = Generator.generateCliente("Pagador");
				const [pagador] = await Cliente.findOrCreate({
					where: { cpfCnpj: pagadorData.cpfCnpj },
					defaults: pagadorData,
				});

				const mensagem = Generator.generateMensagem(
					ispb,
					pagador.id,
					recebedor.id,
					i
				);

				mensagens.push(mensagem);
			}

			await Mensagem.bulkCreate(mensagens);
			return mensagens;
		} catch (error) {
			throw new Error("Error generating messages");
		}
	}
}

module.exports = MensagemService;
