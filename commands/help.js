const axios = require('axios');

module.exports = {
    name: "help",
    async execute(chatId, args, message, commandsMap) {
        const TOKEN = process.env.TOKEN;
        if (!commandsMap) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ خطأ داخلي: لم يتم تحميل الأوامر"
            });
        }

        const perPage = 5;
        let page = 1;

        // التحقق من /help, /help2, /help3...
        const helpArg = args[0] ? args[0].toLowerCase() : "";
        const match = helpArg.match(/^help(\d+)$/);
        if (match) page = parseInt(match[1]);

        // جمع كل أسماء الأوامر
        let allCommands = Array.from(commandsMap.values())
            .map(cmd => cmd.name || "unknown");

        // حذف /delet من الصفحة الأولى
        if (page !== 2) {
            allCommands = allCommands.filter(name => name.toLowerCase() !== "delet");
        }

        const totalPages = Math.ceil(allCommands.length / perPage);
        if (page > totalPages) page = totalPages;

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
