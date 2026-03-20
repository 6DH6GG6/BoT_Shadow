const fs = require('fs');
const path = require('path');

const commands = new Map();

// تحميل الأوامر تلقائي
const loadCommands = () => {
    const files = fs.readdirSync('./commands');
    for (let file of files) {
        const cmd = require(`./commands/${file}`);
        commands.set(cmd.name, cmd);
    }
};

loadCommands();

// التعامل مع التحديثات
async function handleUpdate(update) {
    if (!update.message) return;

    const text = update.message.text;
    const chatId = update.message.chat.id;

    if (!text) return;

    const args = text.split(" ");
    const commandName = args[0].replace("/", "");

    if (commands.has(commandName)) {
        await commands.get(commandName).execute(chatId, args);
    } else {
        // AI fallback
        const ai = commands.get("ai");
        if (ai) {
            await ai.execute(chatId, args);
        }
    }
}

module.exports = { handleUpdate };
