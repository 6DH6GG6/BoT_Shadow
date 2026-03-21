// cod.js - يحافظ على البوت نشط ويعرض حالة النظام
const axios = require('axios');

const TOKEN = process.env.TOKEN;           // توكن البوت
const RENDER_URL = process.env.RENDER_URL; // رابط تطبيقك على Render بدون /webhook
const OWNER_ID = process.env.OWNER_ID;     // رقمك على Telegram لتلقي النتائج/تنبيهات

const WEBHOOK_URL = `${RENDER_URL}/webhook/${TOKEN}`;

// -------------------- تسجيل Webhook --------------------
async function setWebhook() {
    try {
        await axios.get(`https://api.telegram.org/bot${TOKEN}/setWebhook?url=${WEBHOOK_URL}`);
        console.log('✅ Webhook تم تسجيله بنجاح');
        return true;
    } catch (err) {
        console.log('❌ فشل تسجيل Webhook:', err.message);
        notifyOwner(`❌ فشل تسجيل Webhook: ${err.message}`);
        return false;
    }
}

// -------------------- تحقق من Webhook --------------------
async function checkWebhook() {
    try {
        const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`);
        const url = res.data.result.url;

        if (url !== WEBHOOK_URL) {
            console.log('⚠️ Webhook غير مضبوط، إعادة التسجيل...');
            notifyOwner(`⚠️ Webhook غير مضبوط، جاري إعادة التسجيل...`);
            await setWebhook();
            return false;
        } else {
            console.log('✅ Webhook مضبوط بالفعل');
            return true;
        }
    } catch (err) {
        console.log('❌ فشل التحقق من Webhook:', err.message);
        await setWebhook();
        return false;
    }
}

// -------------------- Ping السيرفر --------------------
async function pingServer() {
    try {
        await axios.get(RENDER_URL);
        console.log('🌐 Ping للسيرفر ناجح');
        return true;
    } catch (err) {
        console.log('❌ Ping للسيرفر فشل:', err.message);
        return false;
    }
}

// -------------------- إرسال إشعار للمالك --------------------
async function notifyOwner(message) {
    if (!OWNER_ID) return;
    try {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: OWNER_ID,
            text: message
        });
    } catch (err) {
        console.log('❌ فشل إرسال تنبيه للمالك:', err.message);
    }
}

// -------------------- أمر /النضام --------------------
async function systemStatus(chatId) {
    const webhookStatus = await checkWebhook() ? '✅ Webhook نشط' : '❌ Webhook توقف';
    const pingStatus = await pingServer() ? '✅ السيرفر نشط' : '❌ السيرفر توقف';

    const msg = `╭━━━━━༻❖༺━━━━━╮
حالة النظام:
${webhookStatus}
${pingStatus}
╰━━━━━༻❖༺━━━━━╯`;

    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: msg
    });
}

// -------------------- تنفيذ تلقائي --------------------
(async () => {
    console.log('🚀 تشغيل cod.js للحفاظ على البوت نشط');

    await setWebhook();

    // تحقق من Webhook كل 5 دقائق
    setInterval(checkWebhook, 5 * 60 * 1000);

    // Ping للسيرفر كل 4 دقائق
    setInterval(pingServer, 4 * 60 * 1000);

    // الاستماع لأمر /النضام من OWNER_ID
    const TELEGRAM_URL = `https://api.telegram.org/bot${TOKEN}`;
    setInterval(async () => {
        try {
            const updates = await axios.get(`${TELEGRAM_URL}/getUpdates`);
            const messages = updates.data.result;
            for (const m of messages) {
                if (!m.message) continue;
                const text = m.message.text || '';
                const fromId = m.message.from.id;

                if (text === '/النضام' && fromId == OWNER_ID) {
                    await systemStatus(fromId);
                }
            }
        } catch (err) {
            console.log('❌ خطأ في مراقبة /النضام:', err.message);
        }
    }, 3000); // تحقق كل 3 ثواني
})();
