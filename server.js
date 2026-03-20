require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const admin = require("./admin");

const app = express();
app.use(express.json());

// 🔐 متغيرات Render
const TOKEN = process.env.TOKEN;
const ADMIN_ID = process.env.ID;
const CODE = process.env.COD;
const URL = process.env.URL;

// إنشاء البوت بدون polling
const bot = new TelegramBot(TOKEN);

// 🔗 تفعيل Webhook
bot.setWebHook(`${URL}/bot${TOKEN}`);

// 📩 استقبال تحديثات تليغرام
app.post(`/bot${TOKEN}`, async (req, res) => {
  const update = req.body;

  try {
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;

      // 🔑 كود الدخول
      if (msg.text === CODE) {
        await bot.sendMessage(chatId, "✅ تم التحقق بنجاح");
      }

      // 👑 أوامر الأدمن
      if (chatId.toString() === ADMIN_ID) {
        await admin.handleAdmin(bot, msg);
      }

      // 📸 صور
      if (msg.photo) {
        await admin.handlePhotos(bot, msg);
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// 🌐 صفحة رئيسية
app.get("/", (req, res) => {
  res.send("🔥 Webhook Bot شغال");
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server started");
});
