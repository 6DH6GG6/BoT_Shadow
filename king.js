const fs = require('fs');
const path = require('path');

class King {
    constructor(folders = []) {
        this.folders = folders.length ? folders : [
            path.join(__dirname, 'commands'),
            path.join(__dirname, 'image'),
            path.join(__dirname, 'join'),
            path.join(__dirname, 'monitor'),
            path.join(__dirname, 'utils'),
            path.join(__dirname, 'shadow_monitor')
        ];
    }

    getFilesWithContent(dir = null) {
        const result = [];
        const foldersToRead = dir ? [dir] : this.folders;

        for (const folder of foldersToRead) {
            if (!fs.existsSync(folder)) continue;

            const files = fs.readdirSync(folder);
            for (const file of files) {
                const fullPath = path.join(folder, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    result.push(...this.getFilesWithContent(fullPath));
                } else if (file.endsWith('.js') || file.endsWith('.json')) {
                    result.push({
                        path: fullPath,
                        name: file,
                        content: fs.readFileSync(fullPath, 'utf-8')
                    });
                }
            }
        }
        return result;
    }
}

module.exports = King;
