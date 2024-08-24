const { Mensagem, Cliente, sequelize } = require("../models");
const Generator = require("../utils/entityGenerator");
const MessageFormatter = require("../utils/messageFormatter");
const { v4: uuidv4 } = require("uuid");

const { Op } = require("sequelize");

class MensagemService {
	constructor() {
		this.monitoring = {};
		this.pullNextUris = {};
		this.iterationIds = {};
	}

	async startMonitoring(ispb, acceptHeader, iterationId, res) {
		this.monitoring[ispb] = true;
		iterationId = this.getOrCreateIterationId(ispb);

		const timeout = 8000;
		const startTime = Date.now();

		try {
			while (this.monitoring[ispb]) {
				const mensagens = await this.getMensagens(ispb, acceptHeader);

				if (
					mensagens &&
					mensagens.status === 200 &&
					mensagens.mensagens.length > 0
				) {
					const pullNext = mensagens.headers["Pull-Next"];
					this.pullNextUris[ispb] = pullNext;

					const mensagemIds = mensagens.mensagens.map((msg) => msg.id);
					await Mensagem.update({ lida: true }, { where: { id: mensagemIds } });

					if (acceptHeader === "multipart/json") {
						res.write(mensagens.body); 
						res.end(); 
					} else {
						res.json(mensagens.mensagem); 
					}
					return; 
				}

				const elapsedTime = Date.now() - startTime;

				if (elapsedTime < timeout) {
					await new Promise((resolve) => setTimeout(resolve, 500)); 
				} else {
				
					if (!res.headersSent) {
						res.setHeader(
							"Pull-Next",
							this.pullNextUris[ispb] ||
								`/api/pix/${ispb}/stream/start?iterationId=${iterationId}`
						);
						res.status(204).send();
					}
					return; 
				}
			}
		} catch (error) {
			console.error("Erro no monitoramento:", error);
		} finally {
			if (!res.headersSent) {
				res.end(); 
			}
		}
	}

	async getMensagens(ispb, acceptHeader) {
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
							"Pull-Next": `/api/pix/${ispb}/stream/start?iterationId=${this.getOrCreateIterationId(ispb)}`,
						},
					};
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
					order: [
						["createdAt", "ASC"],
						["id", "ASC"],
					],
					limit: acceptHeader === "multipart/json" ? 10 : 1,
					transaction,
				});

				if (mensagens.length === 0) {
					return {
						status: 204,
						headers: {
							"Pull-Next": `/api/pix/${ispb}/stream/start?iterationId=${this.getOrCreateIterationId(ispb)}`,
						},
					};
				}

				const pullNextUri = `/api/pix/${ispb}/stream/start?iterationId=${this.getOrCreateIterationId(ispb)}`;

				const formattedResponse = MessageFormatter.formatMessages(
					mensagens,
					acceptHeader
				);

				return {
					status: 200,
					headers: { "Pull-Next": pullNextUri },
					mensagens,
					...formattedResponse,
				};
			});

			return result;
		} catch (error) {
			throw new Error("Error fetching messages", error);
		}
	}

	getOrCreateIterationId(ispb) {
		if (!this.iterationIds[ispb]) {
			this.iterationIds[ispb] = uuidv4();
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
