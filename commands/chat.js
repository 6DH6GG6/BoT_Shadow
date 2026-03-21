const axios = require('axios');

module.exports = {
    name: "chat",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const userText = message.text || "";

        // قائمة الردود الخاصة باسم "شادو" بالترتيب
        const shadowReplies = [
            "مرحبا",
            "كيف حالك صديقي",
            "مضة زمن طويل هاهاه",
            "كم كنت مضحكًا يا فتى 😂"
        ];

        try {
            // إذا كانت الرسالة تحتوي على "شادو" بأي حالة
            if (userText.toLowerCase().includes("شادو")) {
                for (const reply of shadowReplies) {
                    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                        chat_id: chatId,
                        text: reply
                    });
                }
            } else {
                // الرد الافتراضي
                const reply = `👋 أهلاً بك!\n\n✨ قلت: ${userText}\n🔥 مرحباً بك في بوت Shadow OG\n💬 ارسل أي شيء وسأرد عليك دائماً`;

                await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: reply
                });
            }
        } catch (err) {
            console.log("❌ Chat Error:", err.response?.data || err.message);
        }
    }
};
