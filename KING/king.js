const fs = require('fs');
const path = require('path');

const admins = new Map();

// مجلد ملفات الأدمن
const adminFilesPath = path.join(__dirname, '../'); // أعلى من KING/

// تحميل جميع ملفات الأدمن (.js)
function loadAdmins(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadAdmins(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const mod = require(fullPath);
                if (mod.handleUpdate) {
                    const name = file.replace('.js', '');
                    admins.set(name, mod);
                    console.log(`✅ Loaded admin: ${name}`);
                }
            } catch (err) {
                console.log(`❌ Error loading ${file}: ${err.message}`);
            }
        }
    }
}

loadAdmins(adminFilesPath);

module.exports = { admins };
