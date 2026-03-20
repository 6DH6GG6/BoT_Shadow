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

        // تحليل الصفحة: /help, /help2, /help3 ...
        let page = 1;
        const match = message.text.match(/^\/help(\d*)$/);
        if (match && match[1]) {
            page = parseInt(match[1]);
        }

        const perPage = 5;

        // جمع جميع الأوامر
        const allCommands = Array.from(commands.values())
            .map(cmd => cmd.name || "unknown");

        // تصفية أوامر delet من الصفحة الأولى
        const filteredCommands = page === 1
            ? allCommands.filter(name => name.toLowerCase() !== "delet")
            : allCommands;

        const start = (page - 1) * perPage;
        const end = start + perPage;
        const pageCommands = filteredCommands.slice(start, end);

        if (pageCommands.length === 0) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "❌ لا توجد أوامر في هذه الصفحة"
            });
        }

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
