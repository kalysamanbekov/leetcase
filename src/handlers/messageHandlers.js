/**
 * Обработчики текстовых сообщений
 */

/**
 * Обработчик текстовых сообщений
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
const handleTextMessage = (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();
  
  // Простой пример обработки текстовых сообщений
  if (text.includes('привет') || text.includes('hi') || text.includes('hello')) {
    bot.sendMessage(chatId, 'Привет! Как я могу вам помочь?');
  } else if (text.includes('пока') || text.includes('bye')) {
    bot.sendMessage(chatId, 'До свидания! Буду рад помочь вам снова.');
  } else if (text.includes('спасибо') || text.includes('thank')) {
    bot.sendMessage(chatId, 'Всегда пожалуйста! Чем ещё могу помочь?');
  } else {
    // Если не распознали сообщение
    bot.sendMessage(
      chatId, 
      `Я получил ваше сообщение: "${msg.text}". Используйте /help для списка команд.`
    );
  }
};

/**
 * Обработчик для получения фото
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
const handlePhoto = (bot, msg) => {
  const chatId = msg.chat.id;
  
  // Получаем идентификатор фото (берем последнее фото из массива)
  const photoId = msg.photo[msg.photo.length - 1].file_id;
  
  bot.sendMessage(
    chatId,
    `Спасибо за фото! Я получил его и сохранил с идентификатором: ${photoId}`
  );
};

module.exports = {
  handleTextMessage,
  handlePhoto
};
