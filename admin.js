const fs = require('fs');
const path = require('path');
const axios = require('axios');

const commands = new Map();

// 📂 تحميل كل ملفات js داخل مجلد commands (Recursive)
function loadCommands(dir) {
    const files = fs.readdirSync(dir);

    for (let file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            const cmd = require(fullPath);
            if (cmd.name && cmd.execute) {
                commands.set(cmd.name, cmd);
                console.log(`✅ Loaded command: ${cmd.name}`);
            } else {
                console.log(`⚠️ Ignored file: ${file}`);
            }
        }
    }
}

// تحميل أوامر من commands/
loadCommands(path.join(__dirname, 'commands'));

async function handleUpdate(update) {
    if (!update.message) return;

    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || "";
    const args = text.split(" ");
    const commandName = args[0].replace("/", "").toLowerCase();

    try {
        if (commands.has(commandName)) {
            await commands.get(commandName).execute(chatId, args, message);
        } else if (commands.has("chat")) {
            await commands.get("chat").execute(chatId, args, message);
        } else {
            // fallback
            await axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "البوت جاهز لكن لا يوجد أمر معروف، جرب /start"
            });
        }
    } catch (err) {
        console.error("Handle update error:", err);
    }
}

module.exports = { handleUpdate };
