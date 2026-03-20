const axios = require('axios');

const OWNER_ID = process.env.USER; // صاحب الصلاحية

// ✅ قائمة الأوامر التي سيضيفها delet.js تلقائيًا
const commandsToRegister = [
    "احذف",
    "احذف_الكل",
    "احذف_رسائل_من",
    "حذف_من_لجميع",
    "قائمة_الحذف"
];

module.exports = commandsToRegister.map(cmd => ({
    name: cmd,
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const userId = String(message.from.id);

        if (userId !== OWNER_ID) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "❌ ليس لديك صلاحية استخدام أوامر الحذف"
            });
        }

        const command = cmd;

        // عرض قائمة الحذف
        if (command === "قائمة_الحذف") {
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
        if (command === "احذف") {
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

        // حذف كل رسائل صاحب الأمر
        if (command === "احذف_الكل") {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائلك المصرح بها (حسب التخزين)"
            });
        }

        // حذف رسائل مستخدم محدد
        if (command === "احذف_رسائل_من") {
            const targetId = args[0].split("_")[3];
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

        // حذف جميع الرسائل من كل المستخدمين
        if (command === "حذف_من_لجميع") {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائل كل المستخدمين (حسب التخزين)"
            });
        }
    }
}));
