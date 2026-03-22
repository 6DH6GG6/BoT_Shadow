const axios = require('axios');
const { king } = require('./king');

const commands = new Map();

for (const file of king.getFilesRecursive(__dirname)) {
    if (file.endsWith('.js')) {
        try {
            delete require.cache[require.resolve(file)];
            const cmd = require(file);
            if (cmd.name && typeof cmd.execute === 'function') {
                commands.set(cmd.name.toLowerCase(), cmd);
                console.log(`✅ Loaded command: ${cmd.name}`);
            }
        } catch (err) {
            console.log(`❌ Error loading ${file}: ${err.message}`);
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

        if (commandName === 'start' && commands.has('start')) {
            const cmd = commands.get('start');
            return await cmd.execute(chatId, args, message, commands);
        }

        if (commandName && commands.has(commandName)) {
            const cmd = commands.get(commandName);
            return await cmd.execute(chatId, args, message, commands);
        } else if (commandName) {
            await axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id,
                text: `❌ الأمر /${commandName} غير موجود`
            });
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

module.exports = { handleUpdate, commands };
