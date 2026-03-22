require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { king } = require('./king');
const admin = require('./admin');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

console.log(`
╭━━━━━༻❖༺━━━━━╮
ٰ       👑 SHADOW OG 👑
╰━━━━━༻❖༺━━━━━╯
( 👑 جاري البدء ايها زعيم 👑 )
`);

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        const update = req.body;
        await admin.handleUpdate(update);
        res.sendStatus(200);
        console.log(`✅ تم معالجة التحديث`);
    } catch (err) {
        console.log(`( ايها زعيم 👑 نواجه مشكلة في تشغيل سرفر 👀🥂 )`);
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
