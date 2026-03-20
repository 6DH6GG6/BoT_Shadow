const axios = require('axios');
const admin = require('../admin');

module.exports = {
    name: "help",
    async execute(chatId) {

        const TOKEN = process.env.TOKEN;

        // 📂 جلب جميع الأوامر
        const commandList = Array.from(admin.commands.keys());

        if (commandList.length === 0) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ لا توجد أوامر حالياً"
            });
        }

        // 🧠 تنسيق الأوامر
        let msg = "📜 قائمة الأوامر:\n\n";

        commandList.forEach(cmd => {
            msg += `/${cmd}\n`;
        });

        msg += `\n🔥 يتم التحديث تلقائياً`;

        // 📤 إرسال
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: msg
        });
    }
};
