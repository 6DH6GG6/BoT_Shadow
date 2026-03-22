const monitor = require('./monitor');

async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const text = message.text || "";

        // دعم /monitor و /monitor@bot
        if (text.startsWith('/monitor')) {
            await monitor.execute(message.chat.id, text.split(/\s+/), message);
        }

    } catch (err) {
        console.log("❌ admin2.js:", err.message);
    }
}

module.exports = { handleUpdate };
