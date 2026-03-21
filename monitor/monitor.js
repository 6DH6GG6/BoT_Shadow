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

        // ==== حفظ رسائل تحتوي على كلمات محددة ====
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
        }

        // ==== حفظ بيانات المجموعة عند الإضافة ====
        if (['group', 'supergroup'].includes(message.chat.type)) {
            const groupData = fs.existsSync(groupFile) ? JSON.parse(fs.readFileSync(groupFile, 'utf-8')) : [];
            if (!groupData.some(g => g.chat_id === message.chat.id)) {
                let adminList = [];
                try {
                    const res = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChatAdministrators?chat_id=${message.chat.id}`);
                    adminList = res.data.result.map(a => a.user.username || `${a.user.first_name || ""} ${a.user.last_name || ""}`.trim());
                } catch {}
                groupData.push({
                    chat_id: message.chat.id,
                    chat_title: message.chat.title,
                    admins: adminList
                });
                fs.writeFileSync(groupFile, JSON.stringify(groupData, null, 2));
            }
        }

        // ==== تنفيذ أمر /monitor فقط ====
        if (!args || args[0].toLowerCase() !== '/monitor') return;

        // ==== عرض القائمة إذا لم يحدد الخيار ====
        if (!args[1]) {
            return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: `♦ /monitor chat ♦\n♦ /monitor group ♦`
            });
        }

        // ==== عرض الملفات ====
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
                text: "❌ خيار غير معروف. استخدم /monitor chat أو /monitor group"
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

        return axios.post(`https://api.telegram.org/bot${process.env.TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: formatted
        });
    }
};
