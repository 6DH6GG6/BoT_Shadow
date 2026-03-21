const axios = require('axios');

module.exports = {
    name: "استخراج",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;

        // التحقق من الرد على ملصق
        if (!message.reply_to_message || !message.reply_to_message.sticker) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "❌ الرجاء الرد على ملصق مع الأمر /استخراج"
            });
        }

        const sticker = message.reply_to_message.sticker;
        const fileId = sticker.file_id;
        const emoji = sticker.emoji || "❓";
        const setName = sticker.set_name || "مجموعة الملصقات غير متوفرة";

        const reply = `📦 معلومات الملصق:
- توكن الملصق (file_id): \`${fileId}\`
- الإيموجي: ${emoji}
- اسم مجموعة الملصقات: ${setName}

يمكنك استخدام هذا التوكن لإرسال نفس الملصق عبر البوت.`;

        try {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: reply,
                parse_mode: "Markdown"
            });
        } catch (err) {
            console.log("❌ Send error:", err.response?.data || err.message);
        }
    }
};
