/* eslint-disable no-undef */
const express = require("express");
const messageRoutes = require("../routes/messageRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/", messageRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
