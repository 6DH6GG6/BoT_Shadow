const axios = require('axios');
const king = require('./king');

const commands = new Map();

function loadCommands() {
    const files = king.getFilesWithContent();
    for (const file of files) {
        if (file.ext === '.js') {
            try {
                const cmd = king.requireFile(file.path);
                if (cmd.name && typeof cmd.execute === 'function') {
                    commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`✅ Loaded command: ${cmd.name}`);
                }
            } catch (err) {
                console.log(`❌ Error loading ${file.name}: ${err.message}`);
            }
        }
    }
}

loadCommands();

const sentStartUsers = new Set();

async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";
        const args = text.trim().split(/\s+/);
        const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

        if (commandName === 'start') {
            const startCmd = commands.get('start');
            if (startCmd && typeof startCmd.execute === 'function') {
                await startCmd.execute(chatId, args, message, commands);
            }
            return;
        }

        if (commandName && commands.has(commandName)) {
            const cmd = commands.get(commandName);
            if (cmd.execute) await cmd.execute(chatId, args, message, commands);
        } else if (commandName) {
            if (!['chat','group','monitor'].includes(commandName)) {
                await axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                    chat_id,
                    text: `❌ الأمر /${commandName} غير موجود`
                });
            }
        } else {
            await axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id,
                text
            });
        }

    } catch (err) {
        console.error("❌ Handle update error:", err);
    }
}

module.exports = { handleUpdate, commands, loadCommands };
