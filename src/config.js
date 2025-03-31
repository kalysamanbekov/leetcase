require('dotenv').config();

module.exports = {
  // Токен Telegram бота
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  
  // OpenAI API ключ
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Режим работы приложения
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Настройки бота
  botConfig: {
    polling: true, // Использовать long polling вместо webhook
  },
  
  // Настройки OpenAI
  openaiConfig: {
    model: 'gpt-4o',
    maxTokens: 500,
    temperature: 0.7
  }
};
