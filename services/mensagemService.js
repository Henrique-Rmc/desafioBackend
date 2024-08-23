const { Mensagem, Cliente, sequelize } = require("../models");
const Generator = require("../utils/entityGenerator"); 
const MessageFormatter = require("../utils/messageFormatter")

const { Op } = require("sequelize");

class MensagemService {
	static async getMensagens(ispb, acceptHeader) {
		try {
			const result = await sequelize.transaction(async (transaction) => {
				const recebedor = await Cliente.findOne({
					where: { ispb },
					transaction,
				});

				if (!recebedor) {
					return null;
				}

				const mensagens = await Mensagem.findAll({
					where: {
						recebedorId: recebedor.id,
						lida: false,
					},
					include: [
						{ model: Cliente, as: "pagador" },
						{ model: Cliente, as: "recebedor" },
					],
					order: [["createdAt", "ASC"]],
					limit: acceptHeader === "multipart/json" ? 10 : 1,
					transaction,
				});

				if (mensagens.length === 0) {
					return null;
				}

				const mensagemIds = mensagens.map((msg) => msg.id);
				await Mensagem.update(
					{ lida: true },
					{ where: { id: { [Op.in]: mensagemIds } }, transaction }
				);

				const formattedResponse = MessageFormatter.formatMessages(
					mensagens,
					acceptHeader
				);

				if (formattedResponse.multipart) {
					return { multipart: true, body: formattedResponse.body };
				} else {
					return { multipart: false, mensagem: formattedResponse.mensagem };
				}
			});

			return result;
		} catch (error) {
			throw new Error("Error fetching messages");
		}
	}


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

				await Mensagem.bulkCreate(mensagens, { transaction });
			});
			return mensagens;
		} catch (error) {
			throw new Error("Error generating messages", error);
		}
	}
}

module.exports = MensagemService;
