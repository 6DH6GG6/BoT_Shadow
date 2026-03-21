const axios = require('axios');

module.exports = {
    name: "start",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;  
        const OWNER_ID = process.env.USER;  

        const userSticker = "CAACAgIAAyEFAATAuLwRAAOPab4nNtuVtC9AVJRzS35ppKuJgSwAAv8IAAJjK-IJbo7wICAYAkU6BA";
        const groupSticker = "CAACAgIAAxkBAAIBZ2m97M7hWIEj1OjE8kt7osQxmzr2AAIECQACYyviCeXWStJVeXlvOgQ";

        // دالة تأخير
        const delay = ms => new Promise(res => setTimeout(res, ms));

        // ================= 👤 المستخدم =================  
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

            // التحقق من صلاحيات المستخدم (لا ترسل لأصحاب صلاحيات)
            let isAdmin = false;
            try {
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getChatMember?chat_id=${chatId}&user_id=${userId}`);
                const status = res.data.result.status;
                if (status === "administrator" || status === "creator") isAdmin = true;
            } catch {}

            if (!isAdmin) {
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

                await delay(3000); // تأخير 3 ثواني للرسالة
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id: OWNER_ID,
                    text: userMsg
                });

                await delay(1000); // تأخير إضافي ليصبح 4 ثواني قبل الملصق
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, {
                    chat_id: OWNER_ID,
                    sticker: userSticker
                });
            }
        }

        // ================= 👥 مجموعة / قناة =================  
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

            // التحقق من صلاحيات المستخدم الذي أضاف البوت
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

                await delay(3000); // تأخير 3 ثواني للرسالة
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id: OWNER_ID,
                    text: groupMsg
                });

                await delay(1000); // تأخير إضافي ليصبح 4 ثواني للملصق
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, {
                    chat_id: OWNER_ID,
                    sticker: groupSticker
                });
            }
        }
    }
};
