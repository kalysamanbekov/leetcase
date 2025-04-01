/**
 * Сервис для работы с меню бота
 */

const { ReplyKeyboardMarkup } = require('node-telegram-bot-api');

/**
 * Создает боковое меню с основными разделами
 * @returns {ReplyKeyboardMarkup} Объект клавиатуры для отображения
 */
function createMainMenu() {
  return {
    keyboard: [
      [{ text: '❓ Помощь' }],
      [{ text: '👤 Мой профиль' }]
    ],
    resize_keyboard: true,
    persistent: true,
    one_time_keyboard: false
  };
}

/**
 * Отправляет сообщение с главным меню
 * @param {Object} bot - Экземпляр бота
 * @param {Number} chatId - ID чата
 * @param {String} text - Текст сообщения
 */
function sendMainMenuMessage(bot, chatId, text) {
  bot.sendMessage(chatId, text, {
    reply_markup: createMainMenu()
  });
}

module.exports = {
  createMainMenu,
  sendMainMenuMessage
};
