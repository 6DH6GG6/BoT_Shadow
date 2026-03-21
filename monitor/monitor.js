const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "monitor",
    description: "عرض بيانات المراقبة بتنسيق مزخرف",
    execute: async (chatId, args, message, commands) => {
        const USER_ID = 7664410054; // فقط هذا المستخدم يمكنه استخدام الأمر
        if (message.from.id !== USER_ID) {
            return console.log(`⚠️ محاولة وصول غير مصرح بها من ${message.from.id}`);
        }

        const monitorPath = path.join(__dirname, '../monitor');

        // إذا لم يتم تحديد خيار، نرسل قائمة الأوامر
        if (args.length < 2) {
            const menuText = `♦ /chat ♦\n♦ /group ♦`;
            return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: menuText
            });
        }

        const option = args[1].toLowerCase();
        let filePath, fileName;

        if (option === "chat") {
            filePath = path.join(monitorPath, 'chat.json');
            fileName = 'chat.json';
        } else if (option === "group") {
            filePath = path.join(monitorPath, 'idGroup.json');
            fileName = 'idGroup.json';
        } else {
            return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ خيار غير معروف. استخدم /chat أو /group"
            });
        }

        if (!fs.existsSync(filePath)) {
            return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `❌ لا يوجد ملف ${fileName}`
            });
        }

        const data = fs.readFileSync(filePath, 'utf-8');

        // إرسال البيانات بتنسيق مزخرف
        const formatted = `╭━━━━━༻❖༺━━━━━╮\n${data}\n╰━━━━━༻❖༺━━━━━╯`;

        return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: formatted
        }).then(() => {
            console.log(`✅ تم إرسال محتوى ${fileName} للمستخدم ${message.from.username || message.from.id}`);
        }).catch(err => {
            console.error(`❌ خطأ في إرسال الملف: ${err.message}`);
        });
    }
};
