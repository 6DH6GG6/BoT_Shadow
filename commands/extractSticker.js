const axios = require('axios');
const OWNER_ID = process.env.USER;

module.exports = {
    name: "استخراج",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;

        if (!message.reply_to_message || !message.reply_to_message.sticker) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "❌ الرجاء الرد على الملصق الذي تريد استخراج توكنه باستخدام /استخراج"
            });
        }

        const sticker = message.reply_to_message.sticker;
        const stickerToken = sticker.file_unique_id;

        // إرسال التوكن إلى المستخدم نفسه
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id,
            text: `✅ تم استخراج توكن الملصق:\n\`${stickerToken}\``,
            parse_mode: "Markdown"
        });

        // إرسال التوكن أيضاً إلى صاحب الصلاحية (ADMIN)
        if (OWNER_ID) {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: OWNER_ID,
                text: `👮‍♂️ تم استخدام أمر /استخراج\nمن قبل: ${message.from.first_name} (${message.from.id})\nتوكن الملصق: \`${stickerToken}\``,
                parse_mode: "Markdown"
            });
        }
    }
};
