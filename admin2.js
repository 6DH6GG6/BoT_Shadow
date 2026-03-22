const monitor = require('./monitor');
const commands = new Map();
commands.set(monitor.name, monitor);

async function handleUpdate(update) {
    if (!update.message) return;

    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || "";
    const args = text.trim().split(/\s+/);
    const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

    if (commandName === 'monitor') {
        await monitor.execute(chatId, args, message, commands);
    }
}

module.exports = { handleUpdate, commands };
