const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    name: "get",
    async execute(chatId, args, message) {

        const TOKEN = process.env.TOKEN;
        const OWNER_ID = process.env.USER;

        const userId = String(message.from.id);

        // 🔒 تحقق من الصلاحية (ID)
        if (userId !== OWNER_ID) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ ليس لديك صلاحية"
            });
        }

        const fileName = args[1];
        if (!fileName) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "📁 مثال:\n/get server.js"
            });
        }

        // 🛑 حماية ضد الملفات الحساسة
        const blocked = ['.env', 'node_modules', 'package-lock.json'];
        if (blocked.includes(fileName)) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "🚫 ملف محمي"
            });
        }

        // 🔹 دالة للبحث عن الملف في أي مكان داخل المشروع
        function findFileRecursive(baseDir, targetFile) {
            const files = fs.readdirSync(baseDir);
            for (const file of files) {
                const fullPath = path.join(baseDir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    const result = findFileRecursive(fullPath, targetFile);
                    if (result) return result;
                } else if (file === targetFile) {
                    return fullPath;
                }
            }
            return null;
        }

        const projectRoot = path.resolve(__dirname, '..'); // جذر المشروع
        const filePath = findFileRecursive(projectRoot, fileName);

        if (!filePath) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ الملف غير موجود في المشروع"
            });
        }

        // 🔹 إرسال الملف
        try {
            const form = new FormData();
            form.append('chat_id', chatId);
            form.append('document', fs.createReadStream(filePath));

            await axios.post(
                `https://api.telegram.org/bot${TOKEN}/sendDocument`,
                form,
                { headers: form.getHeaders() }
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
