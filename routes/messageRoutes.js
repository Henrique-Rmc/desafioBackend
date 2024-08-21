/* eslint-disable no-undef */
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// router.get('/pix/:ispb/stream/start', messageController.getMessagesHandler);
router.post("/util/msgs/:ispb/:number", (req, res, next) =>
	messageController.postMessageHandler(req, res, next)
);

module.exports = router;
