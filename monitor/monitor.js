// commands/monitor.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "monitor",
    description: "عرض بيانات المراقبة (chat.json / idGroup.json) فقط للمستخدم المصرح",
    execute: async (chatId, args, message, commands) => {
        const USER_ID = 7664410054; // فقط هذا المستخدم يمكنه استخدام الأمر
        if (message.from.id !== USER_ID) {
            return console.log(`⚠️ محاولة وصول غير مصرح بها من ${message.from.id}`);
        }

        const type = message.chat.type;
        const monitorPath = path.join(__dirname, '../monitor');

        if (args.length < 2) {
            return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "⚡ استخدم الخيار بعد الأمر:\n/chat → عرض محتويات chat.json\n/group → عرض محتويات idGroup.json"
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

        // إرسال الملف مباشرة للبوت كملف JSON
        return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendDocument`, {
            chat_id: chatId,
            document: fs.createReadStream(filePath)
        }).then(() => {
            console.log(`✅ تم إرسال ملف ${fileName} للمستخدم ${message.from.username || message.from.id}`);
        }).catch(err => {
            console.error(`❌ خطأ في إرسال الملف: ${err.message}`);
        });
    }
};
