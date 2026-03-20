const fs = require('fs');
const path = require('path');

const commands = new Map();

// 📂 تحميل كل الملفات من مجلد معين
function loadFiles(dir) {
    const files = fs.readdirSync(dir);

    for (let file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        // لو مجلد → ادخل فيه (Recursive)
        if (stat.isDirectory()) {
            loadFiles(fullPath);
        }

        // لو ملف js
        else if (file.endsWith('.js')) {
            const command = require(fullPath);

            if (command.name && command.execute) {
                commands.set(command.name, command);
                console.log(`✅ Loaded: ${command.name}`);
            } else {
                console.log(`⚠️ تجاهل: ${file}`);
            }
        }
    }
}

// 📦 تحميل الأوامر من كل المجلدات
loadFiles(path.join(__dirname, 'commands'));


// 🎯 التعامل مع التحديثات
async function handleUpdate(update) {
    if (!update.message) return;

    const message = update.message;
    const text = message.text || "";
    const chatId = message.chat.id;

    const args = text.split(" ");
    const commandName = args[0].replace("/", "");

    try {
        // إذا أمر
        if (commands.has(commandName)) {
            await commands.get(commandName).execute(chatId, args, message);
        } 
        // غير ذلك → شات
        else if (commands.has("chat")) {
            await commands.get("chat").execute(chatId, args, message);
        }

    } catch (err) {
        console.error("❌ Error:", err);
    }
}

module.exports = { handleUpdate };
