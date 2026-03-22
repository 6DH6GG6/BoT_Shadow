require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { admins } = require('./KING/king');

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
                console.log(`✅ ${name} handled update`);
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error(`( ايها زعيم 👑 نواجه مشكلة 👀🥂 )`);
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get('/', (req, res) => {
    res.send("🤖 Bot is running...");
    console.log(`( السرفر ناجح 😈🔥 )`);
});

app.listen(PORT, () => {
    console.log(`( تم تشغيل السرفر ☢️🔥 )`);
    console.log(`✅ PORT ${PORT}`);
});
