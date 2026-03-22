const admins = new Map();

function loadAdmins() {
    try {
        const admin = require('../admin');
        if (admin.handleUpdate) {
            admins.set('admin', admin);
            console.log('✅ Loaded admin.js');
        }
    } catch (err) {
        console.log('❌ admin.js:', err.message);
    }

    try {
        const admin2 = require('../admin2');
        if (admin2.handleUpdate) {
            admins.set('admin2', admin2);
            console.log('✅ Loaded admin2.js');
        }
    } catch (err) {
        console.log('❌ admin2.js:', err.message);
    }
}

loadAdmins();

module.exports = { admins };
