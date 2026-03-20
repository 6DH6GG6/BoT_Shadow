const axios = require('axios');

module.exports = {
    name: "help",
    async execute(chatId, args, message, commands) {
        const TOKEN = process.env.TOKEN;
        if (!commands) return;

        // جمع جميع الأوامر الحقيقية فقط
        const allCommands = Array.from(commands.values())
            .map(cmd => cmd.name)
            .filter(Boolean); // فقط التي لها اسم

        let reply = "👑👑👑👑👑\n";
        allCommands.forEach((cmdName, i) => {
            reply += `- ${i + 1}〖/${cmdName}〗\n`;
        });
        reply += "_____________\n";
        reply += `كل الأوامر\n`;
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
