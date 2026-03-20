require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const king = require('./king'); // الاتصال بـ king.js

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

// Webhook endpoint → كل شيء يمر لـ king.js
app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        await king.handle(req.body); // أي تحديث يذهب لـ king
        res.sendStatus(200);
    } catch (err) {
        console.error("Webhook error:", err);
        res.sendStatus(500);
    }
});

app.get('/', (req, res) => res.send("Bot is running..."));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
