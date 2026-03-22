const axios = require('axios');
const path = require('path');
const King = require('./king');
const king = new King();
const joinPath = path.join(__dirname, 'join');
const commands = new Map();

const joinFiles = king.getFilesWithContent(joinPath);
for (const file of joinFiles) {
    if (file.path.endsWith('.js')) {
        delete require.cache[require.resolve(file.path)];
        const required = require(file.path);
        if (required.name && typeof required.execute === 'function') {
            commands.set(required.name.toLowerCase(), required);
            console.log(`✅ Loaded join module: ${required.name}`);
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

        if (commandName === 'start') {
            const joinCmd = commands.get('start');
            if (joinCmd && typeof joinCmd.execute === 'function') {
                await joinCmd.execute(chatId, args, message, commands);
            }
        }

    } catch (err) {
        console.error("❌ admin.js handleUpdate error:", err);
    }
}

module.exports = { handleUpdate, commands };
