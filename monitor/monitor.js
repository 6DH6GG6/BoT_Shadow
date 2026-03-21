const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "monitor",
    description: "عرض بيانات المراقبة بتنسيق مزخرف",
    execute: async (chatId, args, message, commands) => {
        const USER_ID = process.env.USER;
        if (String(message.from.id) !== String(USER_ID)) {
            return console.log(`⚠️ محاولة وصول غير مصرح بها من ${message.from.id}`);
        }

        const monitorPath = path.join(__dirname, '../monitor');
        const chatFile = path.join(monitorPath, 'chat.json');
        const groupFile = path.join(monitorPath, 'idGroup.json');

        // ==== تخزين الرسائل التي تحتوي على كلمات محددة ====
        const shadowKeywords = ['shadow','شادو','تشادو','شادوه','شادوة','تشادوه','تشادوة','شادوا','تشادوا'];
        if (message.text && shadowKeywords.some(w => message.text.toLowerCase().includes(w.toLowerCase()))) {
            const chatData = fs.existsSync(chatFile) ? JSON.parse(fs.readFileSync(chatFile, 'utf-8')) : [];
            chatData.push({
                message_id: message.message_id,
                user_id: message.from.id,
                username: message.from.username || `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim(),
                text: message.text,
                timestamp: new Date().toISOString()
            });
            fs.writeFileSync(chatFile, JSON.stringify(chatData, null, 2));
            console.log(`✅ تم حفظ رسالة ${message.message_id} في chat.json`);
        }

        // ==== تخزين بيانات المجموعات عند الانضمام ====
        if (['group', 'supergroup'].includes(message.chat.type)) {
            const groupData = fs.existsSync(groupFile) ? JSON.parse(fs.readFileSync(groupFile, 'utf-8')) : [];
            if (!groupData.some(g => g.chat_id === message.chat.id)) {
                let adminList = [];
                try {
                    const res = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChatAdministrators?chat_id=${message.chat.id}`);
                    adminList = res.data.result.map(a => a.user.username || `${a.user.first_name || ""} ${a.user.last_name || ""}`.trim());
                } catch (err) {
                    console.log("❌ خطأ في جلب الأدمن:", err.message);
                }
                groupData.push({
                    chat_id: message.chat.id,
                    chat_title: message.chat.title,
                    admins: adminList
                });
                fs.writeFileSync(groupFile, JSON.stringify(groupData, null, 2));
                console.log(`✅ تم حفظ مجموعة ${message.chat.title} في idGroup.json`);
            }
        }

        // ==== فقط إذا كان الأمر /monitor ====
        if (!args || args[0].toLowerCase() !== '/monitor') return; // هذا السطر يمنع عرض القائمة لأي رسالة أخرى

        // ==== عرض القائمة إذا لم يحدد المستخدم خيار ====
        if (!args[1]) {
            return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `♦ /chat ♦\n♦ /group ♦`
            });
        }

        const option = args[1].toLowerCase();
        let filePath, fileName;

        if (option === "chat") {
            filePath = chatFile;
            fileName = 'chat.json';
        } else if (option === "group") {
            filePath = groupFile;
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
        const formatted = `╭━━━━━༻❖༺━━━━━╮\n${data}\n╰━━━━━༻❖༺━━━━━╯`;

        try {
            await axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: formatted
            });
            console.log(`✅ تم إرسال محتوى ${fileName} للمستخدم ${message.from.username || message.from.id}`);
        } catch (err) {
            console.error(`❌ خطأ في إرسال الملف: ${err.message}`);
        }
    }
};
