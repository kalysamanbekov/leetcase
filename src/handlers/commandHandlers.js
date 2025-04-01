/**
 * Обработчики команд бота
 */

/**
 * Обработчик команды /start
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
const handleStart = (bot, msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Друг';
  
  // Используем menuService для отображения бокового меню
  const menuService = require('../services/menuService');
  const ASSISTANTS = require('../config/assistants');
  
  // Отправляем приветственное сообщение с кнопками выбора категории кейса
  bot.sendMessage(
    chatId,
    `Добро пожаловать в LeetCase! 🚀
Сейчас начнется тренировка твоих продуктовых навыков, которая состоит из следующих блоков:

📊 Аналитика 
🌐 Стратегия
🤝 Soft Skills 
🚀 Product Sense 
🧩 Брейнтизеры 

В каждом блоке тебя ждут реальные кейсы из практики продактов. Тебе предстоит принимать решения и отвечать на вопросы, с которыми сталкиваются PM в ведущих компаниях.

🎙️ Ты можешь отправлять голосовые сообщения! Просто запиши аудио, и я распознаю твою речь.

По результатам ты получишь:

Оценку твоих продуктовых компетенций
Рекомендации по развитию навыков
Подборку материалов для подготовки к собеседованиям

Готов проверить свои силы в решении продуктовых задач? 
Покажи, на что ты способен! 💪`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📊 Аналитика', callback_data: 'category_📊 Аналитика' }],
          [{ text: '🌐 Стратегия', callback_data: 'category_🌐 Стратегия' }],
          [{ text: '🤝 Soft Skills', callback_data: 'category_🤝 Soft Skills' }],
          [{ text: '🚀 Product Sense', callback_data: 'category_🚀 Product Sense' }],
          [{ text: '🧩 Брейнтизеры', callback_data: 'category_🧩 Брейнтизеры' }]
        ]
      }
    }
  );
  
  // Отправляем боковое меню
  menuService.sendMainMenuMessage(bot, chatId, 'Выберите раздел для начала работы:');
};

/**
 * Обработчик команды /help
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
const handleHelp = (bot, msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    `Список доступных команд:

/start - Начать работу с ботом
/help - Показать это сообщение
/info - Информация о боте
/case - Выбрать категорию кейса для подготовки к интервью
/end - Завершить текущую сессию с ассистентом
/ai [вопрос] - Задать вопрос искусственному интеллекту
/subscribe - Оформить премиум-подписку
/status - Проверить статус подписки

Бесплатно вы можете отправить 3 запроса. Для неограниченного доступа оформите премиум-подписку за $29.

Также вы можете просто написать любое сообщение, и я отвечу с помощью искусственного интеллекта.

Если у вас активна сессия с ассистентом по кейсам, все ваши сообщения будут направлены этому ассистенту.`
  );
};

/**
 * Обработчик команды /info
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
const handleInfo = (bot, msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    `Этот бот был создан с помощью Node.js и библиотеки node-telegram-bot-api.

Бот использует OpenAI API (GPT-4o) для обработки запросов и генерации ответов.
Для функции подготовки к интервью используется OpenAI Assistants API.

Бесплатно доступно 3 запроса. Для неограниченного доступа оформите премиум-подписку за $29.

Версия: 1.3.0
Автор: Калы Саманбеков`
  );
};

/**
 * Обработчик команды /reset
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
const handleReset = (bot, msg) => {
  const chatId = msg.chat.id;
  
  // Отправляем сообщение о сбросе
  bot.sendMessage(
    chatId,
    `Сбрасываю настройки и обновляю категории...`
  ).then(() => {
    // Отправляем новые категории
    const caseHandlers = require('./caseHandlers');
    caseHandlers.sendCategoriesList(bot, chatId);
  });
};

module.exports = {
  handleStart,
  handleHelp,
  handleInfo,
  handleReset
};
