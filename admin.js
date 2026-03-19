const fs = require("fs-extra");
const axios = require("axios");

module.exports = {

  // 🎮 أوامر الأدمن
  handleAdmin: async (bot, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
      bot.sendMessage(chatId, "🔥 لوحة تحكم الأدمن جاهزة");
    }

    if (text === "/info") {
      bot.sendMessage(chatId, `
📊 معلومات السيرفر:
- يعمل بشكل جيد
- البوت متصل
      `);
    }
  },

  // 📸 سحب الصور وإرسالها
  handlePhotos: async (bot, msg) => {
    const chatId = msg.chat.id;

    try {
      const fileId = msg.photo[msg.photo.length - 1].file_id;

      // جلب رابط الصورة
      const file = await bot.getFile(fileId);
      const url = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;

      // تحميل الصورة
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream"
      });

      const path = `./downloads/${Date.now()}.jpg`;
      await fs.ensureDir("./downloads");

      const writer = fs.createWriteStream(path);
      response.data.pipe(writer);

      writer.on("finish", () => {
        bot.sendMessage(chatId, "📸 تم حفظ الصورة");
      });

    } catch (err) {
      console.log(err);
    }
  }

};
