/* eslint-disable no-undef */
const express = require("express");
const router = express.Router();
const mensagemController = require("../controllers/mensagemController");

router.get("/pix/:ispb/stream/start", (req, res, next) =>
	mensagemController.startMonitoringHandler(req, res, next)
);
router.delete("/pix/:ispb/stream/stop", (req, res, next) =>
	mensagemController.stopMonitoringHandler(req, res, next)
);

router.post("/util/msgs/:ispb/:number", (req, res, next) =>
	mensagemController.postMensagemHandler(req, res, next)
);

module.exports = router;
