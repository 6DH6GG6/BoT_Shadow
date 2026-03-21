const fs = require('fs');
const path = require('path');
const axios = require('axios');

const commands = new Map();

// --- الفولدرات المراد تحميلها ---
const foldersToLoad = [
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'image'),
    path.join(__dirname, 'monitor')
];

// --- تحميل الأوامر ---
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
foldersToLoad.forEach(folder => loadCommands(folder));

// --- تحميل ملفات جذرية (root js) ---
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
            }
        } catch (err) {
            console.log(`❌ Error loading root file ${file}: ${err.message}`);
        }
    }
});

// --- الرد التلقائي ---
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

// --- monitor support ---
const shadowKeywords = ['shadow','شادو','شادوة','شادوه','شادوا','تشادو','تشادوة','تشادوه','تشادوا'];
const chatJsonPath = path.join(__dirname, 'monitor', 'chat.json');
const groupJsonPath = path.join(__dirname, 'monitor', 'idGroup.json');

function saveJSON(filePath, data) {
    let arr = [];
    if (fs.existsSync(filePath)) {
        try { arr = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch {}
    }
    arr.push(data);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
}

const sentStartUsers = new Set(); // لتتبع من استعمل /start

// --- التعامل مع التحديثات (update) ---
async function handleUpdate(update) {
    try {
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text || "";
            const args = text.trim().split(/\s+/);
            const commandName = text.startsWith("/") ? args[0].slice(1).toLowerCase() : null;

            // --- monitor chat ---
            if (shadowKeywords.some(word => text.toLowerCase().includes(word.toLowerCase()))) {
                const userData = {
                    user_id: message.from.id,
                    username: message.from.username || 'Unknown',
                    message: text
                };
                saveJSON(chatJsonPath, userData);
            }

            // --- تنفيذ /start عبر join.js ---
            if ((message.chat.type === "private" || message.chat.type === "group" || message.chat.type === "supergroup") && !message.from.is_bot) {
                const joinCmd = commands.get('start');

                if (joinCmd && joinCmd.execute) {
                    if (commandName === 'start' && !sentStartUsers.has(message.from.id)) {
                        sentStartUsers.add(message.from.id); // منع التكرار داخل الجلسة
                    }
                    if (commandName === 'start') await joinCmd.execute(chatId, args, message, commands);
                }
            }

            // --- التعامل مع باقي الأوامر ---
            if (commandName && commands.has(commandName)) {
                const cmd = commands.get(commandName);
                if (cmd.execute) await cmd.execute(chatId, args, message, commands);
                else await autoReply(chatId, `✅ الأمر موجود: /${commandName}`, message.chat.type);
            } else if (commandName) {
                // تجاهل /chat و /group من monitor
                if (!['chat','group'].includes(commandName)) {
                    await autoReply(chatId, `❌ الأمر /${commandName} غير موجود`, message.chat.type);
                }
            } else {
                await autoReply(chatId, text, message.chat.type);
            }

        } else if (update.my_chat_member || update.new_chat_members) {
            // --- مراقبة مجموعات ---
            const message = update.message || update.my_chat_member || {};
            if (message.chat && (message.chat.type === "group" || message.chat.type === "supergroup")) {
                const chatId = message.chat.id;
                const chatTitle = message.chat.title || 'Unknown';
                let admins = [];
                try {
                    const res = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChatAdministrators?chat_id=${chatId}`);
                    admins = res.data.result.map(a => a.user.username || a.user.first_name || a.user.id);
                } catch {}

                saveJSON(groupJsonPath, {
                    group_id: chatId,
                    title: chatTitle,
                    admins
                });
            }
        }

    } catch (err) {
        console.error("❌ Handle update error:", err);
    }
}

module.exports = { handleUpdate, commands };
