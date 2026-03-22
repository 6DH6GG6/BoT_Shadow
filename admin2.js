const fs = require('fs');
const path = require('path');

const commands = new Map();

// ❌ مجلدات ممنوعة
const ignored = ['node_modules', '.git'];

// 🔥 قراءة كل الملفات
function loadAll(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        // تجاهل مجلدات
        if (ignored.some(i => fullPath.includes(i))) continue;

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadAll(fullPath);
        } 
        else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const cmd = require(fullPath);

                // ✔ فقط الملفات التي تحتوي execute
                if (cmd && cmd.name && typeof cmd.execute === 'function') {
                    commands.set(cmd.name.toLowerCase(), cmd);
                    console.log(`👁️ Loaded: ${cmd.name}`);
                }

            } catch (err) {
                // ❌ تجاهل الأخطاء بدون كسر النظام
            }
        }
    }
}

// 🔥 تشغيل القراءة من جذر المشروع
loadAll(path.join(__dirname));

// ================= HANDLER =================
async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";

        // دعم /monitor و /monitor@bot
        if (text.startsWith('/monitor')) {
            const cmd = commands.get('monitor');
            if (cmd) {
                await cmd.execute(chatId, text.split(/\s+/), message, commands);
            }
        }

    } catch (err) {
        console.log("❌ admin2:", err.message);
    }
}

module.exports = { handleUpdate, commands };
