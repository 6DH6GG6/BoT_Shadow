const { commands } = require('../admin'); // سحب commands من admin.js

module.exports = {
    name: "help",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;

        // تحويل كل الأوامر الموجودة في Map إلى array
        const allCommands = Array.from(commands.values())
            .map(cmd => cmd.name || "unknown");

        let reply = "👑👑👑👑👑\n";
        allCommands.forEach((cmdName, i) => {
            reply += `- ${i+1}〖/${cmdName}〗\n`;
        });
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
