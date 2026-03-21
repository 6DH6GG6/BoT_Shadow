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

        // 📁 ملف التخزين
        const filePath = path.join(__dirname, 'known.json');
        let known = [];

        if (fs.existsSync(filePath)) {
            try {
                known = JSON.parse(fs.readFileSync(filePath));
            } catch {}
        }

        const userId = message.from?.id;

        // ❌ لا ترسل لنفسك
        if (String(userId) === String(OWNER_ID)) return;

        // ❌ إذا معروف لا ترسل
        if (known.includes(userId)) return;

        // ✅ أضفه الآن
        known.push(userId);
        fs.writeFileSync(filePath, JSON.stringify(known, null, 2));

        // ================= USER =================
        if (message.chat.type === "private") {

            const username = message.from.username || "لا يوجد";
            const fullName = `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim() || "لا يوجد";
            const lang = message.from.language_code || "غير معروف";
            const isBot = message.from.is_bot ? "نعم" : "لا";
            const isPremium = message.from.is_premium ? "نعم" : "لا";
            const link = username !== "لا يوجد" ? `https://t.me/${username}` : "لا يوجد";

            let phone = message.contact?.phone_number || "غير متوفر";

            let profilePic = "لا يوجد";
            try {
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUserProfilePhotos?user_id=${userId}&limit=1`);
                if (res.data.result.total_count > 0) {
                    const file_id = res.data.result.photos[0][0].file_id;
                    const file = await axios.get(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${file_id}`);
                    profilePic = `https://api.telegram.org/file/bot${TOKEN}/${file.data.result.file_path}`;
                }
            } catch {}

            const msg =
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
PROFILE PIC = 〖${profilePic}〗
━━━━━━━━━━━━━━━━━━━━━━`;

            await delay(3000);
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: OWNER_ID,
                text: msg
            });

            await delay(1000);
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, {
                chat_id: OWNER_ID,
                sticker: userSticker
            });
        }

        // ================= GROUP =================
        if (["group","supergroup","channel"].includes(message.chat.type)) {

            const chatIdGroup = message.chat.id;
            const title = message.chat.title || "لا يوجد";

            let admins = [];
            try {
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getChatAdministrators?chat_id=${chatIdGroup}`);
                admins = res.data.result.map((a,i)=>{
                    const name = a.user.username || a.user.first_name || a.user.id;
                    return `- ${i+1}〖${name}〗`;
                });
            } catch {}

            const msg =
`╭━━━━━━━━༻❖༺━━━━━━━━╮
ٰ              👑  شادو 🥂 تم ادخالي في عالم جديد 😈 👑
╰━━━━━━━━༻❖༺━━━━━━━━╯
━━━━━━━━━━━━━━━━━━━━━━
ID   = 〖${chatIdGroup}〗
━━━━━━━━━━━━━━━━━━━━━━
NAME = 〖${title}〗
━━━━━━━━━━━━━━━━━━━━━━
ADMINS 👑
━━━━━━━━━━━━━━━━━━━━━━
${admins.join("\n") || "لا يوجد"}
━━━━━━━━━━━━━━━━━━━━━━`;

            await delay(3000);
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: OWNER_ID,
                text: msg
            });

            await delay(1000);
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, {
                chat_id: OWNER_ID,
                sticker: groupSticker
            });
        }
    }
};
