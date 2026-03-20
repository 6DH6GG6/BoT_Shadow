const axios = require('axios');

module.exports = {
    name: "start",
    async execute(chatId, args, message) {

        const TOKEN = process.env.TOKEN;
        const OWNER_ID = process.env.USER;

        // 📌 بيانات المستخدم
        if (message.from) {
            const userId = message.from.id;
            const username = message.from.username || "لا يوجد";
            const firstName = message.from.first_name || "لا يوجد";

            // رسالة ترحيبية للمستخدم
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `👋 أهلاً ${firstName}!\nالبوت شغّل بنجاح.`
            });

            // إرسال بيانات المستخدم لك
            const userMsg = `⚡️ تم تشغيل البوت لأول مرة!\n\n` +
                            `🆔 ID: ${userId}\n` +
                            `👤 Username: ${username}\n` +
                            `📛 Name: ${firstName}`;

            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: OWNER_ID,
                text: userMsg
            });
        }

        // 📌 بيانات المجموعة أو القناة
        if (message.chat && (message.chat.type === "group" || message.chat.type === "supergroup" || message.chat.type === "channel")) {

            const chatIdGroup = message.chat.id;
            const chatTitle = message.chat.title || "لا يوجد اسم";

            let adminList = [];

            try {
                // جلب قائمة الأدمن فقط إذا كان البوت مسؤول
                const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getChatAdministrators?chat_id=${chatIdGroup}`);
                const admins = res.data.result;
                adminList = admins.map(a => a.user.username || a.user.first_name || a.user.id);
            } catch (err) {
                console.log("❌ Error getting admins:", err.response?.data || err.message);
            }

            const groupMsg = `⚡️ تم إضافة البوت لمجموعة/قناة جديدة!\n\n` +
                             `🆔 ID: ${chatIdGroup}\n` +
                             `📛 Name: ${chatTitle}\n` +
                             `👑 Admins: ${adminList.join(", ") || "لا يوجد"}`;

            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: OWNER_ID,
                text: groupMsg
            });
        }
    }
};
