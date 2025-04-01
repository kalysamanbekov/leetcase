/**
 * Утилиты для работы с чатами
 */

/**
 * Проверяет, является ли чат приватным (личным)
 * @param {Object} msg - Объект сообщения Telegram
 * @returns {boolean} - true, если чат приватный, false - если групповой или супергруппа
 */
function isPrivateChat(msg) {
  return msg.chat && msg.chat.type === 'private';
}

/**
 * Проверяет, является ли чат групповым (группа или супергруппа)
 * @param {Object} msg - Объект сообщения Telegram
 * @returns {boolean} - true, если чат групповой, false - если приватный
 */
function isGroupChat(msg) {
  return msg.chat && (msg.chat.type === 'group' || msg.chat.type === 'supergroup');
}

module.exports = {
  isPrivateChat,
  isGroupChat
};
