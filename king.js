const fs = require('fs');
const path = require('path');

class King {
    constructor(folders = []) {
        this.folders = folders;
    }

    addFolder(folderPath) {
        if (!this.folders.includes(folderPath)) this.folders.push(folderPath);
    }

    getFilesWithContent() {
        let results = [];
        for (const folder of this.folders) {
            this._readFolderRecursive(folder, results);
        }
        return results;
    }

    _readFolderRecursive(folder, results) {
        if (!fs.existsSync(folder)) return;
        const files = fs.readdirSync(folder);
        for (const file of files) {
            const fullPath = path.join(folder, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) this._readFolderRecursive(fullPath, results);
            else if (file.endsWith('.js') || file.endsWith('.json')) {
                results.push({ path: fullPath, name: file, ext: path.extname(file) });
            }
        }
    }

    requireFile(filePath) {
        delete require.cache[require.resolve(filePath)];
        return require(filePath);
    }
}

module.exports = King;
