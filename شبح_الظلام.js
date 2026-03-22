const path = require('path');
const King = require('./king'); // king.js مسؤول عن قراءة جميع .js و .json

// إنشاء نسخة من King لقراءة جميع الملفات
const king = new King();

// Map لتخزين جميع ملفات الإدارة
const admins = new Map();

// مجلدات أو ملفات إدارية تريد تحميلها
const adminFolders = [
    path.join(__dirname, 'admin'),     // admin.js و أي أوامر أخرى
    path.join(__dirname, 'admin2')     // admin2.js و monitor.js
];

// تحميل ملفات الإدارة عبر king.js
for (const folder of adminFolders) {
    const files = king.getFilesWithContent(folder); // يرجع array من الملفات
    for (const file of files) {
        try {
            if (file.path.endsWith('.js')) {
                delete require.cache[require.resolve(file.path)];
                const required = require(file.path);
                if (required.handleUpdate) {
                    const name = required.name || path.basename(file.path, '.js');
                    admins.set(name, required);
                    console.log(`✅ Loaded admin module: ${name}`);
                }
            }
        } catch (err) {
            console.log(`❌ Error loading admin file ${file.path}: ${err.message}`);
        }
    }
}

module.exports = { king, admins };
