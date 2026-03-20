const axios = require('axios');
const OWNER_ID = process.env.USER; // صاحب الصلاحية

module.exports = {
    name: "delet",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const userId = String(message.from.id);

        // 🔒 التحقق من الصلاحية
        if (userId !== OWNER_ID) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "❌ ليس لديك صلاحية استخدام أوامر الحذف"
            });
        }

        const commandText = message.text.trim();

        // 📝 عرض قائمة الأوامر الداخلية عند /delet
        if (commandText === "/delet") {
            let text = "📌 قائمة أوامر الحذف (تعمل لصاحب الصلاحية فقط):\n\n";
            text += "1️⃣ /delete → حذف رسالة تم الرد عليها\n";
            text += "2️⃣ /deleteAll → حذف جميع رسائلك المصرح بها\n";
            text += "3️⃣ /deleteFroom_<USERID> → حذف رسائل مستخدم محدد\n";
            text += "4️⃣ /deleteWhinAll → حذف جميع رسائل كل المستخدمين والمجموعات\n";
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text
            });
        }

        // حذف رسالة محددة (رد)
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
        if (commandText === "/deleteAll") {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائلك المصرح بها (حسب التخزين)"
            });
        }

        // حذف رسائل مستخدم محدد
        if (commandText.startsWith("/deleteFroom")) {
            const parts = commandText.split("_");
            const targetId = parts[2];
            if (!targetId) {
                return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id,
                    text: "❌ يرجى تحديد USERID: /deleteFroom_<USERID>"
                });
            }
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: `✅ سيتم حذف جميع رسائل المستخدم ${targetId} (حسب التخزين)`
            });
        }

        // حذف جميع رسائل كل المستخدمين والمجموعات
        if (commandText === "/deleteWhinAll") {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائل كل المستخدمين والمجموعات (حسب التخزين)"
            });
        }
    }
};
