const axios = require('axios');
const OWNER_ID = process.env.USER; // صاحب الصلاحية
const TOKEN = process.env.TOKEN;

const deletCommands = {};

// 1️⃣ /احذف
deletCommands["احذف"] = async (chatId, args, message) => {
    const userId = String(message.from.id);
    if (userId !== OWNER_ID) {
        return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id, text: "❌ ليس لديك صلاحية استخدام أوامر الحذف" });
    }
    if (!message.reply_to_message) {
        return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id, text: "❌ الرجاء الرد على الرسالة المراد حذفها مع /احذف" });
    }
    const message_id = message.reply_to_message.message_id;
    try {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/deleteMessage`, { chat_id, message_id });
    } catch (err) {
        console.log(err.response?.data || err.message);
    }
};

// 2️⃣ /احذف_الكل
deletCommands["احذف_الكل"] = async (chatId, args, message) => {
    const userId = String(message.from.id);
    if (userId !== OWNER_ID) return;
    return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id, text: "✅ سيتم حذف جميع رسائلك المصرح بها (حسب التخزين)" });
};

// 3️⃣ /احذف_رسائل_من_<USERID>
deletCommands["احذف_رسائل_من"] = async (chatId, args, message) => {
    const userId = String(message.from.id);
    if (userId !== OWNER_ID) return;
    const targetId = args[0]?.split("_")[3];
    if (!targetId) {
        return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id, text: "❌ يرجى تحديد USERID: /احذف_رسائل_من_<USERID>" });
    }
    return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id, text: `✅ سيتم حذف جميع رسائل المستخدم ${targetId} (حسب التخزين)` });
};

// 4️⃣ /حذف_من_لجميع
deletCommands["حذف_من_لجميع"] = async (chatId, args, message) => {
    const userId = String(message.from.id);
    if (userId !== OWNER_ID) return;
    return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id, text: "✅ سيتم حذف جميع رسائل كل المستخدمين (حسب التخزين)" });
};

// 5️⃣ /قائمة_الحذف
deletCommands["قائمة_الحذف"] = async (chatId, args, message) => {
    const userId = String(message.from.id);
    if (userId !== OWNER_ID) return;
    let text = "📌 قائمة أوامر الحذف:\n\n";
    text += "1️⃣ /احذف → حذف رسالة تم الرد عليها\n";
    text += "2️⃣ /احذف_الكل → حذف جميع رسائلك المصرح بها\n";
    text += "3️⃣ /احذف_رسائل_من_<USERID> → حذف رسائل مستخدم محدد\n";
    text += "4️⃣ /حذف_من_لجميع → حذف جميع رسائل كل المستخدمين\n";
    return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, { chat_id, text });
};

module.exports = deletCommands;
