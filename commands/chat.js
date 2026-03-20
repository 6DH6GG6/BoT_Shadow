const axios = require('axios');

module.exports = {
    name: "chat",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;

        const userText = message.text || "";

        const reply = `👋 أهلاً بك!

✨ قلت: ${userText}

🔥 مرحباً بك في بوت Shadow
💬 اكتب أي شيء وسأكون معك دائماً`;

        try {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: reply
            });
        } catch (err) {
            console.error("Send Error:", err.message);
        }
    }
};
