const fs = require("fs-extra");
const axios = require("axios");

module.exports = {

  // 👑 أوامر الأدمن
  handleAdmin: async (bot, msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
      bot.sendMessage(chatId, "🔥 لوحة التحكم شغالة");
    }

    if (text === "/ping") {
      bot.sendMessage(chatId, "🏓 bot يعمل");
    }
  },

  // 📸 حفظ الصور
  handlePhotos: async (bot, msg) => {
    try {
      const chatId = msg.chat.id;
      const fileId = msg.photo[msg.photo.length - 1].file_id;

      const file = await bot.getFile(fileId);
      const url = `https://api.telegram.org/file/bot${process.env.TOKEN}/${file.file_path}`;

      const response = await axios({
        url,
        method: "GET",
        responseType: "stream"
      });

      await fs.ensureDir("./downloads");
      const path = `./downloads/${Date.now()}.jpg`;

      const writer = fs.createWriteStream(path);
      response.data.pipe(writer);

      writer.on("finish", () => {
        bot.sendMessage(chatId, "📸 تم تحميل الصورة");
      });

    } catch (err) {
      console.log(err);
    }
  }

};
