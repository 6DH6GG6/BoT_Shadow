const axios = require('axios');

module.exports = {
    name: "start",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const text = `🔥 أهلاً بك في بوت Shadow OG!\n💬 ارسل أي شيء لتجربة الشات.`;
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: chatId,
            text
        });
    }
};
