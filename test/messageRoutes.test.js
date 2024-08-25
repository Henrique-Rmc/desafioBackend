const mensagemService = require("../services/mensagemService");
const mensagemController = require("../controllers/mensagemController");

const mockResponse = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	res.send = jest.fn().mockReturnValue(res);
	res.end = jest.fn().mockReturnValue(res);
	return res;
};

describe("Testes das Rotas de Mensagens", () => {
	it("deve iniciar um stream e retornar 204 quando não há mensagens", async () => {
		const req = {
			params: { ispb: "12345678" },
			headers: { accept: "application/json" },
			query: { iterationId: 0 },
		};
		const res = mockResponse();


		jest
			.spyOn(mensagemService, "startMonitoring")
			.mockImplementation(async (ispb, acceptHeader, iterationId, res) => {
				res.status(204).send(); 
			});

		await mensagemController.startMonitoringHandler(req, res);

		expect(mensagemService.startMonitoring).toHaveBeenCalledWith(
			"12345678",
			"application/json",
			0, 
			res
		);
		expect(res.status).toHaveBeenCalledWith(204);
	});

	it("deve gerar mensagens aleatórias com sucesso", async () => {
		const req = {
			params: { ispb: "12345678", number: "5" },
		};
		const res = mockResponse();

		jest.spyOn(mensagemService, "generateRandomMessages").mockResolvedValue([
			{ id: 1, valor: 100 },
			{ id: 2, valor: 200 },
		]);

		await mensagemController.postMensagemHandler(req, res);

		expect(mensagemService.generateRandomMessages).toHaveBeenCalledWith(
			"12345678",
			5
		);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({
			mensagens: [
				{ id: 1, valor: 100 },
				{ id: 2, valor: 200 },
			],
		});
	});
});
