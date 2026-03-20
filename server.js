require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('./admin');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;

// Webhook endpoint
app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        const update = req.body;
        await admin.handleUpdate(update);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get('/', (req, res) => {
    res.send("Bot is running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
