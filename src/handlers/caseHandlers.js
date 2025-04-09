const ASSISTANTS = require('../config/assistants');
const assistantsService = require('../services/assistantsService');
const subscriptionService = require('../services/subscriptionService');
const channelSubscriptionService = require('../services/channelSubscriptionService');

/**
 * Отправляет пользователю список доступных категорий кейсов
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
function handleCaseCommand(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  // Проверяем, есть ли уже активная сессия
  if (assistantsService.hasActiveSession(userId)) {
    // Предлагаем завершить текущую сессию
    const session = assistantsService.getSessionInfo(userId);
    
    bot.sendMessage(
      chatId,
      `У вас уже есть активная сессия по категории "${session.category}". ` +
      `Хотите завершить её и начать новую?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Завершить и выбрать новую', callback_data: 'end_session' },
              { text: 'Продолжить текущую', callback_data: 'continue_session' }
            ]
          ]
        }
      }
    );
    return;
  }
  
  // Отправляем список категорий
  sendCategoriesList(bot, chatId);
}

/**
 * Отправляет список категорий кейсов
 * @param {Object} bot - Экземпляр бота
 * @param {number} chatId - ID чата
 */
function sendCategoriesList(bot, chatId) {
  // Создаем кнопки для всех категорий
  const keyboard = [
    [{ text: '📊 Аналитика', callback_data: 'category_📊 Аналитика' }],
    [{ text: '🌐 Стратегия', callback_data: 'category_🌐 Стратегия' }],
    [{ text: '🤝 Soft Skills', callback_data: 'category_🤝 Soft Skills' }],
    [{ text: '🚀 Product Sense', callback_data: 'category_🚀 Product Sense' }],
    [{ text: '🧩 Брейнтизеры', callback_data: 'category_🧩 Брейнтизеры' }]
  ];
  
  bot.sendMessage(
    chatId,
    'Выберите категорию кейса для подготовки к интервью:',
    {
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
  );
}

/**
 * Обрабатывает выбор категории кейса
 * @param {Object} bot - Экземпляр бота
 * @param {Object} callbackQuery - Объект callback query
 */
async function handleCategorySelection(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id.toString();
  const messageId = callbackQuery.message.message_id;
  
  // Получаем выбранную категорию из callback_data
  const category = callbackQuery.data.replace('category_', '');
  
  // Получаем ID ассистента для выбранной категории
  const assistantId = ASSISTANTS.assistantIds[category];
  
  if (!assistantId) {
    bot.answerCallbackQuery(callbackQuery.id, { text: 'Категория не найдена' });
    return;
  }
  
  // Отвечаем на callback query, чтобы убрать индикатор загрузки
  bot.answerCallbackQuery(callbackQuery.id);
  
  // Обновляем сообщение, чтобы показать, что категория выбрана
  await bot.editMessageText(
    `Вы выбрали категорию: ${category}\n\nПодключаюсь к ассистенту...`,
    {
      chat_id: chatId,
      message_id: messageId
    }
  );
  
  try {
    // Создаем новую сессию с выбранным ассистентом
    const session = await assistantsService.createSession(userId, assistantId, category);
    
    // Отправляем начальное сообщение от ассистента
    bot.sendMessage(
      chatId,
      session.initialResponse || 'Готово! Теперь вы можете начать кейс-интервью. Напишите что-нибудь, чтобы продолжить.'
    );
  } catch (error) {
    console.error('Ошибка при создании сессии:', error);
    
    bot.sendMessage(
      chatId,
      'Произошла ошибка при подключении к ассистенту. Пожалуйста, попробуйте еще раз позже.'
    );
  }
}

/**
 * Обрабатывает завершение текущей сессии
 * @param {Object} bot - Экземпляр бота
 * @param {Object} callbackQuery - Объект callback query
 */
function handleEndSession(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id.toString();
  const messageId = callbackQuery.message.message_id;
  
  // Завершаем текущую сессию
  assistantsService.endSession(userId);
  
  // Отвечаем на callback query
  bot.answerCallbackQuery(callbackQuery.id, { text: 'Сессия завершена' });
  
  // Обновляем сообщение
  bot.editMessageText(
    'Предыдущая сессия завершена. Выберите новую категорию кейса:',
    {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: ASSISTANTS.categories.map(category => [
          { text: category, callback_data: `category_${category}` }
        ])
      }
    }
  );
}

/**
 * Обрабатывает продолжение текущей сессии
 * @param {Object} bot - Экземпляр бота
 * @param {Object} callbackQuery - Объект callback query
 */
function handleContinueSession(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  
  // Отвечаем на callback query
  bot.answerCallbackQuery(callbackQuery.id, { text: 'Продолжаем текущую сессию' });
  
  // Удаляем сообщение с кнопками
  bot.deleteMessage(chatId, callbackQuery.message.message_id);
  
  // Отправляем сообщение о продолжении
  bot.sendMessage(
    chatId,
    'Продолжаем текущую сессию. Вы можете продолжить общение с ассистентом.'
  );
}

/**
 * Обрабатывает текстовые сообщения пользователя в рамках сессии
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
async function handleCaseMessage(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const text = msg.text;
  
  // Проверяем, есть ли активная сессия
  if (!assistantsService.hasActiveSession(userId)) {
    bot.sendMessage(
      chatId,
      'У вас нет активной сессии. Используйте команду /case, чтобы выбрать категорию кейса.'
    );
    return;
  }
  
  try {
    // Проверяем, имеет ли пользователь премиум-доступ
    const hasPremium = await channelSubscriptionService.hasPremiumAccess(bot, userId);
    
    // Если у пользователя нет премиум-доступа, проверяем лимит запросов
    if (!hasPremium) {
      // Проверяем, может ли пользователь отправить запрос
      if (!subscriptionService.canSendRequest(userId)) {
        // Если лимит исчерпан, отправляем сообщение о необходимости подписки
        await channelSubscriptionService.sendSubscriptionRequiredMessage(bot, chatId);
        return;
      }
      
      // Регистрируем запрос пользователя
      subscriptionService.registerRequest(userId);
      
      // Получаем информацию о подписке
      const subscriptionInfo = subscriptionService.getSubscriptionInfo(userId);
      
      // Отправляем информацию о количестве оставшихся запросов
      // Уведомление о количестве оставшихся запросов удалено
    }
    
    // Отправляем индикатор "печатает..."
    bot.sendChatAction(chatId, 'typing');
    
    // Отправляем сообщение ассистенту и получаем ответ
    const response = await assistantsService.sendMessage(userId, text);
    
    // Импортируем утилиты форматирования если они еще не импортированы
    const formatUtils = require('../utils/formatUtils');
    
    // Форматируем ответ с помощью наших утилит
    const formattedResponse = formatUtils.formatGptTextForTelegram(response);
    
    // Отладочное логирование - выводим сообщение перед отправкой
    console.log('=== DEBUG: Отправляемое сообщение ===');
    console.log(formattedResponse);
    console.log('=== DEBUG: Конец сообщения ===');
    
    // Отправляем ответ пользователю с HTML-разметкой
    bot.sendMessage(chatId, formattedResponse, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } catch (error) {
    console.error('Ошибка при обработке сообщения:', error);
    
    bot.sendMessage(
      chatId,
      'Произошла ошибка при обработке вашего сообщения. Пожалуйста, попробуйте еще раз позже.'
    );
  }
}

module.exports = {
  handleCaseCommand,
  handleCategorySelection,
  handleEndSession,
  handleContinueSession,
  handleCaseMessage
};
