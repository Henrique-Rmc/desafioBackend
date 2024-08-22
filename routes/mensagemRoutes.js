/* eslint-disable no-undef */
const express = require("express");
const router = express.Router();
const mensagemController = require("../controllers/mensagemController");

router.get("/pix/:ispb/stream/start", (req, res, next) =>
	mensagemController.getMensagemHandler(req, res, next)
);

router.post("/util/msgs/:ispb/:number", (req, res, next) =>
	mensagemController.postMensagemHandler(req, res, next)
);

module.exports = router;
