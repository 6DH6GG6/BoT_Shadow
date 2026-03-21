const axios = require('axios');

module.exports = {
    name: "help",
    async execute(chatId, args, message, commands) {
        const TOKEN = process.env.TOKEN;
        if (!commands) return;

        // جمع أسماء الأوامر مع إخفاء /chat
        const allCommands = Array.from(commands.values())
            .map(cmd => cmd.name)
            .filter(Boolean)
            .filter(name => name.toLowerCase() !== 'chat'); // هذا يخفي /chat

        // التأكد من ظهور /monitor دائمًا
        if (!allCommands.includes("monitor")) {
            allCommands.push("monitor");
        }

        allCommands.sort(); // ترتيب أبجدي (اختياري)

        let reply = "༻l مطــوࢪ البـوت l༺\n";
        reply += "👑  𝑺𝑯𝑨𝑫𝑶𝑾 𝑶𝑮  👑\n\n";
        reply += "<<<<<<<<<<<\n";
        reply += "𓊈𓆪 كل الأوامر 𓆪𓊉\n";
        reply += "<<<<<<<<<<<\n\n";

        reply += "♦♦♦♦♦♦♦\n";
        allCommands.forEach((cmdName, i) => {
            reply += `- ${i + 1}〖/${cmdName}〗\n`;
        });
        reply += "♦♦♦♦♦♦";

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
