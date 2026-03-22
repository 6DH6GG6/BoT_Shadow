const join = require('./join');

async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const text = message.text || "";

        // دعم /start و /start@bot
        if (text.startsWith('/start')) {
            await join.execute(message.chat.id, text.split(/\s+/), message);
        }

    } catch (err) {
        console.log("❌ admin.js:", err.message);
    }
}

module.exports = { handleUpdate };
