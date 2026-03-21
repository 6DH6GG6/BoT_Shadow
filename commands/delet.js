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

        const commandText = message.text;

        // قائمة أوامر الحذف
        if (commandText.startsWith("/delet")) {
            let text = "📌 قائمة أوامر الحذف:\n\n";
            text += "1️⃣ /delete → حذف رسالة تم الرد عليها\n";
            text += "2️⃣ /deleteAll → حذف جميع رسائلك المصرح بها\n";
            text += "3️⃣ /deleteFrom_<USERID> → حذف رسائل مستخدم محدد\n";
            text += "4️⃣ /deleteAllUsers → حذف جميع رسائل كل المستخدمين\n";
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text
            });
        }

        // حذف رسالة محددة
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
        if (commandText.startsWith("/deleteAll")) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائلك المصرح بها (حسب التخزين)"
            });
        }

        // حذف رسائل مستخدم محدد
        if (commandText.startsWith("/deleteFrom")) {
            const targetId = commandText.split("_")[1];
            if (!targetId) {
                return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id,
                    text: "❌ يرجى تحديد USERID: /deleteFrom_<USERID>"
                });
            }
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: `✅ سيتم حذف جميع رسائل المستخدم ${targetId} (حسب التخزين)`
            });
        }

        // حذف جميع رسائل كل المستخدمين
        if (commandText.startsWith("/deleteAllUsers")) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائل كل المستخدمين (حسب التخزين)"
            });
        }
    }
};
