const { Mensagem, Cliente, sequelize } = require("../models");
const Generator = require("../utils/entityGenerator");
const MessageFormatter = require("../utils/messageFormatter");
const { v4: uuidv4 } = require("uuid");

const { Op } = require("sequelize");
//versao funcional
class MensagemService {
	constructor() {
		this.monitoring = {};
		this.pullNextUris = {};
		this.iterationIds = {};
		this.activeCollectors = {};
		this.messageAssignments = {};
	}

	async startMonitoring(ispb, acceptHeader, iterationId, res) {
		if (!this.activeCollectors[ispb]) {
			this.activeCollectors[ispb] = [];
		}
		if (!this.iterationIds[ispb]) {
			iterationId = this.getOrCreateIterationId(ispb)
			this.activeCollectors[ispb].push(iterationId)
		}

		else if (this.activeCollectors[ispb].length >= 6) {
			res.status(429).json({ error: "Limite máximo de coletores atingido." });
			return;
		}

		this.monitoring[ispb] = true;

		const timeout = 8000;
		const startTime = Date.now();

		try {
			while (this.monitoring[ispb]) {
				const mensagens = await this.getMessages(
					ispb,
					acceptHeader,
					iterationId
				);

				if (
					mensagens &&
					mensagens.status === 200 &&
					mensagens.mensagens.length > 0
				) {
					const pullNext = mensagens.headers["Pull-Next"];
					this.pullNextUris[ispb] = pullNext;

					const mensagemIds = mensagens.mensagens.map((msg) => msg.id);

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
			this.finalizeStream(ispb, iterationId);
			if (!res.headersSent) {
				res.end();
			}
		}
	}

	finalizeStream(ispb, iterationId) {
		if (this.activeCollectors[ispb]) {
			this.activeCollectors[ispb] = this.activeCollectors[ispb].filter(
				(id) => id !== iterationId
			);
		}
		delete this.monitoring[ispb];
	}

	async getMessages(ispb, acceptHeader, iterationId) {
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
						id: { [Op.notIn]: this.getAssignedMessageIds() }, 
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

				this.messageAssignments[iterationId] = (
					this.messageAssignments[iterationId] || []
				).concat(mensagens.map((msg) => msg.id));

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
			console.error("Erro ao buscar mensagens:", error);
			throw new Error("Error fetching messages");
		}
	}

	getAssignedMessageIds() {
		return Object.values(this.messageAssignments).flat();
	}

	getOrCreateIterationId(ispb) {
		if (!this.iterationIds[ispb]) {
			this.iterationIds[ispb] = uuidv4();
		}
		return this.iterationIds[ispb];
	}

	stopMonitoring(ispb, iterationId) {
		if (this.activeCollectors[ispb]) {
			this.activeCollectors[ispb] = this.activeCollectors[ispb].filter(
				(id) => id !== iterationId
			);
		}
		delete this.messageAssignments[iterationId];

		if (this.activeCollectors[ispb] && this.activeCollectors[ispb].length === 0) {
			delete this.monitoring[ispb];
			delete this.activeCollectors[ispb];
		}
	}

	async generateRandomMessages(ispb, count) {
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