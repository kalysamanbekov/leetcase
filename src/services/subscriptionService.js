/**
 * Сервис для управления подписками пользователей
 */

// Временное хранилище данных о подписках пользователей
// В реальном приложении следует использовать базу данных
const userSubscriptions = {};

// Константы
const FREE_REQUESTS_LIMIT = 3;
const SUBSCRIPTION_PRICE = 2990;
const SUBSCRIPTION_CURRENCY = 'рублей';

/**
 * Инициализирует данные пользователя, если они еще не существуют
 * @param {string} userId - ID пользователя
 */
function initUserData(userId) {
  if (!userSubscriptions[userId]) {
    userSubscriptions[userId] = {
      requestsCount: 0,
      isPremium: false,
      subscriptionExpiry: null
    };
  }
}

/**
 * Проверяет, может ли пользователь отправить запрос
 * @param {string} userId - ID пользователя
 * @returns {boolean} - true, если пользователь может отправить запрос
 */
function canSendRequest(userId) {
  initUserData(userId);
  
  // Если у пользователя премиум-подписка, то ограничений нет
  if (userSubscriptions[userId].isPremium) {
    return true;
  }
  
  // Проверяем, не превышен ли лимит бесплатных запросов
  return userSubscriptions[userId].requestsCount < FREE_REQUESTS_LIMIT;
}

/**
 * Регистрирует запрос пользователя
 * @param {string} userId - ID пользователя
 */
function registerRequest(userId) {
  initUserData(userId);
  
  // Увеличиваем счетчик запросов только для пользователей без премиум-подписки
  if (!userSubscriptions[userId].isPremium) {
    userSubscriptions[userId].requestsCount += 1;
  }
}

/**
 * Получает информацию о подписке пользователя
 * @param {string} userId - ID пользователя
 * @returns {Object} - Информация о подписке
 */
function getSubscriptionInfo(userId) {
  initUserData(userId);
  
  const { requestsCount, isPremium, subscriptionExpiry } = userSubscriptions[userId];
  const remainingFreeRequests = Math.max(0, FREE_REQUESTS_LIMIT - requestsCount);
  
  return {
    isPremium,
    requestsCount,
    remainingFreeRequests,
    subscriptionExpiry
  };
}

/**
 * Активирует премиум-подписку для пользователя
 * @param {string} userId - ID пользователя
 * @param {number} durationDays - Продолжительность подписки в днях
 */
function activatePremium(userId, durationDays = 30) {
  initUserData(userId);
  
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationDays);
  
  userSubscriptions[userId].isPremium = true;
  userSubscriptions[userId].subscriptionExpiry = expiryDate;
}

/**
 * Деактивирует премиум-подписку пользователя
 * @param {string} userId - ID пользователя
 */
function deactivatePremium(userId) {
  initUserData(userId);
  
  userSubscriptions[userId].isPremium = false;
  userSubscriptions[userId].subscriptionExpiry = null;
}

/**
 * Проверяет срок действия подписок всех пользователей
 * и деактивирует истекшие подписки
 */
function checkSubscriptionExpiry() {
  const now = new Date();
  
  Object.keys(userSubscriptions).forEach(userId => {
    const subscription = userSubscriptions[userId];
    
    if (subscription.isPremium && subscription.subscriptionExpiry && new Date(subscription.subscriptionExpiry) < now) {
      deactivatePremium(userId);
    }
  });
}

/**
 * Сбрасывает счетчик запросов пользователя
 * @param {string} userId - ID пользователя
 */
function resetRequestsCount(userId) {
  initUserData(userId);
  userSubscriptions[userId].requestsCount = 0;
}

// Экспортируем функции
module.exports = {
  canSendRequest,
  registerRequest,
  getSubscriptionInfo,
  activatePremium,
  deactivatePremium,
  checkSubscriptionExpiry,
  resetRequestsCount,
  FREE_REQUESTS_LIMIT,
  SUBSCRIPTION_PRICE,
  SUBSCRIPTION_CURRENCY
};
