const axios = require('axios');

module.exports = {
    name: "start",
    async execute(chatId, args, message) {

        const TOKEN = process.env.TOKEN;
        const OWNER_ID = process.env.USER;

        const sticker = "CAACAgIAAxkBAAIBZ2m97M7hWIEj1OjE8kt7osQxmzr2AAIECQACYyviCeXWStJVeXlvOgQ";

        // 📌 بيانات المستخدم
        if (message.from) {
            const userId = message.from.id;
            const username = message.from.username || "لا يوجد";
            const firstName = message.from.first_name || "لا يوجد";
            const lastName = message.from.last_name || "";
            const fullName = `${firstName} ${lastName}`.trim() || "لا يوجد";

            const userMsg = `
╭━━━━━━━━༻❖༺━━━━━━━━╮
ٰ       👑 أهلا شادو هناك دخيل جديد 😏🥂 👑 ٰ
╰━━━━━━━━༻❖༺━━━━━━━━╯

━━━━━━━━━━━━━━━━━━━━━━
ID   = 〖${userId}〗 
━━━━━━━━━━━━━━━━━━━━━━
USER = 〖${username}〗
━━━━━━━━━━━━━━━━━━━━━━
NAME = 〖${fullName}〗
━━━━━━━━━━━━━━━━━━━━━━
`;

            try {
                // 📩 أولاً الرسالة
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id: OWNER_ID,
                    text: userMsg
                });

                // 🪄 ثم الملصق مباشرة بعدها
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, {
                    chat_id: OWNER_ID,
                    sticker: sticker
                });

            } catch (err) {
                console.log("❌ Error user:", err.response?.data || err.message);
            }
        }

        // 📌 بيانات المجموعة أو القناة
        if (message.chat && (message.chat.type === "group" || message.chat.type === "supergroup" || message.chat.type === "channel")) {

            const chatIdGroup = message.chat.id;
            const chatTitle = message.chat.title || "لا يوجد اسم";

            let adminList = [];

            try {
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getChatAdministrators?chat_id=${chatIdGroup}`);
                const admins = res.data.result;
                adminList = admins.map(a => a.user.username || a.user.first_name || a.user.id);
            } catch (err) {
                console.log("❌ Error getting admins:", err.response?.data || err.message);
            }

            const groupMsg = `
╭━━━━━━━━༻❖༺━━━━━━━━╮
ٰ       👑 تم إضافة البوت لمجموعة/قناة جديدة 👑 ٰ
╰━━━━━━━━༻❖༺━━━━━━━━╯

━━━━━━━━━━━━━━━━━━━━━━
ID   = 〖${chatIdGroup}〗
━━━━━━━━━━━━━━━━━━━━━━
NAME = 〖${chatTitle}〗
━━━━━━━━━━━━━━━━━━━━━━
ADMINS = 〖${adminList.join(", ") || "لا يوجد"}〗
━━━━━━━━━━━━━━━━━━━━━━
`;

            try {
                // 📩 أولاً الرسالة
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id: OWNER_ID,
                    text: groupMsg
                });

                // 🪄 ثم الملصق
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, {
                    chat_id: OWNER_ID,
                    sticker: sticker
                });

            } catch (err) {
                console.log("❌ Error group:", err.response?.data || err.message);
            }
        }
    }
};
