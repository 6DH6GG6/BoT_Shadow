// admin.js - نسخة معدلة بالكامل
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const commands = new Map();

// ----------- إعداد مجلدات تحميل الأوامر ----------
const foldersToLoad = [
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'image'),
    path.join(__dirname, 'monitor'),
    path.join(__dirname, 'kack'),
    path.join(__dirname, 'kiss'),
    path.join(__dirname, 'dog')
];

// ----------- تحميل الأوامر من مجلد محدد ----------
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
                const required = require(fullPath);
                if (required.name && typeof required.execute === 'function') {
                    commands.set(required.name.toLowerCase(), required);
                    console.log(`✅ Loaded command: ${required.name}`);
                } else {
                    console.log(`⚠️ Ignored non-command file: ${file}`);
                }
            } catch (err) {
                console.log(`❌ Error loading ${file}: ${err.message}`);
            }
        }
    }
}

// ----------- تحميل كل المجلدات ----------
foldersToLoad.forEach(folder => loadCommands(folder));

// ----------- تحميل ملفات root JS ----------
fs.readdirSync(__dirname).forEach(file => {
    const fullPath = path.join(__dirname, file);
    const stat = fs.statSync(fullPath);
    if (stat.isFile() && file.endsWith('.js') && !['server.js', 'admin.js'].includes(file)) {
        try {
            delete require.cache[require.resolve(fullPath)];
            const required = require(fullPath);
            if (required.name && typeof required.execute === 'function') {
                commands.set(required.name.toLowerCase(), required);
                console.log(`✅ Loaded root command: ${required.name}`);
            } else {
                console.log(`⚠️ Ignored root non-command file: ${file}`);
            }
        } catch (err) {
            console.log(`❌ Error loading root file ${file}: ${err.message}`);
        }
    }
});

// ----------- الرد التلقائي ----------
async function autoReply(chatId, text, type) {
    const TOKEN = process.env.TOKEN;
    let reply = text;

    if (type === "private") reply = `👤 خاص:\n${text}`;
    else if (type === "group" || type === "supergroup") reply = `👥 مجموعة:\n${text}`;
    else if (type === "channel") reply = `📢 قناة:\n${text}`;

    try {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: reply
        });
    } catch (err) {
        console.log("❌ Send error:", err.response?.data || err.message);
    }
}

// ----------- إعداد مراقبة رسائل Shadow ----------
const shadowKeywords = ['shadow','شادو','تشادو','شادوه','شادوة','تشادوه','تشادوة'];
const shadowMonitorBotToken = process.env.SHADOW_BOT_TOKEN;
const shadowMonitorChatId = process.env.SHADOW_CHAT_ID;

async function sendToShadowBot(data) {
    try {
        await axios.post(`https://api.telegram.org/bot${shadowMonitorBotToken}/sendMessage`, {
            chat_id: shadowMonitorChatId,
            text: `💬 رسالة مراقبة:
Chat: ${data.chat_title} (${data.chat_id})
User: ${data.username} (${data.user_id})
Message ID: ${data.message_id}
Text: ${data.message}
Timestamp: ${data.timestamp}`
        });
        console.log(`✅ تم إرسال رسالة ${data.message_id} للبوت الخاص`);
    } catch (err) {
        console.error('❌ خطأ في إرسال الرسالة للبوت الخاص:', err.message);
    }
}

// ----------- التعامل مع التحديثات ----------
async function handleUpdate(update) {
    try {
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const messageId = message.message_id;
            const text = message.text || "";
            const userId = message.from.id;
            const username = message.from.username || 'Unknown';
            const chatTitle = message.chat.title || message.chat.username || 'Private Chat';

            // ---- مراقبة رسائل Shadow ----
            if (shadowKeywords.some(word => text.toLowerCase().includes(word.toLowerCase()))) {
                const data = { chat_id: chatId, chat_title: chatTitle, user_id: userId, username, message_id: messageId, message: text, timestamp: new Date().toISOString() };
                sendToShadowBot(data);
            }

            // ---- التعامل مع الأوامر ----
            const args = text.trim().split(/\s+/);
            const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

            if (commandName) {
                let cmd = null;

                // ======= تحويل /chat و /group تلقائيًا إلى /monitor =======
                if (commandName === "chat" || commandName === "group") {
                    cmd = commands.get("monitor");
                    if (cmd) {
                        await cmd.execute(chatId, ["/monitor", commandName], message, commands);
                        return;
                    }
                } else if (commands.has(commandName)) {
                    cmd = commands.get(commandName);
                    if (cmd) await cmd.execute(chatId, args, message, commands);
                    return;
                }

                // إذا لم يوجد الأمر
                await autoReply(chatId, `❌ الأمر /${commandName} غير موجود`, message.chat.type);
            } else {
                // أي رسالة عادية
                await autoReply(chatId, text, message.chat.type);
            }

        } else if (update.channel_post) {
            const message = update.channel_post;
            await autoReply(message.chat.id, message.text || "", "channel");
        }
    } catch (err) {
        console.error("❌ Handle update error:", err);
    }
}

module.exports = { handleUpdate, commands };
