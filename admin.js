const fs = require('fs');
const path = require('path');
const axios = require('axios');

const commands = new Map();

// 🔹 المجلدات التي تريد تحميلها بالترتيب
const foldersToLoad = [
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'image'),
    path.join(__dirname, 'map'),
    path.join(__dirname, 'kack'),
    path.join(__dirname, 'kiss'),
    path.join(__dirname, 'dog')
];

// 🔄 دالة تحميل الملفات recursively
function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommands(fullPath); // الدخول للمجلد الفرعي
        } else if (file.endsWith('.js')) {
            try {
                const cmd = require(fullPath);
                if (cmd.name && cmd.execute) {
                    commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`✅ Loaded command: ${cmd.name} from ${fullPath}`);
                } else {
                    console.log(`⚠️ Ignored file (missing name/execute): ${file}`);
                }
            } catch (err) {
                console.log(`❌ Error loading file ${file}: ${err.message}`);
            }
        }
    }
}

// 🔹 تحميل جميع المجلدات المحددة
foldersToLoad.forEach(folder => loadCommands(folder));

// 🔹 تحميل أي ملفات .js بجانب server.js (باستثناء admin.js و server.js)
fs.readdirSync(__dirname).forEach(file => {
    const fullPath = path.join(__dirname, file);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && file.endsWith('.js') && !['server.js', 'admin.js'].includes(file)) {
        try {
            const cmd = require(fullPath);
            if (cmd.name && cmd.execute) {
                commands.set(cmd.name.toLowerCase(), cmd);
                console.log(`✅ Loaded command: ${cmd.name} from root`);
            } else {
                console.log(`⚠️ Ignored root file (missing name/execute): ${file}`);
            }
        } catch (err) {
            console.log(`❌ Error loading root file ${file}: ${err.message}`);
        }
    }
});

// 🔹 التعامل مع التحديثات
async function handleUpdate(update) {
    if (!update.message) return;

    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || "";
    const args = text.split(" ");
    const commandName = args[0].replace("/", "").toLowerCase();

    try {
        if (commands.has(commandName)) {
            await commands.get(commandName).execute(chatId, args, message);
        } else if (commands.has("chat")) {
            await commands.get("chat").execute(chatId, args, message);
        } else {
            // fallback
            await axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "البوت جاهز لكن لا يوجد أمر معروف، جرب /start"
            });
        }
    } catch (err) {
        console.error("Handle update error:", err);
    }
}

module.exports = { handleUpdate };
