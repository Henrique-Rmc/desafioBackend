const { Mensagem, Cliente, sequelize } = require("../models");
const Generator = require("../utils/entityGenerator");
const MessageFormatter = require("../utils/messageFormatter");

const { Op } = require("sequelize");

class MensagemService {
	constructor() {
		this.monitoring = {};
		this.pullNextUris = {};
		this.iterationIds = {};
	}

	async startMonitoring(ispb, acceptHeader, lastMessageId, res) {
		this.monitoring[ispb] = true;
		const iterationId = this.getOrCreateIterationId(ispb);

		while (this.monitoring[ispb]) {
			const mensagens = await this.getMensagens(
				ispb,
				acceptHeader,
				lastMessageId
			);
			if (mensagens && mensagens.status == 200) {
				const pullNext = mensagens.headers["Pull-Next"];
				this.pullNextUris[ispb] = pullNext;

				lastMessageId = pullNext.split("lastMessageId=")[1];

				const mensagemIds = mensagens.mensagens.map((msg) => msg.id);
				await Mensagem.update({ lida: true }, { where: { id: mensagemIds } });

				if (mensagens.multipart) {
					res.write(mensagens.body);
				} else {
					res.json(mensagens.mensagem);
					break;
				}
			} else if (mensagens.status === 204) {
				res.setHeader("Pull-Next", mensagens.headers["Pull-Next"]);
				res.status(204).send();
				break;
			}
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
		res.end();
	}

	async getMensagens(
		ispb,
		acceptHeader,
		lastMessageTimestamp,
		lastMessageEndToEndId
	) {
		try {
			const result = await sequelize.transaction(async (transaction) => {
				const recebedor = await Cliente.findOne({
					where: { ispb },
					transaction,
				});

				if (!recebedor) {
					return {
						status: 204,
						headers: {
							"Pull-Next": `/api/pix/${ispb}/stream/start?lastMessageTimestamp=${lastMessageTimestamp}&lastMessageEndToEndId=${lastMessageEndToEndId}`,
						},
					};
				}
				const mensagens = await Mensagem.findAll({
					where: {
						recebedorId: recebedor.id,
						lida: false,
						...(lastMessageTimestamp && {
							[Op.or]: [
								{
									createdAt: {
										[Op.gt]: new Date(parseInt(lastMessageTimestamp)),
									},
								},
								{
									createdAt: {
										[Op.eq]: new Date(parseInt(lastMessageTimestamp)),
									},
									endToEndId: { [Op.gt]: lastMessageEndToEndId },
								},
							],
						}),
					},
					include: [
						{ model: Cliente, as: "pagador" },
						{ model: Cliente, as: "recebedor" },
					],
					order: [
						["createdAt", "ASC"],
						["endToEndId", "ASC"],
					],
					limit: acceptHeader === "multipart/json" ? 10 : 1,
					transaction,
				});

				if (mensagens.length === 0) {
					return {
						status: 204,
						headers: {
							"Pull-Next": `/api/pix/${ispb}/stream/start?lastMessageTimestamp=${lastMessageTimestamp}&lastMessageEndToEndId=${lastMessageEndToEndId}`,
						},
					};
				}

				const lastReadMessage = mensagens[mensagens.length - 1];
				const pullNextUri = `/api/pix/${ispb}/stream/start?lastMessageTimestamp=${lastReadMessage.createdAt.getTime()}&lastMessageEndToEndId=${lastReadMessage.endToEndId}`;

				const formattedResponse = MessageFormatter.formatMessages(
					mensagens,
					acceptHeader
				);

				return {
					status: 200,
					headers: { "Pull-Next": pullNextUri },
					lastMessageTimestamp: lastReadMessage.createdAt.getTime(),
					lastMessageEndToEndId: lastReadMessage.endToEndId,
					mensagens,
					...formattedResponse,
				};
			});

			return result;
		} catch (error) {
			throw new Error("Error fetching messages", error);
		}
	}
	async getOrCreateIterationId(ispb) {
		if (!this.iterationIds[ispb]) {
			const { nanoid } = await import("nanoid");
			this.iterationIds[ispb] = nanoid();
		}
		return this.iterationIds[ispb];
	}

	stopMonitoring(ispb) {
		this.monitoring[ispb] = false;
	}

	async generateRandomMensagens(ispb, count) {
		try {
			const mensagens = [];

			await sequelize.transaction(async (transaction) => {
				let recebedor = await Cliente.findOne({
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
			console.error("Erro ao gerar mensagens:", error);
			throw new Error("Error generating messages");
		}
	}
}

module.exports = new MensagemService();
