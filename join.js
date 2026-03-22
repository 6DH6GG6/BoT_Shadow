const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "start",
    async execute(chatId, args, message) {

        const TOKEN = process.env.TOKEN;
        const OWNER_ID = process.env.USER;

        if (!message.from) return;

        const userId = message.from.id;

        // لا ترسل لنفسك
        if (String(userId) === String(OWNER_ID)) return;

        // ملفات التخزين
        const usersFile = path.join(__dirname, 'monitor', 'knownUsers.json');
        const groupsFile = path.join(__dirname, 'monitor', 'knownGroups.json');

        let users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : [];
        let groups = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile)) : [];

        // ================= 👤 خاص =================
        if (message.chat.type === "private") {

            if (!users.includes(userId)) {
                users.push(userId);
                fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
            }

            const username = message.from.username || "لا يوجد";
            const name = `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim() || "لا يوجد";
            const lang = message.from.language_code || "غير معروف";
            const isBot = message.from.is_bot ? "نعم" : "لا";
            const isPremium = message.from.is_premium ? "نعم" : "لا";
            const link = username !== "لا يوجد" ? `https://t.me/${username}` : "لا يوجد";
            const phone = "غير متوفر";

            let profilePic = "لا يوجد";

            try {
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUserProfilePhotos?user_id=${userId}&limit=1`);
                if (res.data.result.total_count > 0) {
                    const file_id = res.data.result.photos[0][0].file_id;
                    const file = await axios.get(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${file_id}`);
                    profilePic = `https://api.telegram.org/file/bot${TOKEN}/${file.data.result.file_path}`;
                }
            } catch {}

            const msg = `
╭━━━━━━━━༻❖༺━━━━━━━━╮
ٰ 👑 أهلا شادو هناك دخيل جديد 😏🥂 👑
╰━━━━━━━━༻❖༺━━━━━━━━╯
━━━━━━━━━━━━━━━━━━━━━━
ID   = 〖${userId}〗
━━━━━━━━━━━━━━━━━━━━━━
USER = 〖${username}〗
━━━━━━━━━━━━━━━━━━━━━━
NAME = 〖${name}〗
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

            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: OWNER_ID,
                text: msg
            });
        }

        // ================= 👥 مجموعة / قناة =================
        if (["group","supergroup","channel"].includes(message.chat.type)) {

            const groupId = message.chat.id;

            if (!groups.includes(groupId)) {
                groups.push(groupId);
                fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));
            }

            const title = message.chat.title || "لا يوجد";

            let admins = [];
            try {
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getChatAdministrators?chat_id=${groupId}`);
                admins = res.data.result.map(a => a.user.username || a.user.first_name || a.user.id);
            } catch {}

            const msg = `
╭━━━━━━━━༻❖༺━━━━━━━━╮
ٰ 👑 تم إدخالي لعالم جديد 😈 👑
╰━━━━━━━━༻❖༺━━━━━━━━╯
━━━━━━━━━━━━━━━━━━━━━━
IDUSERS  = 〖${userId}〗
━━━━━━━━━━━━━━━━━━━━━━
IDGROUP  = 〖${groupId}〗
━━━━━━━━━━━━━━━━━━━━━━
NAMEUSER = 〖${message.from.username || "لا يوجد"}〗
━━━━━━━━━━━━━━━━━━━━━━
NAMEGROUP= 〖${title}〗
━━━━━━━━━━━━━━━━━━━━━━
ADMINS
━━━━━━━━━━━━━━━━━━━━━━
${admins.join("\n") || "لا يوجد"}
━━━━━━━━━━━━━━━━━━━━━━`;

            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: OWNER_ID,
                text: msg
            });
        }
    }
};
