/* eslint-disable no-undef */
const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.get('/pix/:ispb/stream/start', messageController.getMessages);
router.post('/util/msgs/:ispb/:number', messageController.postMessages);


module.exports = router;
