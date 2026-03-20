const axios = require('axios');

const OWNER_ID = process.env.USER; // صاحب الصلاحية

// قائمة أوامر الحذف
const deleteCommandsList = [
    { name: "احذف", description: "حذف رسالة تم الرد عليها" },
    { name: "احذف_الكل", description: "حذف جميع رسائلك المصرح بها" },
    { name: "احذف_رسائل_من", description: "حذف جميع رسائل مستخدم محدد /احذف_رسائل_من_<USERID>" },
    { name: "حذف_من_لجميع", description: "حذف جميع الرسائل من كل المستخدمين" }
];

module.exports = {
    name: "delet",
    async execute(chatId, args, message) {
        const TOKEN = process.env.TOKEN;
        const userId = String(message.from.id);

        if (userId !== OWNER_ID) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ ليس لديك صلاحية استخدام أوامر الحذف"
            });
        }

        const command = args[0].replace("/", "").toLowerCase();

        // عرض قائمة الحذف
        if (command === "قائمة_الحذف") {
            let text = "📌 قائمة أوامر الحذف المتاحة:\n\n";
            deleteCommandsList.forEach((c, i) => {
                text += `${i + 1}️⃣ /${c.name} → ${c.description}\n`;
            });
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

        // حذف جميع رسائل صاحب الأمر
        if (command === "احذف_الكل") {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائلك المصرح بها (حسب التخزين)"
            });
        }

        // حذف رسائل مستخدم محدد
        if (command.startsWith("احذف_رسائل_من")) {
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

        // حذف جميع الرسائل من جميع المستخدمين
        if (command === "حذف_من_لجميع") {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id,
                text: "✅ سيتم حذف جميع رسائل كل المستخدمين (حسب التخزين)"
            });
        }

        // أي أمر آخر غير معروف
        return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id,
            text: `❌ الأمر /${command} غير موجود. استخدم /قائمة_الحذف لرؤية الأوامر`
        });
    }
};
