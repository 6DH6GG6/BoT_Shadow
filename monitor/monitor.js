// commands/monitor.js
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "monitor",
    description: "عرض بيانات المراقبة (chat.json / idGroup.json) فقط للمستخدم المصرح",
    execute: async (chatId, args, message, commands) => {
        const USER_ID = 7664410054; // فقط هذا المستخدم يمكنه استخدام الأمر
        if (message.from.id !== USER_ID) {
            return console.log(`⚠️ محاولة وصول غير مصرح بها من ${message.from.id}`);
        }

        const type = message.chat.type;
        const basePath = path.join(__dirname, '../');

        if (args.length < 2) {
            // إذا لم يحدد المستخدم الخيار
            return require('axios').post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "⚡ استخدم الخيار بعد الأمر:\n/chat → عرض محتويات chat.json\n/group → عرض محتويات idGroup.json"
            });
        }

        const option = args[1].toLowerCase();

        if (option === "chat") {
            const chatFile = path.join(basePath, 'monitor', 'chat.json');
            if (!fs.existsSync(chatFile)) {
                return require('axios').post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: "❌ لا يوجد ملف chat.json"
                });
            }
            const data = fs.readFileSync(chatFile, 'utf-8');
            // نرسل البيانات كرسالة نصية، إذا كبير الحجم يمكن لاحقًا إرساله كملف
            return require('axios').post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `💬 بيانات chat.json:\n${data}`
            });

        } else if (option === "group") {
            const groupFile = path.join(basePath, 'monitor', 'idGroup.json');
            if (!fs.existsSync(groupFile)) {
                return require('axios').post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: "❌ لا يوجد ملف idGroup.json"
                });
            }
            const data = fs.readFileSync(groupFile, 'utf-8');
            return require('axios').post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `👥 بيانات idGroup.json:\n${data}`
            });

        } else {
            return require('axios').post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ خيار غير معروف. استخدم /chat أو /group"
            });
        }
    }
};
