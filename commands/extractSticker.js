const axios = require('axios');

module.exports = {
    name: "استخراج",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;

        if (!message.reply_to_message || !message.reply_to_message.sticker) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "❌ الرجاء الرد على ملصق لاستخراج معلوماته"
            });
        }

        const sticker = message.reply_to_message.sticker;

        // تجهيز المعلومات
        const fileId = sticker.file_id || "غير متوفر";
        const emoji = sticker.emoji || "لا يوجد";
        const setName = sticker.set_name || "لا يوجد";
        const isAnimated = sticker.is_animated ? "نعم" : "لا";
        const isVideo = sticker.is_video ? "نعم" : "لا";

        // تنسيق الرسالة
        const reply = `👤 خاص:
👑        「مِےـعَےـك شّےـبّےـحً آلَظٌےـلَآمِ」    👑

🪉      معلومــــــــات عن الملصق      🪉

━━━━━━━━━━━━━━━━━━━━━━
${fileId}
━━━━━━━━━━━━━━━━━━━━━━
${emoji}
━━━━━━━━━━━━━━━━━━━━━━
${setName}
━━━━━━━━━━━━━━━━━━━━━━
متحرك    ${isAnimated}
━━━━━━━━━━━━━━━━━━━━━━
فيديو   ${isVideo}
━━━━━━━━━━━━━━━━━━━━━━`;

        // ارسال الرسالة
        try {
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: reply
            });
        } catch (err) {
            console.log("❌ Send error:", err.response?.data || err.message);
        }
    }
};
