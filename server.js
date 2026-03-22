require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { king, admins } = require('./شبح_الظلام');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

// ألوان ANSI
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

console.log(`${colors.magenta}╭━━━━━༻❖༺━━━━━╮`);
console.log(`ٰ               👑 SHADOW OG 👑`);
console.log(`${colors.magenta}╰━━━━━༻❖༺━━━━━╯`);
console.log(`${colors.cyan}( 👑 جاري البدء ايها زعيم 👑 )${colors.reset}`);

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    try {
        const update = req.body;

        for (const [name, adminModule] of admins) {
            if (adminModule && typeof adminModule.handleUpdate === 'function') {
                await adminModule.handleUpdate(update);
                console.log(`${colors.green}✅ Handled update with module: ${name}${colors.reset}`);
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.log(`${colors.red}( ايها زعيم 👑 نواجه مشكلة في تشغيل سرفر عليك بإصلاحها 👀🥂 )`);
        console.error(err.message);
        res.sendStatus(500);
    }
});

app.get('/', (req, res) => {
    res.send("🤖 Bot is running...");
    console.log(`${colors.yellow}( السرفر ناجح وسا يبدء الدمار هاهاه 😈🔥 )${colors.reset}`);
});

app.listen(PORT, () => {
    console.log(`${colors.bright}${colors.green}( تاريخ طائفة الظلام كسبت مني بوتًا صلبًا لا يمكن قهره ☢️🔥 )${colors.reset}`);
    console.log(`${colors.green}✅ Server running on port ${PORT}${colors.reset}`);
});
