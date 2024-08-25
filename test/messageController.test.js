const mensagemController = require("../controllers/mensagemController");
const mensagemService = require("../services/mensagemService");

const mockResponse = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	res.send = jest.fn().mockReturnValue(res);
	res.end = jest.fn().mockReturnValue(res);
	return res;
};

describe("Testes do Controller de Mensagens", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it("deve iniciar o monitoramento e chamar o serviço de startMonitoring", async () => {
		const req = {
			params: { ispb: "12345678" },
			headers: { accept: "application/json" },
			query: { iterationIds: "abcd1234" },
		};
		const res = mockResponse();

		jest.spyOn(mensagemService, "startMonitoring").mockResolvedValue();

		await mensagemController.startMonitoringHandler(req, res);

		expect(mensagemService.startMonitoring).toHaveBeenCalledWith(
			"12345678",
			"application/json",
			"abcd1234",
			res
		);
	});

	it("deve parar o monitoramento e retornar status 200", async () => {
		const req = {
			params: { ispb: "12345678" },
		};
		const res = mockResponse();

		jest.spyOn(mensagemService, "stopMonitoring").mockImplementation(() => {});

		await mensagemController.stopMonitoringHandler(req, res);

		expect(mensagemService.stopMonitoring).toHaveBeenCalledWith("12345678");
		expect(res.status).toHaveBeenCalledWith(200);
	});

	it("deve retornar erro 400 se o número de mensagens a ser gerado for inválido", async () => {
		const req = {
			params: { ispb: "12345678", number: "-5" },
		};
		const res = mockResponse();

		await mensagemController.postMensagemHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: "Invalid number of mensagens to generate.",
		});
	});

	it("deve gerar mensagens aleatórias com sucesso e retornar status 201", async () => {
		const req = {
			params: { ispb: "12345678", number: "5" },
		};
		const res = mockResponse();

		const mensagensMock = [
			{ id: 1, valor: 100 },
			{ id: 2, valor: 200 },
		];

		jest
			.spyOn(mensagemService, "generateRandomMessages")
			.mockResolvedValue(mensagensMock);

		await mensagemController.postMensagemHandler(req, res);

		expect(mensagemService.generateRandomMessages).toHaveBeenCalledWith(
			"12345678",
			5
		);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({ mensagens: mensagensMock });
	});

	it("deve retornar erro 500 se houver falha na geração de mensagens", async () => {
		const req = {
			params: { ispb: "12345678", number: "5" },
		};
		const res = mockResponse();

		jest.spyOn(console, "error").mockImplementation(() => {});

		jest
			.spyOn(mensagemService, "generateRandomMessages")
			.mockRejectedValue(new Error("Erro ao gerar mensagens."));

		await mensagemController.postMensagemHandler(req, res);

		expect(mensagemService.generateRandomMessages).toHaveBeenCalledWith(
			"12345678",
			5
		);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			error: "Error generating mensagens.",
		});
	});
});
