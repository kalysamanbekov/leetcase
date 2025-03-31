const { generateResponse } = require('../services/openaiService');

/**
 * Обработчик для запросов к OpenAI API
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 * @param {Array} match - Результат совпадения регулярного выражения
 */
async function handleAiRequest(bot, msg, match) {
  const chatId = msg.chat.id;
  const prompt = match[1]; // Получаем текст после команды /ai
  
  if (!prompt || prompt.trim() === '') {
    bot.sendMessage(
      chatId,
      'Пожалуйста, укажите ваш вопрос после команды /ai. Например: /ai Расскажи о погоде в Бишкеке'
    );
    return;
  }
  
  // Отправляем сообщение о том, что запрос обрабатывается
  const loadingMessage = await bot.sendMessage(chatId, 'Обрабатываю ваш запрос...');
  
  try {
    // Получаем ответ от OpenAI API
    const response = await generateResponse(prompt);
    
    // Отправляем ответ пользователю
    await bot.editMessageText(response, {
      chat_id: chatId,
      message_id: loadingMessage.message_id
    });
  } catch (error) {
    console.error('Ошибка при обработке AI запроса:', error);
    
    // Отправляем сообщение об ошибке
    await bot.editMessageText(
      'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз позже.',
      {
        chat_id: chatId,
        message_id: loadingMessage.message_id
      }
    );
  }
}

module.exports = {
  handleAiRequest
};
