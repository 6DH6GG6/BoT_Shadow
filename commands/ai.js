const axios = require('axios');

module.exports = {
    name: "ai",
    async execute(chatId, args) {
        const userText = args.join(" ");

        try {
            // مثال بسيط (تقدر تربطه بأي API ذكاء اصطناعي)
            const response = await axios.get(`https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(userText)}&botname=Shadow&ownername=Admin`);

            await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: response.data.message
            });

        } catch (err) {
            await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ خطأ في الذكاء الاصطناعي"
            });
        }
    }
};
