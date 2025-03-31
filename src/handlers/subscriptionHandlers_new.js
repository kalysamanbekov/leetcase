/**
 * Обработчики команд для управления подпиской
 */

const subscriptionService = require('../services/subscriptionService');
const channelSubscriptionService = require('../services/channelSubscriptionService');

/**
 * Обрабатывает команду /subscribe
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
async function handleSubscribe(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  try {
    // Проверяем, является ли пользователь участником премиум-канала
    const hasPremium = await channelSubscriptionService.hasPremiumAccess(bot, userId);
    
    if (hasPremium) {
      // Если пользователь уже является участником канала
      await channelSubscriptionService.sendMessage(
        bot,
        chatId,
        `✅ У вас уже есть активная премиум-подписка!

Вы можете пользоваться всеми функциями бота без ограничений.

Спасибо за поддержку нашего проекта!`
      );
    } else {
      // Отправляем информацию о подписке и кнопку для оплаты
      await channelSubscriptionService.sendSubscriptionRequiredMessage(bot, chatId);
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса подписки:', error);
    await channelSubscriptionService.sendMessage(
      bot, 
      chatId, 
      'Произошла ошибка при проверке статуса подписки. Пожалуйста, попробуйте позже.'
    );
  }
}

/**
 * Обрабатывает команду /status
 * @param {Object} bot - Экземпляр бота
 * @param {Object} msg - Объект сообщения
 */
async function handleStatus(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  try {
    // Проверяем, является ли пользователь участником премиум-канала
    const hasPremium = await channelSubscriptionService.hasPremiumAccess(bot, userId);
    
    if (hasPremium) {
      // Если пользователь является участником канала
      await channelSubscriptionService.sendMessage(
        bot,
        chatId,
        `✅ Статус вашей подписки:

✅ У вас активна премиум-подписка
✅ Вы можете отправлять неограниченное количество запросов
✅ Вы имеете доступ ко всем функциям бота

Спасибо за поддержку нашего проекта!`
      );
    } else {
      // Если пользователь не является участником канала
      // Получаем информацию о бесплатных запросах
      const subscriptionInfo = subscriptionService.getSubscriptionInfo(userId);
      
      await channelSubscriptionService.sendMessage(
        bot,
        chatId,
        `❌ Статус вашей подписки:

❌ У вас нет активной премиум-подписки
ℹ️ Использовано запросов: ${subscriptionInfo.requestsCount} из ${subscriptionService.FREE_REQUESTS_LIMIT}
ℹ️ Осталось бесплатных запросов: ${subscriptionInfo.remainingFreeRequests}

Чтобы оформить подписку, используйте команду /subscribe`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Оформить подписку', url: 'https://t.me/tribute/app?startapp=srFj' }]
            ]
          }
        }
      );
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса подписки:', error);
    await channelSubscriptionService.sendMessage(
      bot, 
      chatId, 
      'Произошла ошибка при проверке статуса подписки. Пожалуйста, попробуйте позже.'
    );
  }
}

/**
 * Обрабатывает нажатие на кнопку оплаты
 * @param {Object} bot - Экземпляр бота
 * @param {Object} callbackQuery - Объект callback query
 */
async function handlePaymentCallback(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id.toString();
  
  // Отвечаем на callback query
  await bot.answerCallbackQuery(callbackQuery.id);
  
  // Отправляем сообщение с информацией о подписке и прямой ссылкой на оплату
  await channelSubscriptionService.sendMessage(
    bot,
    chatId,
    `⭐ Премиум-подписка

Для оформления подписки необходимо оплатить $29 в месяц через сервис Трибут.

После оплаты вы получите доступ ко всем премиум-функциям бота.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Оформить подписку', url: 'https://t.me/tribute/app?startapp=srFj' }]
        ]
      }
    }
  );
}

/**
 * Обрабатывает имитацию оплаты
 * @param {Object} bot - Экземпляр бота
 * @param {Object} callbackQuery - Объект callback query
 */
async function handleSimulatePayment(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id.toString();
  
  // Отвечаем на callback query
  await bot.answerCallbackQuery(callbackQuery.id, { text: 'Оплата прошла успешно!' });
  
  // Активируем премиум-подписку
  subscriptionService.activatePremium(userId);
  
  // Для демонстрационных целей притворяемся, что пользователь вступил в канал
  // В реальной системе это будет происходить автоматически при проверке членства в канале
  
  // Отправляем сообщение об успешной активации
  await channelSubscriptionService.sendMessage(
    bot,
    chatId,
    `✅ Поздравляем! Ваша премиум-подписка активирована.

Теперь вы можете пользоваться всеми функциями бота без ограничений.

Спасибо за поддержку нашего проекта!`
  );
}

/**
 * u041eu0442u043fu0440u0430u0432u043bu044fu0435u0442 u0441u043eu043eu0431u0449u0435u043du0438u0435 u043e u043du0435u043eu0431u0445u043eu0434u0438u043cu043eu0441u0442u0438 u043eu0444u043eu0440u043cu0438u0442u044c u043fu043eu0434u043fu0438u0441u043au0443
 * @param {Object} bot - u042du043au0437u0435u043cu043fu043bu044fu0440 u0431u043eu0442u0430
 * @param {number} chatId - ID u0447u0430u0442u0430
 */
function sendSubscriptionRequiredMessage(bot, chatId) {
  // Используем channelSubscriptionService для отправки сообщения с правильной кодировкой
  channelSubscriptionService.sendMessage(
    bot,
    chatId,
    `⚠️ Вы исчерпали лимит бесплатных запросов (${subscriptionService.FREE_REQUESTS_LIMIT}).

Для продолжения работы с ботом необходимо оформить премиум-подписку.

Преимущества премиум-подписки:
✅ Неограниченное количество запросов к боту
✅ Доступ ко всем категориям кейсов
✅ Приоритетная обработка запросов

Стоимость: $${subscriptionService.SUBSCRIPTION_PRICE} в месяц`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Оформить подписку', callback_data: 'payment_subscription' }]
        ]
      }
    }
  );
}

module.exports = {
  handleSubscribe,
  handleStatus,
  handlePaymentCallback,
  handleSimulatePayment,
  sendSubscriptionRequiredMessage
};
