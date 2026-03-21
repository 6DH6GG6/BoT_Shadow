require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { king, admins } = require('./شبح_الظلام');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        const update = req.body;

        for (const [name, adminModule] of admins) {
            if (adminModule && typeof adminModule.handleUpdate === 'function') {
                await adminModule.handleUpdate(update);
            }
        }

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
