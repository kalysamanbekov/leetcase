/**
 * HTTP-сервер для Render с поддержкой webhook для Telegram
 */

const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

// Создаем Express приложение
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Простой маршрут для проверки работоспособности
app.get('/', (req, res) => {
  res.send('LeetCase Telegram Bot is running!');
});

// Функция для настройки webhook
const setupWebhook = (bot) => {
  // Получаем URL из переменных окружения или используем дефолтный
  const webhookUrl = process.env.WEBHOOK_URL;
  
  if (webhookUrl) {
    // Настраиваем webhook для бота
    bot.setWebHook(`${webhookUrl}/bot${config.telegramToken}`);
    
    // Создаем маршрут для получения обновлений от Telegram
    app.post(`/bot${config.telegramToken}`, (req, res) => {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    });
    
    console.log(`Webhook настроен на ${webhookUrl}/bot${config.telegramToken}`);
  } else {
    console.log('WEBHOOK_URL не указан, используется polling');
    // Если URL не указан, используем polling
    bot.setWebHook('');
  }
};

// Запускаем сервер
const server = app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = { server, setupWebhook };
