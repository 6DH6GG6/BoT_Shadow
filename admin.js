const fs = require('fs');
const path = require('path');
const axios = require('axios');
const join = require('./join');

const commands = new Map();
commands.set(join.name, join);

// قراءة أي ملفات .js أو .json في أي مجلدات داخليّة أو خارجيّة
function readAllFiles(dir, result = []) {
    if (!fs.existsSync(dir)) return result;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) readAllFiles(fullPath, result);
        else if (file.endsWith('.js') || file.endsWith('.json')) {
            result.push(fullPath);
        }
    }

    return result;
}

async function handleUpdate(update) {
    if (!update.message) return;

    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || "";
    const args = text.trim().split(/\s+/);
    const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

    if (commandName === 'start') {
        await join.execute(chatId, args, message, commands);
    }
}

module.exports = { handleUpdate, commands, readAllFiles };
