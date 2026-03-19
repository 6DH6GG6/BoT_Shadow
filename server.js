require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const admin = require("./admin");

const app = express();

// 🔐 جلب البيانات من Render
const TOKEN = process.env.TOKEN;
const ADMIN_ID = process.env.ID;
const CODE = process.env.COD;

// تشغيل البوت
const bot = new TelegramBot(TOKEN, { polling: true });

// تشغيل السيرفر (مهم لـ Render)
app.get("/", (req, res) => {
  res.send("Bot is running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

// 📩 استقبال الرسائل
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // 🔑 تحقق من الكود
  if (msg.text === CODE) {
    bot.sendMessage(chatId, "✅ تم التحقق، مرحبا بك");
  }

  // 🛠️ إرسال للأدمن
  if (chatId.toString() === ADMIN_ID) {
    admin.handleAdmin(bot, msg);
  }
});

// 📸 مثال: استقبال صور
bot.on("photo", async (msg) => {
  await admin.handlePhotos(bot, msg);
});

module.exports = bot;
