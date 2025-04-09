const { generateResponse } = require('../services/openaiService');
const formatUtils = require('../utils/formatUtils');

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
  const loadingMessage = await bot.sendMessage(chatId, '🔍 _Обрабатываю ваш запрос..._', { parse_mode: 'Markdown' });
  
  try {
    // Получаем ответ от OpenAI API
    const response = await generateResponse(prompt);
    
    // Форматируем ответ с помощью наших утилит
    const formattedText = formatUtils.formatGptTextForTelegram(
      formatUtils.addStructureAndEmoji(response)
    );
    
    // Отправляем ответ пользователю
    await bot.editMessageText(formattedText, {
      chat_id: chatId,
      message_id: loadingMessage.message_id,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  } catch (error) {
    console.error('Ошибка при обработке AI запроса:', error);
    
    // Отправляем сообщение об ошибке
    await bot.editMessageText(
      '⚠️ <b>Извините, произошла ошибка</b>\n\nПри обработке вашего запроса возникла ошибка. Пожалуйста, попробуйте еще раз позже.',
      {
        chat_id: chatId,
        message_id: loadingMessage.message_id,
        parse_mode: 'HTML'
      }
    );
  }
}

module.exports = {
  handleAiRequest
};
