const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const commandHandlers = require('./handlers/commandHandlers');
const messageHandlers = require('./handlers/messageHandlers');
const aiHandler = require('./handlers/aiHandler');
const caseHandlers = require('./handlers/caseHandlers');
const subscriptionHandlers = require('./handlers/subscriptionHandlers_new');
const adminHandlers = require('./handlers/adminHandlers');
const menuHandlers = require('./handlers/menuHandlers');
const assistantsService = require('./services/assistantsService');
const subscriptionService = require('./services/subscriptionService');
const whisperService = require('./services/whisperService');
const { generateResponse } = require('./services/openaiService');

// Импортируем HTTP-сервер для Render
require('./server');

// Проверка наличия токена
if (!config.telegramToken) {
  console.error('Ошибка: Не указан токен Telegram бота. Добавьте TELEGRAM_BOT_TOKEN в файл .env');
  process.exit(1);
}

// Создание экземпляра бота
const bot = new TelegramBot(config.telegramToken, config.botConfig);

console.log('Бот запущен...');

// Обработчики команд
bot.onText(/\/start/, (msg) => commandHandlers.handleStart(bot, msg));
bot.onText(/\/help/, (msg) => commandHandlers.handleHelp(bot, msg));
bot.onText(/\/info/, (msg) => commandHandlers.handleInfo(bot, msg));
bot.onText(/\/reset/, (msg) => commandHandlers.handleReset(bot, msg));

// Обработчик команды /ai с параметрами
bot.onText(/\/ai (.+)/, (msg, match) => {
  const userId = msg.from.id.toString();
  
  // Проверяем, может ли пользователь отправить запрос
  if (subscriptionService.canSendRequest(userId)) {
    // Регистрируем запрос
    subscriptionService.registerRequest(userId);
    aiHandler.handleAiRequest(bot, msg, match);
  } else {
    // Отправляем сообщение о необходимости подписки
    subscriptionHandlers.sendSubscriptionRequiredMessage(bot, msg.chat.id);
  }
});

// Обработчик команды /ai без параметров
bot.onText(/\/ai$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Пожалуйста, укажите ваш вопрос после команды /ai. Например: /ai Расскажи о погоде в Бишкеке'
  );
});

// Обработчик команды /case для выбора категории кейса
bot.onText(/\/case/, (msg) => {
  const userId = msg.from.id.toString();
  
  // Проверяем, может ли пользователь отправить запрос
  if (subscriptionService.canSendRequest(userId)) {
    // Регистрируем запрос
    subscriptionService.registerRequest(userId);
    caseHandlers.handleCaseCommand(bot, msg);
  } else {
    // Отправляем сообщение о необходимости подписки
    subscriptionHandlers.sendSubscriptionRequiredMessage(bot, msg.chat.id);
  }
});

// Обработчик команды /end для завершения текущей сессии
bot.onText(/\/end/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  if (assistantsService.hasActiveSession(userId)) {
    assistantsService.endSession(userId);
    bot.sendMessage(chatId, 'Ваша сессия с ассистентом завершена. Используйте /case, чтобы начать новую.');
  } else {
    bot.sendMessage(chatId, 'У вас нет активной сессии с ассистентом.');
  }
});

// Обработчики команд для управления подпиской
bot.onText(/\/subscribe/, (msg) => subscriptionHandlers.handleSubscribe(bot, msg));
bot.onText(/\/status/, (msg) => subscriptionHandlers.handleStatus(bot, msg));

// Обработчики административных команд
bot.onText(/\/admin/, (msg) => adminHandlers.handleAdminCommand(bot, msg));
bot.onText(/\/reset_counter (.+)/, (msg, match) => adminHandlers.handleResetCounterCommand(bot, msg, match));
bot.onText(/\/add_premium (.+)/, (msg, match) => adminHandlers.handleAddPremiumCommand(bot, msg, match));

// Обработчик текстовых сообщений (кроме команд)
bot.on('text', async (msg) => {
  // Проверяем, что сообщение не является командой
  if (!msg.text.startsWith('/')) {
    // Проверяем, является ли сообщение нажатием на кнопку меню
    const menuButtons = [
      '❓ Помощь',
      '👤 Мой профиль'
    ];
    
    if (menuButtons.includes(msg.text)) {
      // Если это нажатие на кнопку меню, обрабатываем его
      menuHandlers.handleMenuSelection(bot, msg);
      return;
    }
    
    const userId = msg.from.id.toString();
    
    // Проверяем, есть ли активная сессия с ассистентом
    if (assistantsService.hasActiveSession(userId)) {
      // Если есть активная сессия, проверяем подписку
      if (subscriptionService.canSendRequest(userId)) {
        // Регистрируем запрос
        subscriptionService.registerRequest(userId);
        // Передаем сообщение обработчику кейсов
        caseHandlers.handleCaseMessage(bot, msg);
      } else {
        // Отправляем сообщение о необходимости подписки
        subscriptionHandlers.sendSubscriptionRequiredMessage(bot, msg.chat.id);
      }
    } else {
      // Проверяем, может ли пользователь отправить запрос
      if (subscriptionService.canSendRequest(userId)) {
        try {
          // Регистрируем запрос
          subscriptionService.registerRequest(userId);
          
          // Если нет активной сессии, используем обычный обработчик с OpenAI API
          bot.sendChatAction(msg.chat.id, 'typing');
          
          // Получаем ответ от OpenAI API
          const response = await generateResponse(msg.text);
          
          // Отправляем ответ пользователю
          bot.sendMessage(msg.chat.id, response);
        } catch (error) {
          console.error('Ошибка при обработке сообщения:', error);
          messageHandlers.handleTextMessage(bot, msg);
        }
      } else {
        // Отправляем сообщение о необходимости подписки
        subscriptionHandlers.sendSubscriptionRequiredMessage(bot, msg.chat.id);
      }
    }
  }
});

// Обработчик фото
bot.on('photo', (msg) => messageHandlers.handlePhoto(bot, msg));

// Обработчик голосовых сообщений
bot.on('voice', async (msg) => {
  const userId = msg.from.id.toString();
  const chatId = msg.chat.id;
  
  try {
    // Проверяем, может ли пользователь отправить запрос
    if (subscriptionService.canSendRequest(userId)) {
      // Регистрируем запрос
      subscriptionService.registerRequest(userId);
      
      // Обрабатываем голосовое сообщение
      const transcribedText = await whisperService.handleVoiceMessage(bot, msg);
      
      if (transcribedText) {
        // Отправляем распознанный текст пользователю
        await bot.sendMessage(chatId, `Ваш запрос: ${transcribedText}`);
        
        // Проверяем, есть ли активная сессия с ассистентом
        if (assistantsService.hasActiveSession(userId)) {
          // Отправляем запрос в активную сессию
          const response = await assistantsService.sendMessage(userId, transcribedText);
          await bot.sendMessage(chatId, response);
        } else {
          // Отправляем запрос в OpenAI API
          const response = await generateResponse(transcribedText);
          await bot.sendMessage(chatId, response);
        }
      }
    } else {
      // Отправляем сообщение о необходимости подписки
      subscriptionHandlers.sendSubscriptionRequiredMessage(bot, chatId);
    }
  } catch (error) {
    console.error('Ошибка при обработке голосового сообщения:', error);
    await bot.sendMessage(chatId, 'Произошла ошибка при обработке голосового сообщения. Пожалуйста, попробуйте еще раз или введите запрос текстом.');
  }
});

// Обработчик ошибок
bot.on('polling_error', (error) => {
  console.error(`Ошибка polling: ${error.message}`);
});

// Обработчик необработанных сообщений
bot.on('message', (msg) => {
  // Обрабатываем только те типы сообщений, которые не обрабатываются выше
  // Не отправляем сообщение об ошибке для голосовых сообщений
  if (!msg.text && !msg.photo && !msg.voice) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Я пока не умею обрабатывать этот тип сообщений.');
  }
});

// Обработчик callback запросов (для кнопок)
bot.on('callback_query', (callbackQuery) => {
  const data = callbackQuery.data;
  
  if (data.startsWith('category_')) {
    // Обработка выбора категории кейса
    caseHandlers.handleCategorySelection(bot, callbackQuery);
  } else if (data === 'end_session') {
    // Обработка завершения сессии
    caseHandlers.handleEndSession(bot, callbackQuery);
  } else if (data === 'continue_session') {
    // Обработка продолжения сессии
    caseHandlers.handleContinueSession(bot, callbackQuery);
  } else if (data === 'payment_subscription') {
    // Обработка запроса на оплату подписки
    subscriptionHandlers.handlePaymentCallback(bot, callbackQuery);
  } else if (data === 'simulate_payment') {
    // Обработка имитации оплаты
    subscriptionHandlers.handleSimulatePayment(bot, callbackQuery);
  } else if (data === 'admin_reset_counter') {
    // Обработка сброса счетчика запросов
    adminHandlers.handleResetCounter(bot, callbackQuery);
  } else if (data === 'admin_add_premium') {
    // Обработка добавления премиум-подписки
    adminHandlers.handleAddPremium(bot, callbackQuery);
  } else if (data === 'premium_benefits') {
    // Обработка запроса на просмотр преимуществ премиум-подписки
    const channelSubscriptionService = require('./services/channelSubscriptionService');
    channelSubscriptionService.sendPremiumBenefits(bot, callbackQuery);
  } else if (data === 'next') {
    // Обработка нажатия кнопки "Дальше"
    caseHandlers.handleCategorySelection(bot, callbackQuery);
  }
});

// Периодическая проверка срока действия подписок (каждый час)
setInterval(() => {
  subscriptionService.checkSubscriptionExpiry();
  console.log('Проверка срока действия подписок выполнена');
}, 60 * 60 * 1000);

// Периодическая проверка членства пользователей в группе (каждый час)
setInterval(async () => {
  try {
    const groupSubscriptionService = require('./services/channelSubscriptionService');
    console.log('Проверка членства пользователей в группе...');
    
    const results = await groupSubscriptionService.checkAllUsersGroupMembership(bot);
    console.log(`Проверено пользователей: ${results.checked}`);
    
    // Уведомляем пользователей, которые вышли из группы
    for (const userId of results.leftGroup) {
      await groupSubscriptionService.notifyPremiumDeactivation(bot, userId);
    }
    
    if (results.leftGroup.length > 0) {
      console.log(`Деактивировано премиум-подписок: ${results.leftGroup.length}`);
    }
  } catch (error) {
    console.error('Ошибка при проверке членства в группе:', error);
  }
}, 60 * 60 * 1000); // Проверка каждый час

// Обработчик завершения процесса
process.on('SIGINT', () => {
  console.log('Бот останавливается...');
  bot.stopPolling();
  process.exit(0);
});
