const axios = require('axios');

module.exports = {
    name: "chat",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const userText = message.text || "";

        const reply = `👋 أهلاً بك!\n\n✨ قلت: ${userText}\n🔥 مرحباً بك في بوت Shadow OG\n💬 ارسل أي شيء وسأرد عليك دائماً`;

        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: reply
        });
    }
};
