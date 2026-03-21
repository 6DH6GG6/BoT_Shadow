const axios = require("axios");
const OWNER_ID = process.env.USER; // صاحب الصلاحية

module.exports = {
  name: "استخراج",
  async execute(chatId, args, message) {
    const TOKEN = process.env.TOKEN;
    const userId = String(message.from.id);

    // صلاحية الوصول
    if (userId !== OWNER_ID) {
      return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "❌ ليس لديك صلاحية استخدام أمر الاستخراج",
      });
    }

    // التحقق من الرد على ملصق
    if (!message.reply_to_message || !message.reply_to_message.sticker) {
      return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: "❌ الرجاء الرد على الملصق الذي تريد استخراج معلوماته",
      });
    }

    const sticker = message.reply_to_message.sticker;

    const info = `
📌 معلومات الملصق:
- file_id: ${sticker.file_id}
- file_unique_id: ${sticker.file_unique_id}
- emoji: ${sticker.emoji || "❌ لا يوجد"}
- set_name: ${sticker.set_name || "❌ لا يوجد"}
- is_animated: ${sticker.is_animated ? "نعم" : "لا"}
- is_video: ${sticker.is_video ? "نعم" : "لا"}
`;

    try {
      // إرسال المعلومات لصاحب البوت
      await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: OWNER_ID,
        text: info,
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
