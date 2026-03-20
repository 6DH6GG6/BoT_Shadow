const axios = require('axios');

module.exports = {
    name: "help",
    async execute(chatId, args, message, commands) {
        const TOKEN = process.env.TOKEN;

        if (!commands) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ خطأ داخلي: لم يتم تحميل الأوامر"
            });
        }

        const allCommands = Array.from(commands.values())
            .map(cmd => cmd.name || "unknown");

        // تقسيم الأوامر 5 لكل صفحة
        const page = args[1] ? parseInt(args[1]) : 1;
        const perPage = 5;
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const pageCommands = allCommands.slice(start, end);

        let reply = "👑👑👑👑👑\n";
        pageCommands.forEach((cmdName, i) => {
            reply += `- ${start + i + 1}〖/${cmdName}〗\n`;
        });
        reply += "_____________\n";
        reply += `اوامر رقم ${page}\n`;
        reply += "_____________\n";
        reply += "𝑺𝑯𝑨𝑫𝑶𝑾 𝑶𝑮\n";
        reply += "👑👑👑👑👑";

        try {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: reply
            });
        } catch (err) {
            console.log("❌ Send error:", err.response?.data || err.message);
        }
    }
};
