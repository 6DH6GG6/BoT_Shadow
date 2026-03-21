const axios = require('axios');

module.exports = {
    name: "start",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;  
        const OWNER_ID = process.env.USER;  

        // ================= 👤 المستخدم الخاص =================  
        if (message.from && message.chat.type === "private") {  
            const userId = message.from.id;  
            const username = message.from.username || "لا يوجد";  
            const firstName = message.from.first_name || "";  
            const lastName = message.from.last_name || "";  
            const fullName = `${firstName} ${lastName}`.trim() || "لا يوجد";  
            const lang = message.from.language_code || "غير معروف";  
            const isBot = message.from.is_bot ? "نعم" : "لا";  
            const isPremium = message.from.is_premium ? "نعم" : "لا";  
            const link = username !== "لا يوجد" ? `https://t.me/${username}` : "لا يوجد";

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
━━━━━━━━━━━━━━━━━━━━━━`;

            const userSticker = "CAACAgIAAyEFAATAuLwRAAOPab4nNtuVtC9AVJRzS35ppKuJgSwAAv8IAAJjK-IJbo7wICAYAkU6BA";

            try {  
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {  
                    chat_id: OWNER_ID,  
                    text: userMsg  
                });  
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, {  
                    chat_id: OWNER_ID,  
                    sticker: userSticker  
                });  
            } catch (err) {  
                console.log("❌ User Error:", err.response?.data || err.message);  
            }  
        }  

        // ================= 👥 مجموعة / قناة =================
        if (message.chat && (message.chat.type === "group" || message.chat.type === "supergroup" || message.chat.type === "channel")) {
            const chatIdGroup = message.chat.id;
            const chatTitle = message.chat.title || "لا يوجد";
            const chatUsername = message.chat.username ? `https://t.me/${message.chat.username}` : "لا يوجد";

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

            const groupMsg =
`╭━━━━━━━━༻❖༺━━━━━━━━╮
ٰ              👑 شادو 🥂 تم ادخالي في عالم جديد 😈 👑
╰━━━━━━━━༻❖༺━━━━━━━━╯
━━━━━━━━━━━━━━━━━━━━━━
ID BOT   = 〖${chatIdGroup}〗
━━━━━━━━━━━━━━━━━━━━━━
LINK     = 〖${chatUsername}〗
━━━━━━━━━━━━━━━━━━━━━━
NAME     = 〖${chatTitle}〗
━━━━━━━━━━━━━━━━━━━━━━
ADMINS 👑
━━━━━━━━━━━━━━━━━━━━━━
${adminList.join("\n") || "لا يوجد"}
━━━━━━━━━━━━━━━━━━━━━━`;

            const groupSticker = "CAACAgIAAxkBAAIBZ2m97M7hWIEj1OjE8kt7osQxmzr2AAIECQACYyviCeXWStJVeXlvOgQ";

            try {
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id: OWNER_ID,
                    text: groupMsg
                });
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, {
                    chat_id: OWNER_ID,
                    sticker: groupSticker
                });
            } catch (err) {
                console.log("❌ Group Error:", err.response?.data || err.message);
            }
        }
    }
};
