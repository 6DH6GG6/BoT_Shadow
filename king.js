const admin = require('./admin');
const axios = require('axios');

async function handle(update) {
    // كل شيء يذهب إلى admin.js للتعامل مع الرسائل
    if (update.message) {
        await admin.handleUpdate(update);
    } else {
        console.log("Update received but not a message:", update);
    }
}

module.exports = { handle };
