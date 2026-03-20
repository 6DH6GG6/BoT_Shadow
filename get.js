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

        // 🛑 حماية
        const blocked = ['.env', 'node_modules'];

        if (blocked.includes(fileName)) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "🚫 ملف محمي"
            });
        }

        const filePath = path.join(__dirname, '..', fileName);

        if (!fs.existsSync(filePath)) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ الملف غير موجود"
            });
        }

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
        }
    }
};
