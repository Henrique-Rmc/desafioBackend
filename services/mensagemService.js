const { Mensagem, Cliente, sequelize } = require("../models");
const Generator = require("../utils/entityGenerator");
const MessageFormatter = require("../utils/messageFormatter");

const { Op } = require("sequelize");

class MensagemService {
	constructor() {
		this.monitoring = {}
		this.pullNextUris = {}
	}

	async startMonitoring(ispb, acceptHeader, lastMessageId, res) {
		this.monitoring[ispb] = true;

		while (this.monitoring[ispb]) {
			const mensagens = await this.getMensagens(ispb, acceptHeader, lastMessageId)
			if (mensagens && mensagens.status == 200) {
				const pullNext = mensagens.headers["Pull-Next"]
				this.pullNextUris[ispb] = pullNext

				lastMessageId = pullNext.split("lastMessageId=")[1]
				
				if (mensagens.multipart) {
					res.write(mensagens.body)
				} else {
					res.json(mensagens.mensagem)
					break
				}
			}
			await new Promise((resolve) => setTimeout(resolve, 5000))
		}
		res.end()
	}

	static async getMensagens(ispb, acceptHeader, lastMessageId) {
		try {
			const result = await sequelize.transaction(async (transaction) => {
				const recebedor = await Cliente.findOne({
					where: { ispb },
					transaction,
				});

				if (!recebedor) {
					return { status: 204 };
				}

				const mensagens = await Mensagem.findAll({
					where: {
						recebedorId: recebedor.id,
						id: {[Op.gt]: lastMessageId || 0 },
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
					return { status: 204 };
				}

				const lastReadMessageId = mensagens[mensagens.length - 1]?.id;

				const pullNextUri = `/api/pix/${ispb}/stream/start?lastMessageId=${lastReadMessageId}`;

				const formattedResponse = MessageFormatter.formatMessages(
					mensagens,
					acceptHeader
				);

				if (formattedResponse.multipart) {
					return {
						status: 200,
						headers: { "Pull-Next": pullNextUri },
						body: formattedResponse.body,
					};
				} else {
					return {
						status: 200,
						headers: {"Pull-Next": pullNextUri},
						mensagem: formattedResponse.mensagem
					};
				}
			});
			return result;
		} catch (error) {
			throw new Error("Error fetching messages", error);
		}
	}
	stopMonitoring(ispb) {
		this.monitoring[ispb] = false
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
