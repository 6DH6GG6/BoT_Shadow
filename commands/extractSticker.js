const axios = require("axios");
const OWNER_ID = process.env.USER; // صاحب الصلاحية

module.exports = {
  name: "استخراج",
  async execute(chatId, args, message) {
    const TOKEN = process.env.TOKEN;
    const userId = String(message.from.id);

    // 🔒 صلاحية الوصول
    if (userId !== OWNER_ID) {
      return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "❌ ليس لديك صلاحية استخدام أمر الاستخراج",
      });
    }

    // ✅ التحقق من الرد على ملصق
    if (!message.reply_to_message || !message.reply_to_message.sticker) {
      return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "❌ الرجاء الرد على الملصق الذي تريد استخراج معلوماته",
      });
    }

    const sticker = message.reply_to_message.sticker;

    // 🪉 تجهيز المعلومات بالتنسيق المطلوب
    const reply = `👤 خاص:
👑        「مِےـعَےـك شّےـبّےـحً آلَظٌےـلَآمِ」    👑

🪉      معلومــــــــات عن الملصق      🪉

━━━━━━━━━━━━━━━━━━━━━━
${sticker.file_id}
━━━━━━━━━━━━━━━━━━━━━━
${sticker.emoji || "❌ لا يوجد"}
━━━━━━━━━━━━━━━━━━━━━━
${sticker.set_name || "❌ لا يوجد"}
━━━━━━━━━━━━━━━━━━━━━━
متحرك    ${sticker.is_animated ? "نعم" : "لا"}
━━━━━━━━━━━━━━━━━━━━━━
فيديو   ${sticker.is_video ? "نعم" : "لا"}
━━━━━━━━━━━━━━━━━━━━━━`;

    try {
      // إرسال المعلومات لصاحب البوت
      await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: OWNER_ID,
        text: reply,
      });

      // إشعار المستخدم أن الاستخراج تم
      await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "✅ تم استخراج معلومات الملصق وإرسالها للمسؤول",
      });
    } catch (err) {
      console.log("❌ Error sending sticker info:", err.response?.data || err.message);
    }
  },
};
