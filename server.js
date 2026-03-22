require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { king, admins } = require('./شبح_الظلام');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

console.log(`╭━━━━━༻❖༺━━━━━╮`);
console.log(`               👑 SHADOW OG 👑`);
console.log(`╰━━━━━༻❖༺━━━━━╯`);
console.log(`( 👑 جاري البدء ايها زعيم 👑 )`);

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        const update = req.body;

        for (const [name, adminModule] of admins) {
            if (adminModule && typeof adminModule.handleUpdate === 'function') {
                await adminModule.handleUpdate(update);
                console.log(`✅ Handled update with module: ${name}`);
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(`( ايها زعيم 👑 نواجه مشكلة في تشغيل سرفر عليك بإصلاحها 👀🥂 )`);
        res.sendStatus(500);
    }
});

app.get('/', (req, res) => {
    res.send("🤖 Bot is running...");
    console.log(`( السرفر ناجح وسا يبدء الدمار هاهاه 😈🔥 )`);
});

app.listen(PORT, () => {
    console.log(`( تاريخ طائفة الظلام كسبت مني بوتًا صلبًا لا يمكن قهره ☢️🔥 )`);
    console.log(`✅ Server running on port ${PORT}`);
});
