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

        const commandText = message.text;

        // عرض قائمة الحذف
        if (commandText.startsWith("/helpDelete")) {
            let text = "📌 قائمة أوامر الحذف:\n\n";
            text += "1️⃣ /احذف → حذف رسالة تم الرد عليها\n";
            text += "2️⃣ /احذف_الكل → حذف جميع رسائلك المصرح بها\n";
            text += "3️⃣ /احذف_رسائل_من_<USERID> → حذف رسائل مستخدم محدد\n";
            text += "4️⃣ /حذف_من_لجميع → حذف جميع رسائل كل المستخدمين\n";
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
                    text: "❌ الرجاء الرد على الرسالة المراد حذفها مع /احذف"
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
        if (commandText.startsWith("/deleteFroom")) {
            const targetId = commandText.split("_")[3];
            if (!targetId) {
                return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id,
                    text: "❌ يرجى تحديد USERID: /احذف_رسائل_من_<USERID>"
                });
            }
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: `✅ سيتم حذف جميع رسائل المستخدم ${targetId} (حسب التخزين)`
            });
        }

        // حذف جميع رسائل كل المستخدمين
        if (commandText.startsWith("/deleteWhinAll")) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائل كل المستخدمين (حسب التخزين)"
            });
        }
    }
};
