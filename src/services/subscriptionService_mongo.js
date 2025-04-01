/**
 * u0421u0435u0440u0432u0438u0441 u0434u043bu044f u0443u043fu0440u0430u0432u043bu0435u043du0438u044f u043fu043eu0434u043fu0438u0441u043au0430u043cu0438 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu0435u0439 u0441 u0438u0441u043fu043eu043bu044cu0437u043eu0432u0430u043du0438u0435u043c MongoDB
 */

const Subscription = require('../models/Subscription');

// u041au043eu043du0441u0442u0430u043du0442u044b
const FREE_REQUESTS_LIMIT = 10;
const SUBSCRIPTION_PRICE = 2990;
const SUBSCRIPTION_CURRENCY = 'u0440u0443u0431u043bu0435u0439';

/**
 * u0418u043du0438u0446u0438u0430u043bu0438u0437u0438u0440u0443u0435u0442 u0434u0430u043du043du044bu0435 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f, u0435u0441u043bu0438 u043eu043du0438 u0435u0449u0435 u043du0435 u0441u0443u0449u0435u0441u0442u0432u0443u044eu0442
 * @param {string} userId - ID u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @returns {Promise<Object>} - u0414u0430u043du043du044bu0435 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 */
async function initUserData(userId) {
  try {
    let subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      subscription = new Subscription({
        userId,
        requestsCount: 0,
        isPremium: false,
        subscriptionExpiry: null
      });
      await subscription.save();
    }
    
    return subscription;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u0438u043du0438u0446u0438u0430u043bu0438u0437u0430u0446u0438u0438 u0434u0430u043du043du044bu0445 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f:', error);
    throw error;
  }
}

/**
 * u041fu0440u043eu0432u0435u0440u044fu0435u0442, u043cu043eu0436u0435u0442 u043bu0438 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044c u043eu0442u043fu0440u0430u0432u0438u0442u044c u0437u0430u043fu0440u043eu0441
 * @param {string} userId - ID u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @returns {Promise<boolean>} - true, u0435u0441u043bu0438 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044c u043cu043eu0436u0435u0442 u043eu0442u043fu0440u0430u0432u0438u0442u044c u0437u0430u043fu0440u043eu0441
 */
async function canSendRequest(userId) {
  try {
    const subscription = await initUserData(userId);
    
    // u0415u0441u043bu0438 u0443 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f u043fu0440u0435u043cu0438u0443u043c-u043fu043eu0434u043fu0438u0441u043au0430, u0442u043e u043eu0433u0440u0430u043du0438u0447u0435u043du0438u0439 u043du0435u0442
    if (subscription.isPremium) {
      return true;
    }
    
    // u041fu0440u043eu0432u0435u0440u044fu0435u043c, u043du0435 u043fu0440u0435u0432u044bu0448u0435u043d u043bu0438 u043bu0438u043cu0438u0442 u0431u0435u0441u043fu043bu0430u0442u043du044bu0445 u0437u0430u043fu0440u043eu0441u043eu0432
    return subscription.requestsCount < FREE_REQUESTS_LIMIT;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu0440u043eu0432u0435u0440u043au0435 u0432u043eu0437u043cu043eu0436u043du043eu0441u0442u0438 u043eu0442u043fu0440u0430u0432u043au0438 u0437u0430u043fu0440u043eu0441u0430:', error);
    // u0412 u0441u043bu0443u0447u0430u0435 u043eu0448u0438u0431u043au0438 u0440u0430u0437u0440u0435u0448u0430u0435u043c u043eu0442u043fu0440u0430u0432u043au0443 u0437u0430u043fu0440u043eu0441u0430
    return true;
  }
}

/**
 * u0420u0435u0433u0438u0441u0442u0440u0438u0440u0443u0435u0442 u0437u0430u043fu0440u043eu0441 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @param {string} userId - ID u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @returns {Promise<Object>} - u041eu0431u043du043eu0432u043bu0435u043du043du044bu0435 u0434u0430u043du043du044bu0435 u043fu043eu0434u043fu0438u0441u043au0438
 */
async function registerRequest(userId) {
  try {
    const subscription = await initUserData(userId);
    
    // u0423u0432u0435u043bu0438u0447u0438u0432u0430u0435u043c u0441u0447u0435u0442u0447u0438u043a u0437u0430u043fu0440u043eu0441u043eu0432 u0442u043eu043bu044cu043au043e u0434u043bu044f u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu0435u0439 u0431u0435u0437 u043fu0440u0435u043cu0438u0443u043c-u043fu043eu0434u043fu0438u0441u043au0438
    if (!subscription.isPremium) {
      subscription.requestsCount += 1;
      await subscription.save();
    }
    
    return subscription;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u0440u0435u0433u0438u0441u0442u0440u0430u0446u0438u0438 u0437u0430u043fu0440u043eu0441u0430:', error);
    throw error;
  }
}

/**
 * u041fu043eu043bu0443u0447u0430u0435u0442 u0438u043du0444u043eu0440u043cu0430u0446u0438u044e u043e u043fu043eu0434u043fu0438u0441u043au0435 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @param {string} userId - ID u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @returns {Promise<Object>} - u0418u043du0444u043eu0440u043cu0430u0446u0438u044f u043e u043fu043eu0434u043fu0438u0441u043au0435
 */
async function getSubscriptionInfo(userId) {
  try {
    const subscription = await initUserData(userId);
    
    const { requestsCount, isPremium, subscriptionExpiry } = subscription;
    const remainingFreeRequests = Math.max(0, FREE_REQUESTS_LIMIT - requestsCount);
    
    return {
      isPremium,
      requestsCount,
      remainingFreeRequests,
      subscriptionExpiry
    };
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu043bu0443u0447u0435u043du0438u0438 u0438u043du0444u043eu0440u043cu0430u0446u0438u0438 u043e u043fu043eu0434u043fu0438u0441u043au0435:', error);
    // u0412 u0441u043bu0443u0447u0430u0435 u043eu0448u0438u0431u043au0438 u0432u043eu0437u0432u0440u0430u0449u0430u0435u043c u0434u0430u043du043du044bu0435 u043fu043e u0443u043cu043eu043bu0447u0430u043du0438u044e
    return {
      isPremium: false,
      requestsCount: 0,
      remainingFreeRequests: FREE_REQUESTS_LIMIT,
      subscriptionExpiry: null
    };
  }
}

/**
 * u0410u043au0442u0438u0432u0438u0440u0443u0435u0442 u043fu0440u0435u043cu0438u0443u043c-u043fu043eu0434u043fu0438u0441u043au0443 u0434u043bu044f u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @param {string} userId - ID u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @param {number} durationDays - u041fu0440u043eu0434u043eu043bu0436u0438u0442u0435u043bu044cu043du043eu0441u0442u044c u043fu043eu0434u043fu0438u0441u043au0438 u0432 u0434u043du044fu0445
 * @returns {Promise<Object>} - u041eu0431u043du043eu0432u043bu0435u043du043du044bu0435 u0434u0430u043du043du044bu0435 u043fu043eu0434u043fu0438u0441u043au0438
 */
async function activatePremium(userId, durationDays = 30) {
  try {
    const subscription = await initUserData(userId);
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    
    subscription.isPremium = true;
    subscription.subscriptionExpiry = expiryDate;
    
    await subscription.save();
    return subscription;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u0430u043au0442u0438u0432u0430u0446u0438u0438 u043fu0440u0435u043cu0438u0443u043c-u043fu043eu0434u043fu0438u0441u043au0438:', error);
    throw error;
  }
}

/**
 * u0414u0435u0430u043au0442u0438u0432u0438u0440u0443u0435u0442 u043fu0440u0435u043cu0438u0443u043c-u043fu043eu0434u043fu0438u0441u043au0443 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @param {string} userId - ID u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @returns {Promise<Object>} - u041eu0431u043du043eu0432u043bu0435u043du043du044bu0435 u0434u0430u043du043du044bu0435 u043fu043eu0434u043fu0438u0441u043au0438
 */
async function deactivatePremium(userId) {
  try {
    const subscription = await initUserData(userId);
    
    subscription.isPremium = false;
    subscription.subscriptionExpiry = null;
    
    await subscription.save();
    return subscription;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u0434u0435u0430u043au0442u0438u0432u0430u0446u0438u0438 u043fu0440u0435u043cu0438u0443u043c-u043fu043eu0434u043fu0438u0441u043au0438:', error);
    throw error;
  }
}

/**
 * u041fu0440u043eu0432u0435u0440u044fu0435u0442 u0438u0441u0442u0435u0447u0435u043du0438u0435 u0441u0440u043eu043au0430 u043fu043eu0434u043fu0438u0441u043eu043a u0443 u0432u0441u0435u0445 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu0435u0439
 * @returns {Promise<void>}
 */
async function checkSubscriptionExpiry() {
  try {
    const now = new Date();
    
    // u041du0430u0445u043eu0434u0438u043c u0432u0441u0435 u043fu043eu0434u043fu0438u0441u043au0438, u0443 u043au043eu0442u043eu0440u044bu0445 u0438u0441u0442u0435u043a u0441u0440u043eu043a u0434u0435u0439u0441u0442u0432u0438u044f
    const expiredSubscriptions = await Subscription.find({
      isPremium: true,
      subscriptionExpiry: { $lt: now }
    });
    
    // u0414u0435u0430u043au0442u0438u0432u0438u0440u0443u0435u043c u0438u0441u0442u0435u043au0448u0438u0435 u043fu043eu0434u043fu0438u0441u043au0438
    for (const subscription of expiredSubscriptions) {
      subscription.isPremium = false;
      subscription.subscriptionExpiry = null;
      await subscription.save();
      console.log(`u041fu043eu0434u043fu0438u0441u043au0430 u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f ${subscription.userId} u0434u0435u0430u043au0442u0438u0432u0438u0440u043eu0432u0430u043du0430 u0438u0437-u0437u0430 u0438u0441u0442u0435u0447u0435u043du0438u044f u0441u0440u043eu043au0430`);
    }
    
    console.log(`u041fu0440u043eu0432u0435u0440u043au0430 u043fu043eu0434u043fu0438u0441u043eu043a u0437u0430u0432u0435u0440u0448u0435u043du0430. u0414u0435u0430u043au0442u0438u0432u0438u0440u043eu0432u0430u043du043e u043fu043eu0434u043fu0438u0441u043eu043a: ${expiredSubscriptions.length}`);
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu0440u043eu0432u0435u0440u043au0435 u0438u0441u0442u0435u0447u0435u043du0438u044f u0441u0440u043eu043au0430 u043fu043eu0434u043fu0438u0441u043eu043a:', error);
  }
}

module.exports = {
  FREE_REQUESTS_LIMIT,
  SUBSCRIPTION_PRICE,
  SUBSCRIPTION_CURRENCY,
  canSendRequest,
  registerRequest,
  getSubscriptionInfo,
  activatePremium,
  deactivatePremium,
  checkSubscriptionExpiry
};
