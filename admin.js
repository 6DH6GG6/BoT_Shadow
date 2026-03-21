const fs = require('fs');
const path = require('path');
const axios = require('axios');

const commands = new Map();

// تحميل الأوامر
const foldersToLoad = [
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'image'),
    path.join(__dirname, 'monitor')
];

function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) loadCommands(fullPath);
        else if (file.endsWith('.js')) {
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

const sentStartUsers = new Set();

async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";
        const args = text.trim().split(/\s+/);
        const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

        // 🔥 /start يتم مع join.js
        if (commandName === 'start') {
            const startCmd = commands.get('start');
            if (startCmd && startCmd.execute) {
                await startCmd.execute(chatId, args, message, commands);
            }
            return; // 🚨 لا أي شيء آخر
        }

        // 🔥 باقي الأوامر
        if (commandName && commands.has(commandName)) {
            const cmd = commands.get(commandName);
            if (cmd.execute) await cmd.execute(chatId, args, message, commands);
        }
        else if (commandName) {
            // تجاهل /chat و /group لأنها خاصة بـ /monitor
            if (!['chat','group'].includes(commandName)) {
                await axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                    chat_id,
                    text: `❌ الأمر /${commandName} غير موجود`
                });
            }
        } else {
            // رسائل نصية عادية
            await axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id,
                text
            });
        }

    } catch (err) {
        console.error("❌ Handle update error:", err);
    }
}

module.exports = { handleUpdate, commands };
