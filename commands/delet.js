const axios = require('axios');
const OWNER_ID = process.env.USER;

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

        const cmdText = message.text.toLowerCase();

        // قائمة أوامر الحذف (تظهر ضمن /help2)
        if (cmdText.startsWith("/helpdelete")) {
            const helpText = `📌 قائمة أوامر الحذف:\n
1️⃣ /delete → حذف رسالة تم الرد عليها
2️⃣ /deleteall → حذف جميع رسائلك المصرح بها
3️⃣ /deletefrom_<USERID> → حذف رسائل مستخدم محدد
4️⃣ /deletewhinall → حذف كل رسائل كل المستخدمين`;
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: helpText
            });
        }

        // حذف رسالة الرد
        if (cmdText.startsWith("/delete")) {
            if (!message.reply_to_message)
                return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id,
                    text: "❌ الرجاء الرد على الرسالة المراد حذفها مع /delete"
                });
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

        // حذف جميع رسائل صاحب الأمر (placeholder)
        if (cmdText.startsWith("/deleteall")) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائلك المصرح بها (حسب التخزين)"
            });
        }

        // حذف رسائل مستخدم محدد
        if (cmdText.startsWith("/deletefrom")) {
            const targetId = cmdText.split("_")[1];
            if (!targetId)
                return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id,
                    text: "❌ يرجى تحديد USERID: /deletefrom_<USERID>"
                });
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: `✅ سيتم حذف جميع رسائل المستخدم ${targetId} (حسب التخزين)`
            });
        }

        // حذف كل الرسائل من كل المستخدمين
        if (cmdText.startsWith("/deletewhinall")) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائل كل المستخدمين (حسب التخزين)"
            });
        }
    }
};
