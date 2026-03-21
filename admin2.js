const axios = require('axios');
const king = require('./king');

const commands = new Map();

function loadMonitor() {
    const files = king.getFilesWithContent();
    for (const file of files) {
        if (file.ext === '.js') {
            try {
                const cmd = king.requireFile(file.path);
                if (cmd.name && typeof cmd.execute === 'function' && cmd.name.toLowerCase() === 'monitor') {
                    commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`👁️ Loaded monitor: ${cmd.name}`);
                }
            } catch (err) {
                console.log(`❌ Error loading monitor ${file.name}: ${err.message}`);
            }
        }
    }
}

loadMonitor();

async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";
        const args = text.trim().split(/\s+/);
        const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

        if (commandName === "monitor") {
            if (commands.has("monitor")) {
                const cmd = commands.get("monitor");
                return await cmd.execute(chatId, args, message, commands);
            }
        }

    } catch (err) {
        console.error("❌ admin2 error:", err);
    }
}

module.exports = { handleUpdate, commands, loadMonitor };
