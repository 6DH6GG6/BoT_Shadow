require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { king, admins } = require('./شبح_الظلام');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

console.log("╭━━━━━༻❖༺━━━━━╮");
console.log("        ✅ SHADOW OG ✅        ");
console.log("╰━━━━━༻❖༺━━━━━╯");
console.log(`🚀 Server initializing on port ${PORT}...`);

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        const update = req.body;

        for (const [name, adminModule] of admins) {
            if (adminModule && typeof adminModule.handleUpdate === 'function') {
                await adminModule.handleUpdate(update);
                console.log(`✅ Handled update with module: ${name}`);
            } else {
                console.log(`❌ Module missing handleUpdate: ${name}`);
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(`❌ Webhook error: ${err.message}`);
        res.sendStatus(500);
    }
});

app.get('/', (req, res) => {
    res.send("🤖 Bot is running...");
    console.log("✅ GET / request received");
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
