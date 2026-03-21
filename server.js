require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const admin = require('./admin');
const admin2 = require('./admin2');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;


app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        const update = req.body;

        
        await admin.handleUpdate(update);

        
        await admin2.handleUpdate(update);

        res.sendStatus(200);
    } catch (err) {
        console.error("❌ Webhook error:", err);
        res.sendStatus(500);
    }
});


app.get('/', (req, res) => {
    res.send("🤖 Bot is running...");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
