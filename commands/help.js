const axios = require('axios');
const admin = require('../admin');

module.exports = {
    name: "help",
    async execute(chatId, args, message) {

        const TOKEN = process.env.TOKEN;

        const cmds = Array.from(admin.commands.keys());

        if (cmds.length === 0) {
            return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "❌ لا يوجد أوامر"
            });
        }

        let msg = "📜 الأوامر:\n\n";

        cmds.forEach(c => {
            msg += `/${c}\n`;
        });

        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: msg
        });
    }
};
