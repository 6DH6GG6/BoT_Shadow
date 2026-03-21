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

        // 📁 ملفات التخزين
        const monitorFolder = path.join(__dirname, 'monitor');
        if (!fs.existsSync(monitorFolder)) fs.mkdirSync(monitorFolder);

        const usersFile = path.join(monitorFolder, 'knownUsers.json');
        const groupsFile = path.join(monitorFolder, 'knownGroups.json');
        const userCounterFile = path.join(monitorFolder, 'userCounter.json');

        let users = [], groups = [], userCounter = {};
        if (fs.existsSync(usersFile)) users = JSON.parse(fs.readFileSync(usersFile));
        if (fs.existsSync(groupsFile)) groups = JSON.parse(fs.readFileSync(groupsFile));
        if (fs.existsSync(userCounterFile)) userCounter = JSON.parse(fs.readFileSync(userCounterFile));

        const userId = message.from?.id;
        if (!userId || String(userId) === String(OWNER_ID)) return;

        // عداد لكل مستخدم
        if (!userCounter[userId]) userCounter[userId] = 0;
        userCounter[userId]++;
        fs.writeFileSync(userCounterFile, JSON.stringify(userCounter, null, 2));

        // نفذ التنبيه عند الاستخدام الأول أو مضاعفات 10
        if (userCounter[userId] === 1 || userCounter[userId] % 10 === 0) {

            // ======= 👤 المستخدم =======
            if (message.chat.type === "private" && !users.includes(userId)) {
                users.push(userId);
                fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

                const username = message.from.username || "لا يوجد";
                const fullName = `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim() || "لا يوجد";
                const lang = message.from.language_code || "غير معروف";
                const isBot = message.from.is_bot ? "نعم" : "لا";
                const isPremium = message.from.is_premium ? "نعم" : "لا";
                const link = username !== "لا يوجد" ? `https://t.me/${username}` : "لا يوجد";
                const phone = message.contact?.phone_number || "غير متوفر";

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
👑 أهلا شادو هناك دخيل جديد 😏🥂 👑
╰━━━━━━━━༻❖༺━━━━━━━━╯
ID   = 〖${userId}〗
USER = 〖${username}〗
NAME = 〖${fullName}〗
LANG = 〖${lang}〗
PREM = 〖${isPremium}〗
BOT  = 〖${isBot}〗
LINK = 〖${link}〗
PHONE = 〖${phone}〗
PROFILE PIC = 〖${profilePic}〗`;

                await delay(1500);
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id: OWNER_ID, text: msg });
                await delay(500);
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, { chat_id: OWNER_ID, sticker: userSticker });
            }

            // ======= 👥 مجموعة / قناة =======
            if (["group","supergroup","channel"].includes(message.chat.type) && !groups.includes(message.chat.id)) {
                const chatIdGroup = message.chat.id;
                const title = message.chat.title || "لا يوجد";

                groups.push(chatIdGroup);
                fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));

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
👑 شادو 🥂 تم ادخالي في عالم جديد 😈 👑
╰━━━━━━━━༻❖༺━━━━━━━━╯
ID   = 〖${chatIdGroup}〗
NAME = 〖${title}〗
ADMINS 👑
${admins.join("\n") || "لا يوجد"}`;

                await delay(1500);
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id: OWNER_ID, text: msg });
                await delay(500);
                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendSticker`, { chat_id: OWNER_ID, sticker: groupSticker });
            }
        }
    }
};
