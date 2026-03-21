const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OWNER_ID = process.env.USER;
const TOKEN = process.env.TOKEN;

const USERS_FILE = path.join(__dirname, 'users.json');

// تحميل المستخدمين
function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

// حفظ المستخدمين
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function monitorUser(message) {
    if (!message.from) return;

    const users = loadUsers();

    const userId = message.from.id;
    const username = message.from.username || "لا يوجد";
    const name = `${message.from.first_name || ""} ${message.from.last_name || ""}`.trim();

    let exists = users.find(u => u.id === userId);

    if (!exists) {
        users.push({
            id: userId,
            username,
            name,
            messages: 1
        });

        saveUsers(users);

        // 🚨 تنبيه دخول جديد
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: OWNER_ID,
            text: `🚨 مستخدم جديد تحت المراقبة:\n\nID: ${userId}\nUSER: ${username}\nNAME: ${name}`
        });

    } else {
        exists.messages += 1;
        saveUsers(users);
    }

    // 👀 مراقبة كلمات
    const text = message.text || "";

    if (text.includes("تهكير") || text.includes("اختراق")) {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: OWNER_ID,
            text: `⚠️ تم رصد كلمة مشبوهة!\n\n👤 ${name}\n📝 ${text}`
        });
    }
}

module.exports = { monitorUser };
