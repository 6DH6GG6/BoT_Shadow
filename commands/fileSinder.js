const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "get",
    async execute(chatId, args, message) {

        const TOKEN = process.env.TOKEN;
        const OWNER = process.env.USER; // يوزرك
        const username = message.from.username;

        // 🔒 تحقق من الصلاحية
        if (!username || username.toLowerCase() !== OWNER.toLowerCase()) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ ليس لديك صلاحية استخدام هذا الأمر"
            });
        }

        // 📂 اسم الملف
        const fileName = args[1];

        if (!fileName) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "📁 اكتب اسم الملف بعد الأمر\nمثال: /get server.js"
            });
        }

        // 🛑 منع الملفات الحساسة
        const blockedFiles = ['.env', 'node_modules', 'package-lock.json'];

        if (blockedFiles.includes(fileName)) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "🚫 هذا الملف محمي"
            });
        }

        // 📍 المسار
        const filePath = path.join(__dirname, '..', fileName);

        // ❌ تحقق من وجود الملف
        if (!fs.existsSync(filePath)) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ الملف غير موجود"
            });
        }

        try {
            // 📤 إرسال الملف
            const formData = {
                chat_id: chatId,
                document: fs.createReadStream(filePath)
            };

            await axios.post(
                `https://api.telegram.org/bot${TOKEN}/sendDocument`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

        } catch (err) {
            console.log(err);
            await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ خطأ أثناء إرسال الملف"
            });
        }
    }
};
