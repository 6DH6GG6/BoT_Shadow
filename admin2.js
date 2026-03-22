const axios = require('axios');
const path = require('path');
const King = require('./king');
const king = new King();
const commands = new Map();

const monitorFolder = path.join(__dirname, 'monitor');
const monitorFiles = king.getFilesWithContent(monitorFolder);

for (const file of monitorFiles) {
    if (file.path.endsWith('.js')) {
        delete require.cache[require.resolve(file.path)];
        const required = require(file.path);
        if (required.name && typeof required.execute === 'function') {
            commands.set(required.name.toLowerCase(), required);
            console.log(`👁️ Loaded monitor module: ${required.name}`);
        }
    }
}

async function handleUpdate(update) {
    try {
        if (!update.message) return;
        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";
        const args = text.trim().split(/\s+/);
        const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

        if (commandName === "monitor" && commands.has("monitor")) {
            const cmd = commands.get("monitor");
            await cmd.execute(chatId, args, message, commands);
        }

    } catch (err) {
        console.error("❌ admin2.js handleUpdate error:", err);
    }
}

module.exports = { handleUpdate, commands };
