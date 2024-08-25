const MensagemService = require("../services/mensagemService");
const { Cliente, Mensagem, sequelize } = require("../models");
const { v4: uuidv4 } = require("uuid");

jest.mock("../models", () => ({
	Mensagem: {
		bulkCreate: jest.fn(),
		findAll: jest.fn(),
	},
	Cliente: {
		findOne: jest.fn(),
		findOrCreate: jest.fn(),
	},
	sequelize: {
		transaction: jest.fn((fn) => fn()),
	},
}));

describe("MensagemService", () => {
	let res;
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("deve criar um novo iterationId para um ispb quando não existir", () => {
		const ispb = "12345678";
		const iterationId = MensagemService.getOrCreateIterationId(ispb);

		expect(iterationId).toBeDefined();
		expect(MensagemService.iterationIds[ispb]).toBe(iterationId);
	});

	it("deve retornar o iterationId existente para um ispb", () => {
		const ispb = "12345678";
		const existingIterationId = uuidv4();
		MensagemService.iterationIds[ispb] = existingIterationId;

		const returnedIterationId = MensagemService.getOrCreateIterationId(ispb);

		expect(returnedIterationId).toBe(existingIterationId);
	});

	it("deve impedir a criação de mais de 6 coletores para um ispb", async () => {
		MensagemService.activeCollectors["12345678"] = [
			"coletor1",
			"coletor2",
			"coletor3",
			"coletor4",
			"coletor5",
			"coletor6",
		];

		await expect(
			MensagemService.startMonitoring(
				"12345678",
				"application/json",
				"newCollectorId"
			)
		).rejects.toThrow("Limite máximo de coletores atingido.");
	});

	it("deve gerar mensagens aleatórias com sucesso", async () => {
		const mockRecebedor = { id: "recebedor-id" };
		const mockMensagens = Array(5).fill({});

		Cliente.findOne.mockResolvedValue(mockRecebedor);
		Cliente.findOrCreate.mockResolvedValue([{ id: "pagador-id" }]);
		Mensagem.bulkCreate.mockResolvedValue(mockMensagens);

		const mensagens = await MensagemService.generateRandomMessages(
			"12345678",
			5
		);

		expect(mensagens).toHaveLength(5);
		expect(Cliente.findOne).toHaveBeenCalled();
		expect(Mensagem.bulkCreate).toHaveBeenCalled();
	});

	it("deve retornar status 204 ao tentar buscar mensagens sem recebedor", async () => {
		const ispb = "99999999";

		jest.spyOn(Cliente, "findOne").mockResolvedValue(null);

		const result = await MensagemService.getMessages(
			ispb,
			"application/json",
			"iterationId"
		);

		expect(result.status).toBe(204);
		expect(result.headers["Pull-Next"]).toContain(
			"/api/pix/99999999/stream/start"
		);
	});

	it("deve remover o coletor corretamente ao chamar stopMonitoring", () => {
		const ispb = "12345678";
		const iterationId = "collector1";

		MensagemService.activeCollectors[ispb] = [iterationId];
		MensagemService.stopMonitoring(ispb, iterationId);

		expect(MensagemService.activeCollectors[ispb]).toBeUndefined();
	});

	it("deve retornar o iterationId existente para um ispb", () => {
		const ispb = "12345678";
		const iterationId = "existing-iteration-id";
		MensagemService.iterationIds[ispb] = iterationId;
		const returnedId = MensagemService.getOrCreateIterationId(ispb);
		expect(returnedId).toBe(iterationId);
	});
	it("deve criar e retornar um novo iterationId para um ispb quando não existir", () => {
		const ispb = "12345678";
		const iterationId = MensagemService.getOrCreateIterationId(ispb);
		expect(iterationId).toBeDefined();
		expect(MensagemService.iterationIds[ispb]).toBe(iterationId);
	});
});
