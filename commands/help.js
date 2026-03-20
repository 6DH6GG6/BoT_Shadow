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

        // تحديد الصفحة (help = 1، help2 = 2)
        const page = args[0] === "help2" ? 2 : 1;
        const perPage = 5;

        // جمع جميع الأوامر
        let allCommands = Array.from(commands.values())
            .map(cmd => cmd.name || "unknown");

        // تصفية الأوامر الإدارية من الصفحة الأولى
        if (page === 1) {
            allCommands = allCommands.filter(name => name.toLowerCase() !== "delet");
        }

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
