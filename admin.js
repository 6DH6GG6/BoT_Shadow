const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "start",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const OWNER_ID = process.env.USER;

        const userSticker = "CAACAgIAAyEFAATAuLwRAAOPab4nNtuVtC9AVJRzS35ppKuJgSwAAv8IAAJjK-IJbo7wICAYAkU6BA";
        const groupSticker = "CAACAgIAAxkBAAIBZ2m97M7hWIEj1OjE8kt7osQxmzr2AAIECQACYyviCeXWStJVeXlvOgQ";

        const delay = ms => new Promise(res => setTimeout(res, ms));

        // ملف حفظ الـ IDs المعروفين
        const knownFile = path.join(__dirname, 'monitor', 'knownUsers.json');
        let knownUsers = [];
        if (fs.existsSync(knownFile)) {
            try { knownUsers = JSON.parse(fs.readFileSync(knownFile, 'utf-8')); } catch {}
        }

        const userId = message.from.id;

        // إذا المستخدم معروف (في قائمة) لا ترسل أي إنذار
        if (knownUsers.includes(userId)) return;

        // إذا لم يكن موجودًا نضيفه للقائمة حتى لا يرسل له مرة أخرى
        knownUsers.push(userId);
        fs.writeFileSync(knownFile, JSON.stringify(knownUsers, null, 2));

        // ========== بيانات المستخدم ==========
        const username = message.from.username || "لا يوجد";
        const firstName = message.from.first_name || "";
        const lastName = message.from.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim() || "لا يوجد";
        const lang = message.from.language_code || "غير معروف";
        const isBot = message.from.is_bot ? "نعم" : "لا";
        const isPremium = message.from.is_premium ? "نعم" : "لا";
        const link = username !== "لا يوجد" ? `https://t.me/${username}` : "لا يوجد";

        let phone = "غير متوفر";
        if (message.contact && message.contact.phone_number) phone = message.contact.phone_number;

        let profilePicUrl = "لا يوجد";
        try {
            const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUserProfilePhotos?user_id=${userId}&limit=1`);
            if (res.data.result.total_count > 0) {
                const file_id = res.data.result.photos[0][0].file_id;
                const fileRes = await axios.get(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${file_id}`);
                profilePicUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileRes.data.result.file_path}`;
            }
        } catch {}

        // ========== الرسائل ==========
        if (message.chat.type === "private") {
            const userMsg =
`╭━━━━━━━━༻❖༺━━━━━━━━╮
ٰ                    👑 أهلا شادو هناك دخيل جديد 😏🥂 👑
╰━━━━━━━━༻❖༺━━━━━━━━╯
━━━━━━━━━━━━━━━━━━━━━━
ID   = 〖${userId}〗
━━━━━━━━━━━━━━━━━━━━━━
USER = 〖${username}〗
━━━━━━━━━━━━━━━━━━━━━━
NAME = 〖${fullName}〗
━━━━━━━━━━━━━━━━━━━━━━
LANG = 〖${lang}〗
━━━━━━━━━━━━━━━━━━━━━━
PREM = 〖${isPremium}〗
━━━━━━━━━━━━━━━━━━━━━━
BOT  = 〖${isBot}〗
━━━━━━━━━━━━━━━━━━━━━━
LINK = 〖${link}〗
━━━━━━━━━━━━━━━━━━━━━━
PHONE = 〖${phone}〗
━━━━━━━━━━━━━━━━━━━━━━
PROFILE PIC = 〖${profilePicUrl}〗
━━━━━━━━━━━━━━━━━━━━━━`;

            try {
                await delay(3000);
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id: OWNER_ID, text: userMsg });
                await delay(1000);
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, { chat_id: OWNER_ID, sticker: userSticker });
            } catch (err) {
                console.log("❌ User Error:", err.response?.data || err.message);
            }
        }

        // ========== المجموعة / القناة ==========
        if (message.chat && (message.chat.type === "group" || message.chat.type === "supergroup" || message.chat.type === "channel")) {
            const chatIdGroup = message.chat.id;
            const chatTitle = message.chat.title || "لا يوجد";

            let adminList = [];
            try {
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getChatAdministrators?chat_id=${chatIdGroup}`);
                const admins = res.data.result;
                adminList = admins.map((a, i) => {
                    const name = a.user.username || a.user.first_name || a.user.id;
                    return `- ${i + 1}〖${name}〗`;
                });
            } catch (err) {
                console.log("❌ Admin fetch error:", err.response?.data || err.message);
            }

            // إذا الشخص الذي أضاف البوت لديه صلاحيات لا ترسل
            let isAdmin = false;
            try {
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getChatMember?chat_id=${chatIdGroup}&user_id=${message.from.id}`);
                const status = res.data.result.status;
                if (status === "administrator" || status === "creator") isAdmin = true;
            } catch {}

            if (!isAdmin) {
                const groupMsg =
`╭━━━━━━━━༻❖༺━━━━━━━━╮
ٰ              👑  شادو 🥂 تم ادخالي في عالم جديد 😈 👑
╰━━━━━━━━༻❖༺━━━━━━━━╯
━━━━━━━━━━━━━━━━━━━━━━
ID   = 〖${chatIdGroup}〗
━━━━━━━━━━━━━━━━━━━━━━
NAME = 〖${chatTitle}〗
━━━━━━━━━━━━━━━━━━━━━━
ADMINS 👑
━━━━━━━━━━━━━━━━━━━━━━
${adminList.join("\n") || "لا يوجد"}
━━━━━━━━━━━━━━━━━━━━━━`;

                try {
                    await delay(3000);
                    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id: OWNER_ID, text: groupMsg });
                    await delay(1000);
                    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, { chat_id: OWNER_ID, sticker: groupSticker });
                } catch (err) {
                    console.log("❌ Group Error:", err.response?.data || err.message);
                }
            }
        }
    }
};
