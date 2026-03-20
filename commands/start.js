const axios = require('axios');
require('dotenv').config();

module.exports = {
    name: "start",
    async execute(chatId) {
        const msg = "🔥 مرحبا بك في بوت شادو 🔥";

        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: msg
        });
    }
};
