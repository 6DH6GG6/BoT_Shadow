const axios = require('axios');
const admin = require('../admin'); // المسار إلى admin.js

module.exports = {
    name: "help",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;

        // 🔹 أخذ جميع الأوامر التي تحتوي execute + name
        const cmds = Array.from(admin.commands.values())
            .filter(c => c.name && c.execute)
            .map(c => `/${c.name}`);

        if (!cmds.length) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ لا يوجد أوامر متاحة حالياً"
            });
        }

        // تقسيم الأوامر كل 5 أوامر في رسالة واحدة
        const chunkSize = 5;
        let counter = 1;

        for (let i = 0; i < cmds.length; i += chunkSize) {
            const chunk = cmds.slice(i, i + chunkSize);

            let msg = "👑👑👑👑👑\n";
            chunk.forEach((c, idx) => {
                msg += `- ${counter}〖${c}〗\n`;
                counter++;
            });

            msg += "_____________\n";
            msg += `اوامر رقم ${Math.floor(i / chunkSize) + 1}\n`;
            msg += "_____________\n";
            msg += "𝑺𝑯𝑨𝑫𝑶𝑾 𝑶𝑮\n";
            msg += "👑👑👑👑👑";

            // إرسال الرسالة
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: msg
            });
        }
    }
};
