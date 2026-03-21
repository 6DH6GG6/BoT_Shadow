const fs = require('fs');
const path = require('path');
const axios = require('axios');

const commands = new Map();

// نحمل فقط monitor.js من مجلد monitor
const monitorPath = path.join(__dirname, 'monitor');

function loadMonitor() {
    if (!fs.existsSync(monitorPath)) return;

    const files = fs.readdirSync(monitorPath);

    for (const file of files) {
        const fullPath = path.join(monitorPath, file);

        if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const required = require(fullPath);

                if (required.name && typeof required.execute === 'function') {
                    commands.set(required.name.toLowerCase(), required);
                    console.log(`👁️ Loaded monitor: ${required.name}`);
                }
            } catch (err) {
                console.log(`❌ Error loading monitor ${file}: ${err.message}`);
            }
        }
    }
}

loadMonitor();

// ================= HANDLER =================
async function handleUpdate(update) {
    try {
        if (!update.message) return;

        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text || "";
        const args = text.trim().split(/\s+/);
        const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

        // 🔥 تشغيل monitor.js دائماً (بدون أمر)
        const monitorCmd = commands.get('monitor');
        if (monitorCmd && monitorCmd.execute) {
            await monitorCmd.execute(chatId, args, message, commands);
        }

        // 🔥 إذا كتب /monitor يعرض البيانات
        if (commandName === "monitor" && commands.has("monitor")) {
            const cmd = commands.get("monitor");
            return await cmd.execute(chatId, args, message, commands);
        }

    } catch (err) {
        console.error("❌ admin2 error:", err);
    }
}

module.exports = { handleUpdate };
