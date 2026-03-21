// cod.js - يحافظ على البوت نشط على Render ويعيد تسجيل Webhook تلقائيًا
const axios = require('axios');

// -------------------- متغيرات البيئة --------------------
const TOKEN = process.env.TOKEN;           // توكن البوت
const RENDER_URL = process.env.RENDER_URL; // رابط تطبيقك على Render بدون /webhook
const OWNER_ID = process.env.OWNER_ID;     // اختياري: ID لإرسال تنبيهات إذا فشل Webhook

// رابط Webhook الكامل
const WEBHOOK_URL = `${RENDER_URL}/webhook/${TOKEN}`;

// -------------------- دالة تسجيل Webhook --------------------
async function setWebhook() {
    try {
        await axios.get(`https://api.telegram.org/bot${TOKEN}/setWebhook?url=${WEBHOOK_URL}`);
        console.log('✅ Webhook تم تسجيله بنجاح');
    } catch (err) {
        console.log('❌ فشل تسجيل Webhook:', err.message);
        if (OWNER_ID) notifyOwner(`❌ فشل تسجيل Webhook: ${err.message}`);
    }
}

// -------------------- تحقق دوري من Webhook --------------------
async function checkWebhook() {
    try {
        const res = await axios.get(`https://api.telegram.org/bot${TOKEN}/getWebhookInfo`);
        const url = res.data.result.url;

        if (url !== WEBHOOK_URL) {
            console.log('⚠️ Webhook غير مضبوط، إعادة التسجيل...');
            if (OWNER_ID) notifyOwner(`⚠️ Webhook غير مضبوط، جاري إعادة التسجيل...`);
            await setWebhook();
        } else {
            console.log('✅ Webhook مضبوط بالفعل');
        }
    } catch (err) {
        console.log('❌ فشل التحقق من Webhook:', err.message);
        await setWebhook();
    }
}

// -------------------- Ping للسيرفر للحفاظ على Render نشط --------------------
async function pingServer() {
    try {
        await axios.get(RENDER_URL);
        console.log('🌐 Ping للسيرفر ناجح');
    } catch (err) {
        console.log('❌ Ping للسيرفر فشل:', err.message);
    }
}

// -------------------- إرسال تنبيهات للمالك (اختياري) --------------------
async function notifyOwner(message) {
    try {
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            chat_id: OWNER_ID,
            text: message
        });
    } catch (err) {
        console.log('❌ فشل إرسال تنبيه للمالك:', err.message);
    }
}

// -------------------- التنفيذ الرئيسي --------------------
(async () => {
    console.log('🚀 تشغيل cod.js للحفاظ على البوت نشط');

    // تسجيل Webhook عند بدء السكربت
    await setWebhook();

    // تحقق من Webhook كل 5 دقائق
    setInterval(checkWebhook, 5 * 60 * 1000);

    // Ping للسيرفر كل 4 دقائق
    setInterval(pingServer, 4 * 60 * 1000);
})();
