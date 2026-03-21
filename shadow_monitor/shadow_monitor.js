const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); // لإرسال البيانات إلى بوتك
const bot = new TelegramBot('YOUR_MONITOR_BOT_TOKEN', { polling: true });

// البوت الذي سيستقبل الرسائل (بوتك الخاص)
const myBotToken = 'YOUR_TARGET_BOT_TOKEN'; 
const myBotChatId = 'YOUR_TARGET_CHAT_ID'; // المكان الذي تريد أن تصل إليه الرسائل

const keywords = ['shadow','شادو','تشادو','شادوه','شادوة','تشادوه','تشادوة'];

// دالة إرسال الرسائل للبوت الخاص بك
async function forwardToMyBot(data) {
  try {
    await axios.post(`https://api.telegram.org/bot${myBotToken}/sendMessage`, {
      chat_id: myBotChatId,
      text: `💬 رسالة مراقبة:
Chat: ${data.chat_title} (${data.chat_id})
User: ${data.username} (${data.user_id})
Message ID: ${data.message_id}
Text: ${data.message}
Timestamp: ${data.timestamp}`
    });
    console.log(`✅ تم إرسال رسالة ${data.message_id} للبوت الخاص`);
  } catch (error) {
    console.error('❌ خطأ في إرسال الرسالة:', error.message);
  }
}

// معالجة رسالة جديدة
bot.on('message', (msg) => {
  const text = msg.text || '';
  if (!text) return;

  if (keywords.some(word => text.toLowerCase().includes(word.toLowerCase()))) {
    const data = {
      chat_id: msg.chat.id,
      chat_title: msg.chat.title || msg.chat.username || 'Private Chat',
      user_id: msg.from.id,
      username: msg.from.username || 'Unknown',
      message_id: msg.message_id,
      message: text,
      timestamp: new Date().toISOString()
    };

    forwardToMyBot(data);
  }
});
