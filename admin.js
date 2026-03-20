const fs = require('fs');
const path = require('path');
const axios = require('axios');

const commands = new Map();

// 🔹 المجلدات
const foldersToLoad = [
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'image'),
    path.join(__dirname, 'map'),
    path.join(__dirname, 'kack'),
    path.join(__dirname, 'kiss'),
    path.join(__dirname, 'dog')
];

// 🔄 تحميل الملفات recursively
function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)]; // 🔥 منع الكاش
                const cmd = require(fullPath);

                if (cmd.name && cmd.execute) {
                    commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`✅ Loaded: ${cmd.name}`);
                } else {
                    console.log(`⚠️ Ignored (no name/execute): ${file}`);
                }
            } catch (err) {
                console.log(`❌ Error loading ${file}: ${err.message}`);
            }
        }
    }
}

// 🔹 تحميل المجلدات
foldersToLoad.forEach(folder => loadCommands(folder));

// 🔹 تحميل ملفات root
fs.readdirSync(__dirname).forEach(file => {
    const fullPath = path.join(__dirname, file);
    const stat = fs.statSync(fullPath);

    if (
        stat.isFile() &&
        file.endsWith('.js') &&
        !['server.js', 'admin.js'].includes(file)
    ) {
        try {
            delete require.cache[require.resolve(fullPath)];
            const cmd = require(fullPath);

            if (cmd.name && cmd.execute) {
                commands.set(cmd.name.toLowerCase(), cmd);
                console.log(`✅ Loaded root: ${cmd.name}`);
            }
        } catch (err) {
            console.log(`❌ Error loading root file ${file}: ${err.message}`);
        }
    }
});

// 🧠 الرد التلقائي
async function autoReply(chatId, text, type) {
    const TOKEN = process.env.TOKEN;

    let reply;

    if (type === "private") {
        reply = `👤 خاص:\n${text}`;
    } else if (type === "group" || type === "supergroup") {
        reply = `👥 مجموعة:\n${text}`;
    } else if (type === "channel") {
        reply = `📢 قناة:\n${text}`;
    } else {
        reply = text;
    }

    try {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: reply
        });
    } catch (err) {
        console.log("❌ Send error:", err.response?.data || err.message);
    }
}

// 🔥 المعالجة الرئيسية
async function handleUpdate(update) {
    try {

        // 📩 الرسائل (خاص + مجموعات)
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text || "";

            const args = text.trim().split(/\s+/);

            // ✅ تحليل الأمر بشكل صحيح
            const commandName = text.startsWith("/")
                ? args[0].slice(1).toLowerCase()
                : null;

            console.log("📌 Command:", commandName);
            console.log("📦 Commands:", Array.from(commands.keys()));

            // ✅ تنفيذ الأمر
            if (commandName && commands.has(commandName)) {
                await commands.get(commandName).execute(chatId, args, message);
            } else {
                await autoReply(chatId, text, message.chat.type);
            }
        }

        // 📢 القنوات
        else if (update.channel_post) {
            const message = update.channel_post;
            const chatId = message.chat.id;
            const text = message.text || "";

            await autoReply(chatId, text, "channel");
        }

    } catch (err) {
        console.error("❌ Handle update error:", err);
    }
}

module.exports = { handleUpdate, commands };
