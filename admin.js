const fs = require('fs');
const path = require('path');

const commands = new Map();

// فقط هذه المجلدات
const foldersToLoad = [
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'image'),
    path.join(__dirname, 'monitor')
];

function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const cmd = require(fullPath);

                if (cmd.name && typeof cmd.execute === 'function') {
                    commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`✅ Loaded: ${cmd.name}`);
                }
            } catch (err) {
                console.log(`❌ Error: ${file}`, err.message);
            }
        }
    }
}

foldersToLoad.forEach(loadCommands);

// ================= HANDLER =================
async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";

        const args = text.trim().split(/\s+/);
        const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

        // تنفيذ الأوامر فقط إذا كانت /command
        if (commandName && commands.has(commandName)) {
            const cmd = commands.get(commandName);
            await cmd.execute(chatId, args, message, commands);
        }

    } catch (err) {
        console.log("❌ Update Error:", err.message);
    }
}

module.exports = { handleUpdate, commands };
