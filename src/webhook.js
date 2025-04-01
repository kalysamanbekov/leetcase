/**
 * Настройка webhook для Telegram бота на Render
 */

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

// Создаем Express приложение
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Простой маршрут для проверки работоспособности
app.get('/', (req, res) => {
  res.send('LeetCase Telegram Bot is running!');
});

/**
 * Настраивает webhook для Telegram бота
 * @param {TelegramBot} bot - Экземпляр Telegram бота
 */
const setupWebhook = (bot) => {
  if (process.env.WEBHOOK_URL) {
    const webhookUrl = process.env.WEBHOOK_URL;
    const path = `/bot${config.telegramToken}`;
    
    // Отключаем polling и настраиваем webhook
    bot.stopPolling();
    bot.setWebHook(`${webhookUrl}${path}`);
    
    // Создаем маршрут для получения обновлений от Telegram
    app.post(path, (req, res) => {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    });
    
    console.log(`Webhook настроен на ${webhookUrl}${path}`);
  } else {
    console.log('WEBHOOK_URL не указан, используется polling');
  }
};

// Запускаем сервер
const startServer = () => {
  return app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
};

module.exports = { setupWebhook, startServer };
