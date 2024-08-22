const { Mensagem, Cliente, sequelize } = require("../models");
const Generator = require("../utils/generator"); // Importando a nova classe Generator

class MensagemService {


	static async generateRandomMensagens(ispb, count) {
		try {
			const mensagens = [];

			await sequelize.transaction(async (transaction) => {

				let recebedor = await Cliente.findOne({
					where: { ispb: ispb },
					transaction,
				});

				recebedor = await Cliente.findOne({
					where: { ispb: ispb },
					transaction,
				});

				if (!recebedor) {
					const recebedorData = Generator.generateCliente("Recebedor", ispb);

					[recebedor] = await Cliente.findOrCreate({
						where: { cpfCnpj: recebedorData.cpfCnpj },
						defaults: recebedorData,
						transaction,
					});
				}

				for (let i = 0; i < count; i++) {
					const pagadorData = Generator.generateCliente("Pagador");
					const [pagador] = await Cliente.findOrCreate({
						where: { cpfCnpj: pagadorData.cpfCnpj },
						defaults: pagadorData,
						transaction,
					});

					const mensagem = Generator.generateMensagem(
						ispb,
						pagador.id,
						recebedor.id,
						i
					);

					mensagens.push(mensagem);
				}

				await Mensagem.bulkCreate(mensagens, {transaction});
			});
			return mensagens;
		} catch (error) {
			throw new Error("Error generating messages", error);
		}
	}
}

module.exports = MensagemService;
