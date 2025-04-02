/**
 * Сервис для управления подписками пользователей
 */

// Временное хранилище данных о статусе пользователей в группе
// В реальном приложении следует использовать базу данных
const userGroupStatus = {};

// ID группы для тестирования (не используется в текущей версии)
const PREMIUM_GROUP_ID = '-4640308072';

/**
 * Декодирует Unicode-последовательности в читаемый текст
 * @param {string} text - Текст с возможными Unicode-последовательностями
 * @returns {string} - Декодированный текст
 */
function decodeUnicodeText(text) {
  if (typeof text !== 'string') {
    return text;
  }
  
  try {
    // Проверяем наличие Unicode-последовательностей (u04XX для кириллицы и другие)
    if (!/u[0-9a-fA-F]{4}/.test(text)) {
      return text;
    }
    
    // Заменяем все Unicode-последовательности на соответствующие символы
    return text.replace(/u([0-9a-fA-F]{4})/g, (match, codePoint) => {
      try {
        return String.fromCharCode(parseInt(codePoint, 16));
      } catch (e) {
        console.error(`Ошибка при декодировании ${match}:`, e);
        return match; // Возвращаем исходную последовательность в случае ошибки
      }
    });
  } catch (error) {
    console.error('Ошибка при декодировании Unicode-последовательностей:', error);
    return text; // В случае ошибки возвращаем исходный текст
  }
}

/**
 * Отправляет сообщение пользователю с правильной кодировкой
 * @param {Object} bot - Экземпляр бота
 * @param {number} chatId - ID чата
 * @param {string} text - Текст сообщения
 * @param {Object} options - Дополнительные опции для сообщения
 */
async function sendMessage(bot, chatId, text, options = {}) {
  try {
    // Декодируем Unicode-последовательности в тексте
    const decodedText = decodeUnicodeText(text);
    
    // Если есть inline_keyboard в опциях, декодируем текст кнопок
    if (options.reply_markup && options.reply_markup.inline_keyboard) {
      options.reply_markup.inline_keyboard = options.reply_markup.inline_keyboard.map(row => {
        return row.map(button => {
          if (button.text) {
            button.text = decodeUnicodeText(button.text);
          }
          return button;
        });
      });
    }
    
    // Отправляем сообщение с декодированным текстом
    await bot.sendMessage(chatId, decodedText, options);
    
    // Для отладки
    if (text !== decodedText) {
      console.log('Текст был декодирован из Unicode-последовательностей');
    }
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    
    // Пытаемся отправить исходный текст в случае ошибки
    try {
      await bot.sendMessage(chatId, text, options);
    } catch (secondError) {
      console.error('Не удалось отправить исходный текст:', secondError);
    }
  }
}

/**
 * Проверяет, является ли пользователь участником премиум-группы
 * @param {Object} bot - Экземпляр бота
 * @param {string} userId - ID пользователя
 * @returns {Promise<boolean>} - true, если пользователь является участником группы
 */
async function checkGroupMembership(bot, userId) {
  try {
    const chatMember = await bot.getChatMember(PREMIUM_GROUP_ID, userId);
    
    // Проверяем статус пользователя в группе
    // Возможные статусы: 'creator', 'administrator', 'member', 'restricted', 'left', 'kicked'
    const isGroupMember = ['creator', 'administrator', 'member', 'restricted'].includes(chatMember.status);
    
    // Обновляем статус в хранилище
    userGroupStatus[userId] = {
      isMember: isGroupMember,
      lastChecked: new Date()
    };
    
    return isGroupMember;
  } catch (error) {
    console.error('Ошибка при проверке членства в группе:', error);
    
    // Если произошла ошибка, возвращаем последний известный статус
    // или false, если статус неизвестен
    return userGroupStatus[userId]?.isMember || false;
  }
}

/**
 * Проверяет, имеет ли пользователь премиум-доступ
 * @param {Object} bot - Экземпляр бота
 * @param {string} userId - ID пользователя
 * @returns {Promise<boolean>} - true, если пользователь имеет премиум-доступ
 */
async function hasPremiumAccess(bot, userId) {
  // Если статус не проверялся в течение последних 30 минут, проверяем заново
  const lastChecked = userGroupStatus[userId]?.lastChecked;
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  if (!lastChecked || lastChecked < thirtyMinutesAgo) {
    return await checkGroupMembership(bot, userId);
  }
  
  // Возвращаем сохраненный статус
  return userGroupStatus[userId]?.isMember || false;
}

/**
 * Проверяет членство всех пользователей в группе
 * @param {Object} bot - Экземпляр бота
 * @returns {Promise<Object>} - Объект с результатами проверки
 */
async function checkAllUsersGroupMembership(bot) {
  const results = {
    checked: 0,
    leftGroup: []
  };
  
  for (const userId in userGroupStatus) {
    const previousStatus = userGroupStatus[userId].isMember;
    
    // Проверяем текущий статус
    const currentStatus = await checkGroupMembership(bot, userId);
    results.checked++;
    
    // Если пользователь вышел из группы
    if (previousStatus && !currentStatus) {
      results.leftGroup.push(userId);
    }
  }
  
  return results;
}

/**
 * Отправляет уведомление пользователю о деактивации премиум-функций
 * @param {Object} bot - Экземпляр бота
 * @param {string} userId - ID пользователя
 */
async function notifyPremiumDeactivation(bot, userId) {
  try {
    await sendMessage(
      bot,
      userId,
      `⚠️ Ваш премиум-доступ деактивирован, так как ваша подписка истекла.

Чтобы восстановить доступ к премиум-функциям, пожалуйста, оформите подписку.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Оформить подписку', url: 'https://t.me/tribute/app?startapp=srNj' }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('Ошибка при отправке уведомления о деактивации:', error);
  }
}

/**
 * Отправляет сообщение о необходимости подписки
 * @param {Object} bot - Экземпляр бота
 * @param {number} chatId - ID чата
 */
async function sendSubscriptionRequiredMessage(bot, chatId) {
  await sendMessage(
    bot,
    chatId,
    `⭐ Для доступа к этой функции требуется премиум-подписка.

Стоимость подписки: 1990 рублей в месяц через сервис Трибут.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Оформить подписку', url: 'https://t.me/tribute/app?startapp=srNj' }],
          [{ text: 'Подробнее о преимуществах', callback_data: 'premium_benefits' }]
        ]
      }
    }
  );
}

/**
 * Отправляет информацию о преимуществах премиум-подписки
 * @param {Object} bot - Экземпляр бота
 * @param {Object} callbackQuery - Объект callback query
 */
async function sendPremiumBenefits(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  
  // Отвечаем на callback query
  await bot.answerCallbackQuery(callbackQuery.id);
  
  await sendMessage(
    bot,
    chatId,
    `✨ Преимущества премиум-подписки:

✅ Неограниченное количество запросов к боту
✅ Доступ ко всем категориям кейсов для подготовки к интервью
✅ Приоритетная обработка запросов
✅ Доступ к эксклюзивным материалам и консультациям
✅ Персональные консультации от экспертов

Стоимость: 1990 рублей в месяц.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Оформить подписку', url: 'https://t.me/tribute/app?startapp=srNj' }]
        ]
      }
    }
  );
}

module.exports = {
  checkGroupMembership,
  hasPremiumAccess,
  checkAllUsersGroupMembership,
  notifyPremiumDeactivation,
  sendSubscriptionRequiredMessage,
  sendPremiumBenefits,
  sendMessage,
  decodeUnicodeText,
  PREMIUM_GROUP_ID
};
