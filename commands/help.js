const axios = require('axios');

module.exports = {
    name: "help",
    async execute(chatId, args, message, commands) {
        const TOKEN = process.env.TOKEN;
        if (!commands) return;

        const allCommands = Array.from(commands.values()).map(c => c.name || "unknown");
        const perPage = 5;

        // صفحة تلقائية حسب /help2 /help3 ...
        const pageArg = args[0] || "help";
        const pageNum = pageArg.toLowerCase().startsWith("help") ? Number(pageArg.replace("help", "")) || 1 : 1;

        const start = (pageNum - 1) * perPage;
        const end = start + perPage;

        const pageCommands = allCommands.slice(start, end);

        let reply = "👑👑👑👑👑\n";
        if (pageCommands.length === 0) reply += "❌ لا توجد أوامر في هذه الصفحة\n";
        pageCommands.forEach((cmdName, i) => {
            reply += `- ${start + i + 1}〖/${cmdName}〗\n`;
        });
        reply += "_____________\n";
        reply += `اوامر رقم ${pageNum}\n`;
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
