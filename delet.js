const axios = require('axios');

// 👑 ضع هنا USER صاحب الصلاحية في Render
const OWNER_ID = process.env.USER;

module.exports = {
    name: "deleteCommands",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const userId = String(message.from.id);

        // 🔒 تحقق من الصلاحية
        if (userId !== OWNER_ID) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ ليس لديك صلاحية استخدام أوامر الحذف"
            });
        }

        const command = args[0].replace("/", "");

        // 🔹 عرض أوامر الحذف
        if (command === "اوامر_الحذف") {
            const text = "📌 أوامر الحذف المتاحة:\n\n" +
                         "1️⃣ /احذف - حذف رسالة تم الرد عليها\n" +
                         "2️⃣ /احذف_الكل - حذف جميع رسائلك المصرح بها\n" +
                         "3️⃣ /احذف_رسائل_من_<USERID> - حذف كل رسائل هذا المستخدم";
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text
            });
        }

        // 🔹 حذف رسالة محددة /احذف
        if (command === "احذف") {
            if (!message.reply_to_message) {
                return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                    chat_id,
                    text: "❌ الرجاء الرد على الرسالة المراد حذفها مع الأمر /احذف"
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

        // 🔹 حذف كل رسائل هذا الشخص (مثال /احذف_رسائل_من_7664410054)
        if (command.startsWith("احذف_رسائل_من_")) {
            const targetId = command.split("_")[3];
            // هنا يمكنك وضع منطق لحذف كل رسائل هذا المستخدم من قاعدة بيانات أو ملفاتك
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: `✅ سيتم حذف جميع رسائل المستخدم ${targetId} (يجب تنفيذ المنطق حسب تخزين الرسائل)`
            });
        }

        // 🔹 حذف كل رسائل صاحب الأمر /احذف_الكل
        if (command === "احذف_الكل") {
            // هنا يمكنك وضع منطق حذف جميع الرسائل التي تتبع هذا المستخدم
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائلك المصرح بها (يجب تنفيذ المنطق حسب تخزين الرسائل)"
            });
        }
    }
};
