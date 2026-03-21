const fs = require('fs');
const path = require('path');
const axios = require('axios');

// كلمات المراقبة
const keywords = ['shadow','شادو','شادوه','تشادو','تشادوه'];

// ملفات التخزين
const chatFile = path.join(__dirname, 'monitor', 'chat.json');
const groupFile = path.join(__dirname, 'monitor', 'groups.json');

// حفظ البيانات
function saveJSON(filePath, data) {
    let arr = [];

    if (fs.existsSync(filePath)) {
        try {
            arr = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch {}
    }

    arr.push(data);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
}

// الرد التلقائي (اختياري مثل admin.js)
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

// ================= HANDLER =================
async function handleUpdate(update) {
    try {

        // ========= مراقبة الرسائل =========
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text || "";

            // 📌 التقاط كلمات معينة
            if (keywords.some(word => text.toLowerCase().includes(word))) {
                saveJSON(chatFile, {
                    user_id: message.from?.id,
                    username: message.from?.username || "Unknown",
                    text: text,
                    chat_id: chatId,
                    type: message.chat.type,
                    date: new Date().toISOString()
                });
            }
        }

        // ========= مراقبة دخول القروبات / القنوات =========
        if (update.my_chat_member) {
            const data = update.my_chat_member;

            if (
                data.new_chat_member.status === "member" ||
                data.new_chat_member.status === "administrator"
            ) {
                saveJSON(groupFile, {
                    group_id: data.chat.id,
                    title: data.chat.title || "Unknown",
                    type: data.chat.type,
                    added_by: data.from?.username || "Unknown",
                    user_id: data.from?.id,
                    date: new Date().toISOString()
                });
            }
        }

    } catch (err) {
        console.error("❌ Monitor error:", err);
    }
}

module.exports = { handleUpdate };
