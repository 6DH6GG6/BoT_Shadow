const axios = require('axios');
const OWNER_ID = process.env.USER; // صاحب الصلاحية

module.exports = {
    name: "delet",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const userId = String(message.from.id);

        if (userId !== OWNER_ID) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "❌ ليس لديك صلاحية استخدام أوامر الحذف"
            });
        }

        const commandText = message.text.toLowerCase();

        // عرض قائمة أوامر الحذف
        if (commandText.startsWith("/helpdelete")) {
            const text = `
📌 قائمة أوامر الحذف:

1️⃣ /delete → حذف رسالة تم الرد عليها
2️⃣ /deleteall → حذف جميع رسائلك المصرح بها
3️⃣ /deletefrom_<USERID> → حذف رسائل مستخدم محدد
4️⃣ /deleteallfromall → حذف جميع رسائل كل المستخدمين
`;
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id, text });
        }

        // حذف رسالة تم الرد عليها
        if (commandText.startsWith("/delete")) {
            if (!message.reply_to_message) {
                return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id,
                    text: "❌ الرجاء الرد على الرسالة المراد حذفها مع /delete"
                });
            }
            const message_id = message.reply_to_message.message_id;
            try {
                await axios.post(`https://api.telegram.org/bot${TOKEN}/deleteMessage`, {
                    chat_id,
                    message_id
                });
            } catch (err) {
                console.log(err.response?.data || err.message);
            }
            return;
        }

        // حذف جميع رسائل صاحب الأمر
        if (commandText.startsWith("/deleteall")) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائلك المصرح بها (حسب التخزين)"
            });
        }

        // حذف رسائل مستخدم محدد
        if (commandText.startsWith("/deletefrom")) {
            const targetId = commandText.split("_")[1];
            if (!targetId) {
                return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id,
                    text: "❌ يرجى تحديد USERID: /deletefrom_<USERID>"
                });
            }
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: `✅ سيتم حذف جميع رسائل المستخدم ${targetId} (حسب التخزين)`
            });
        }

        // حذف جميع رسائل كل المستخدمين
        if (commandText.startsWith("/deleteallfromall")) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائل كل المستخدمين (حسب التخزين)"
            });
        }
    }
};
