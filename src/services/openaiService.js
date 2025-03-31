const { OpenAI } = require('openai');
const config = require('../config');

// Создаем экземпляр клиента OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Отправляет запрос к OpenAI API и получает ответ
 * @param {string} prompt - Вопрос или запрос пользователя
 * @param {string} systemMessage - Системное сообщение для настройки поведения модели
 * @returns {Promise<string>} - Ответ от модели
 */
async function generateResponse(prompt, systemMessage = 'Ты помощник в Telegram боте. Отвечай кратко и по существу.') {
  try {
    // Создаем запрос к API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Используем новейшую модель
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500, // Максимальная длина ответа
      temperature: 0.7, // Уровень креативности (0-2)
    });

    // Возвращаем текст ответа
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Ошибка при запросе к OpenAI API:', error);
    return 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз позже.';
  }
}

module.exports = {
  generateResponse
};
