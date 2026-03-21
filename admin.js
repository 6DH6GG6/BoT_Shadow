const fs = require('fs');
const path = require('path');
const axios = require('axios');

const commands = new Map();

// 🔥 تحميل الأوامر فقط من مجلدات محددة
const foldersToLoad = [
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'image')
];

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
                delete require.cache[require.resolve(fullPath)];
                const cmd = require(fullPath);
                if (cmd.name && typeof cmd.execute === 'function') {
                    commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`✅ Loaded command: ${cmd.name}`);
                }
            } catch (err) {
                console.log(`❌ Error loading ${file}: ${err.message}`);
            }
        }
    }
}

foldersToLoad.forEach(loadCommands);

// الرد التلقائي
async function autoReply(chatId, text, type) {
    const TOKEN = process.env.TOKEN;

    let reply = text;
    if (type === "private") reply = `👤 خاص:\n${text}`;
    else if (type === "group" || type === "supergroup") reply = `👥 مجموعة:\n${text}`;
    else if (type === "channel") reply = `📢 قناة:\n${text}`;

    try {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: reply
        });
    } catch (err) {
        console.log("❌ Send error:", err.response?.data || err.message);
    }
}

// منع تكرار /start
const sentStartUsers = new Set();

async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";
        const args = text.trim().split(/\s+/);
        const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

        // 🔥 منع تكرار start
        if (commandName === 'start') {
            const joinCmd = commands.get('start');
            if (joinCmd && joinCmd.execute && !sentStartUsers.has(message.from.id)) {
                sentStartUsers.add(message.from.id);
                await joinCmd.execute(chatId, args, message, commands);
            }
            return; // 🚨 يمنع أي تنفيذ إضافي
        }

        // باقي الأوامر
        if (commandName && commands.has(commandName)) {
            const cmd = commands.get(commandName);
            if (cmd.execute) await cmd.execute(chatId, args, message, commands);
        } 
        else if (commandName) {
            // ✅ قائمة الاستثناءات: الأوامر التي لا نريد إرسال رسالة ❌ لها
            const ignoreError = ['chat', 'group', 'monitor']; 
            if (!ignoreError.includes(commandName)) {
                await autoReply(
                    chatId,
                    `❌ الأمر /${commandName} غير موجود`,
                    message.chat.type
                );
            }
        } 
        else {
            await autoReply(chatId, text, message.chat.type);
        }

    } catch (err) {
        console.error("❌ Handle update error:", err);
    }
}

module.exports = { handleUpdate, commands };
