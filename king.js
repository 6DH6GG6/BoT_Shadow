const fs = require('fs');
const path = require('path');

class King {
    constructor(folders = []) {
        this.foldersToLoad = folders;
        this.files = [];
    }

    addFolder(folderPath) {
        if (!this.foldersToLoad.includes(folderPath)) {
            this.foldersToLoad.push(folderPath);
        }
    }

    scanFiles() {
        this.files = [];
        for (const folder of this.foldersToLoad) {
            this._readFolderRecursive(folder);
        }
        return this.files;
    }

    _readFolderRecursive(folderPath) {
        if (!fs.existsSync(folderPath)) return;

        const items = fs.readdirSync(folderPath);
        for (const item of items) {
            const fullPath = path.join(folderPath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                this._readFolderRecursive(fullPath);
            } else if (item.endsWith('.js') || item.endsWith('.json')) {
                this.files.push({
                    name: item,
                    fullPath,
                    ext: path.extname(item)
                });
            }
        }
    }

    requireFile(filePath) {
        if (!fs.existsSync(filePath)) throw new Error("❌ الملف غير موجود");
        delete require.cache[require.resolve(filePath)];
        return require(filePath);
    }

    getFilesWithContent() {
        return this.scanFiles().map(f => {
            let content = null;
            if (f.ext === '.json') {
                try {
                    content = JSON.parse(fs.readFileSync(f.fullPath, 'utf-8'));
                } catch {}
            }
            return {
                name: f.name,
                path: f.fullPath,
                ext: f.ext,
                content
            };
        });
    }
}

const defaultFolders = [
    path.join(__dirname, 'utils'),
    path.join(__dirname, 'shadow_monitor'),
    path.join(__dirname, 'monitor'),
    path.join(__dirname, 'commands')
];

module.exports = new King(defaultFolders);
