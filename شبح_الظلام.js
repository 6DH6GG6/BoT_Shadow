const path = require('path');
const King = require('./king');

const king = new King([
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'image'),
    path.join(__dirname, 'join'),
    path.join(__dirname, 'monitor'),
    path.join(__dirname, 'shadow_monitor'),
    path.join(__dirname, 'utils')
]);

const adminFiles = [
    'admin.js',
    'admin2.js'
];

const admins = new Map();

for (const fileName of adminFiles) {
    try {
        const filePath = path.join(__dirname, fileName);
        const adminModule = king.requireFile(filePath);
        if (adminModule && typeof adminModule.handleUpdate === 'function') {
            admins.set(fileName, adminModule);
            console.log(`✅ Loaded admin module: ${fileName}`);
        }
    } catch (err) {
        console.log(`❌ Failed to load ${fileName}: ${err.message}`);
    }
}

module.exports = { king, admins };
