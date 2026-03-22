const path = require('path');
const King = require('./king');

const king = new King();
const admins = new Map();

const adminFolders = [
    path.join(__dirname, 'admin'),
    path.join(__dirname, 'admin2')
];

for (const folder of adminFolders) {
    const files = king.getFilesWithContent(folder);
    for (const file of files) {
        if (file.path.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(file.path)];
                const required = require(file.path);
                if (required.handleUpdate) {
                    const name = required.name || require('path').basename(file.path, '.js');
                    admins.set(name, required);
                    console.log(`✅ Loaded admin module: ${name}`);
                }
            } catch (err) {
                console.log(`❌ Error loading admin file ${file.path}: ${err.message}`);
            }
        }
    }
}

module.exports = { king, admins };
