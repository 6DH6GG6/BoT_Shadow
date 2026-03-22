const fs = require('fs');
const path = require('path');

const admins = new Map();

// مسار مجلد KING
const adminFolder = __dirname;

// تحميل جميع ملفات js داخل مجلد KING
function loadAdmins() {
  if (!fs.existsSync(adminFolder)) return;

  const files = fs.readdirSync(adminFolder);
  for (const file of files) {
    const fullPath = path.join(adminFolder, file);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && file.endsWith('.js') && file !== 'king.js') {
      try {
        delete require.cache[require.resolve(fullPath)];
        const mod = require(fullPath);
        if (mod.handleUpdate) {
          const key = path.basename(file, '.js'); // admin.js -> admin
          admins.set(key, mod);
          console.log(`✅ Loaded ${file}`);
        } else {
          console.log(`⚠️ Skipped ${file} (no handleUpdate)`);
        }
      } catch (err) {
        console.log(`❌ Error loading ${file}: ${err.message}`);
      }
    }
  }
}

loadAdmins();

module.exports = { admins };
