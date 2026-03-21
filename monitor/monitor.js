const fs = require('fs');
const path = require('path');

const chatFile = path.join(__dirname, 'chat.json');
const idGroupFile = path.join(__dirname, 'idGroup.json');

// الكلمات المراقبة
const keywords = ['shadow','شادو','تشادو','شادوه','شادوة','تشادوه','تشادوة'];

// تهيئة الملفات إذا لم تكن موجودة
if (!fs.existsSync(chatFile)) fs.writeFileSync(chatFile, JSON.stringify([], null, 2));
if (!fs.existsSync(idGroupFile)) fs.writeFileSync(idGroupFile, JSON.stringify([], null, 2));

// حفظ مجموعة جديدة في idGroup.json
function saveGroup(chatId, chatName) {
  let data = JSON.parse(fs.readFileSync(idGroupFile));
  if (!data.some(g => g.id === chatId)) {
    data.push({ id: chatId, name: chatName });
    fs.writeFileSync(idGroupFile, JSON.stringify(data, null, 2));
    console.log(`✅ تمت إضافة مجموعة جديدة: ${chatName} (${chatId})`);
  }
}

// حفظ رسالة في chat.json
function saveMessage(userId, username, chatId, message) {
  const timestamp = new Date().toISOString();
  let data = JSON.parse(fs.readFileSync(chatFile));
  data.push({ user_id: userId, username, chat_id: chatId, message, timestamp });
  fs.writeFileSync(chatFile, JSON.stringify(data, null, 2));
}

// معالجة رسالة جديدة
function handleMessage(chat, userId, username, message) {
  const chatId = chat.id;
  const chatName = chat.title || chat.username || 'Unknown';

  // حفظ المجموعة تلقائيًا عند الانضمام
  saveGroup(chatId, chatName);

  // مراقبة الكلمات
  if (keywords.some(word => message.toLowerCase().includes(word.toLowerCase()))) {
    saveMessage(userId, username, chatId, message);
    console.log(`💬 تم تسجيل رسالة من ${username} في ${chatName}: "${message}"`);
  }
}

// --- مثال اختبار ---
handleMessage({id: 111, title: 'قناة الألعاب'}, 12345, 'Mohamed', 'مرحبا شادو');
handleMessage({id: 111, title: 'قناة الألعاب'}, 67890, 'Ali', 'shadow هنا');
handleMessage({id: 222, title: 'مجموعة شادو'}, 55555, 'Sara', 'تشادو رائع');
