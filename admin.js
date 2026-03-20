const TOKEN = process.env.TOKEN;
const USER = process.env.USER;

module.exports = {
    TOKEN,
    USER,
    handleUpdate: async (update) => {
        const commands = require('./commands');

        if (!update.message) return;

        const text = update.message.text || "";
        const chatId = update.message.chat.id;

        const args = text.split(" ");
        const cmd = args[0].replace("/", "");

        if (commands[cmd]) {
            await commands[cmd](chatId, args);
        }
    }
};
