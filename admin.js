const fs = require('fs');
const path = require('path');

const commands = new Map();

// ❌ مجلدات يتم تجاهلها
const ignored = ['node_modules', '.git'];

// 🔥 قراءة كل ملفات المشروع
function loadAll(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        // تجاهل مجلدات غير مهمة
        if (ignored.some(i => fullPath.includes(i))) continue;

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadAll(fullPath);
        } 
        else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const cmd = require(fullPath);

                // ✔ فقط الأوامر الصحيحة
                if (cmd && cmd.name && typeof cmd.execute === 'function') {
                    commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`✅ Loaded: ${cmd.name}`);
                }

            } catch (err) {
                // تجاهل أي ملف فيه خطأ
            }
        }
    }
}

// 🔥 تحميل كل شيء من جذر المشروع
loadAll(path.join(__dirname));

// ================= HANDLER =================
async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";
        const args = text.trim().split(/\s+/);

        // استخراج اسم الأمر بدون @bot
        let commandName = null;

        if (text.startsWith("/")) {
            commandName = args[0]
                .split("@")[0] // يدعم /start@bot
                .slice(1)
                .toLowerCase();
        }

        // 🔥 تنفيذ /start (join.js)
        if (commandName === "start") {
            const cmd = commands.get("start");
            if (cmd) {
                return await cmd.execute(chatId, args, message, commands);
            }
        }

        // 🔥 تنفيذ باقي الأوامر
        if (commandName && commands.has(commandName)) {
            const cmd = commands.get(commandName);
            if (cmd && cmd.execute) {
                return await cmd.execute(chatId, args, message, commands);
            }
        }

    } catch (err) {
        console.log("❌ admin.js:", err.message);
    }
}

module.exports = { handleUpdate, commands };
