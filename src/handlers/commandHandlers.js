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
    `👋 Привет! Я LeetCase — твой помощник в подготовке к продуктовым интервью.

В топовых продуктовых-компаниях на собеседованиях проверяют 5 ключевых областей продуктового мышления:
 
📊 Аналитика — работа с данными, расчеты, метрики
🧠 Стратегия — развитие продукта, принятие решений 
🤝 Soft Skills — коммуникация, лидерство, работа с командой
🔍 Product Sense — понимание пользователей, продуктовое мышление 
🧩 Брейнтизеры — логические головоломки и оценочные задачи`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Дальше', callback_data: 'next' }]
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
