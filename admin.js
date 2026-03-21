// admin.js - نسخة مصححة لتخزين الرسائل والمجموعات تلقائيًا
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

// ----------- تحميل الأوامر من المجلدات ----------
function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) loadCommands(fullPath);
        else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const required = require(fullPath);
                if (required.name && typeof required.execute === 'function') {
                    commands.set(required.name.toLowerCase(), required);
                    console.log(`✅ Loaded command: ${required.name}`);
                }
            } catch (err) {
                console.log(`❌ Error loading ${file}: ${err.message}`);
            }
        }
    }
}

// تحميل كل المجلدات
foldersToLoad.forEach(folder => loadCommands(folder));

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

// ----------- كلمات مراقبة Shadow --------
const shadowKeywords = ['shadow','شادو','تشادو','شادوه','شادوة','تشادوه','تشادوة','شادوا','تشادوا'];
const shadowMonitorBotToken = process.env.SHADOW_BOT_TOKEN;
const shadowMonitorChatId = process.env.SHADOW_CHAT_ID;

// ----------- التعامل مع التحديثات --------
async function handleUpdate(update) {
    try {
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const messageId = message.message_id;
            const text = message.text || "";
            const userId = message.from.id;
            const username = message.from.username || `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim();
            const chatTitle = message.chat.title || message.chat.username || 'Private Chat';

            // ---- إنشاء مجلد monitor إذا لم يكن موجود ----
            const monitorPath = path.join(__dirname, 'monitor');
            if (!fs.existsSync(monitorPath)) fs.mkdirSync(monitorPath, { recursive: true });
            const chatFile = path.join(monitorPath, 'chat.json');
            const groupFile = path.join(monitorPath, 'idGroup.json');

            // ---- مراقبة Shadow وإرسال للبوت الخاص ----
            if (shadowKeywords.some(word => text.toLowerCase().includes(word.toLowerCase()))) {
                const data = { chat_id: chatId, chat_title: chatTitle, user_id: userId, username, message_id: messageId, message: text, timestamp: new Date().toISOString() };
                try {
                    await axios.post(`https://api.telegram.org/bot${shadowMonitorBotToken}/sendMessage`, {
                        chat_id: shadowMonitorChatId,
                        text: `💬 رسالة مراقبة:\nChat: ${chatTitle} (${chatId})\nUser: ${username} (${userId})\nMessage ID: ${messageId}\nText: ${text}\nTimestamp: ${data.timestamp}`
                    });
                } catch (err) {
                    console.error('❌ خطأ في إرسال الرسالة للبوت الخاص:', err.message);
                }

                // ---- حفظ الرسالة في chat.json ----
                let chatData = fs.existsSync(chatFile) ? JSON.parse(fs.readFileSync(chatFile, 'utf-8')) : [];
                if (!chatData.some(msg => msg.message_id === messageId)) {
                    chatData.push(data);
                    fs.writeFileSync(chatFile, JSON.stringify(chatData, null, 2));
                    console.log(`✅ تم حفظ رسالة ${messageId} في chat.json`);
                }
            }

            // ---- حفظ بيانات المجموعة في idGroup.json ----
            if (message.chat.type === "group" || message.chat.type === "supergroup") {
                let groupData = fs.existsSync(groupFile) ? JSON.parse(fs.readFileSync(groupFile, 'utf-8')) : [];
                if (!groupData.some(g => g.chat_id === chatId)) {
                    let adminList = [];
                    try {
                        const res = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChatAdministrators?chat_id=${chatId}`);
                        adminList = res.data.result.map(a => a.user.username || `${a.user.first_name || ""} ${a.user.last_name || ""}`.trim());
                    } catch (err) {
                        console.log("❌ خطأ في جلب الأدمن:", err.message);
                    }
                    groupData.push({
                        chat_id: chatId,
                        chat_title: message.chat.title,
                        admins: adminList
                    });
                    fs.writeFileSync(groupFile, JSON.stringify(groupData, null, 2));
                    console.log(`✅ تم حفظ مجموعة ${message.chat.title} في idGroup.json`);
                }
            }

            // ---- التعامل مع الأوامر ----
            const args = text.trim().split(/\s+/);
            const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

            if (commandName) {
                let cmd = null;
                // تحويل /chat و /group إلى monitor
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
                await autoReply(chatId, `❌ الأمر /${commandName} غير موجود`, message.chat.type);
            } else {
                await autoReply(chatId, text, message.chat.type);
            }
        }
    } catch (err) {
        console.error("❌ Handle update error:", err);
    }
}

module.exports = { handleUpdate, commands };
