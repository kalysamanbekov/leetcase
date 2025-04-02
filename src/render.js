/**
 * u0417u0430u043fu0443u0441u043a Telegram u0431u043eu0442u0430 u0441 u0438u0441u043fu043eu043bu044cu0437u043eu0432u0430u043du0438u0435u043c webhook u0434u043bu044f Render
 */

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const { setupWebhook, startServer } = require('./webhook');

// u041fu0440u043eu0432u0435u0440u043au0430 u043du0430u043bu0438u0447u0438u044f u0442u043eu043au0435u043du0430
if (!config.telegramToken) {
  console.error('u041eu0448u0438u0431u043au0430: u041du0435 u0443u043au0430u0437u0430u043d u0442u043eu043au0435u043d Telegram u0431u043eu0442u0430. u0414u043eu0431u0430u0432u044cu0442u0435 TELEGRAM_BOT_TOKEN u0432 u0444u0430u0439u043b .env');
  process.exit(1);
}

// u041fu0440u043eu0432u0435u0440u043au0430 u043du0430u043bu0438u0447u0438u044f URL u0434u043bu044f webhook
if (!process.env.WEBHOOK_URL) {
  console.error('u041eu0448u0438u0431u043au0430: u041du0435 u0443u043au0430u0437u0430u043d URL u0434u043bu044f webhook. u0414u043eu0431u0430u0432u044cu0442u0435 WEBHOOK_URL u0432 u043du0430u0441u0442u0440u043eu0439u043au0438 u043eu043au0440u0443u0436u0435u043du0438u044f.');
  process.exit(1);
}

// u0421u043eu0437u0434u0430u043du0438u0435 u044du043au0437u0435u043cu043fu043bu044fu0440u0430 u0431u043eu0442u0430 u0431u0435u0437 polling
const bot = new TelegramBot(config.telegramToken, { polling: false });

console.log('u0411u043eu0442 u0437u0430u043fu0443u0449u0435u043d u0432 u0440u0435u0436u0438u043cu0435 webhook...');

// u041du0430u0441u0442u0440u0430u0438u0432u0430u0435u043c webhook u0438 u0437u0430u043fu0443u0441u043au0430u0435u043c u0441u0435u0440u0432u0435u0440
setupWebhook(bot);
const server = startServer();

// u0418u043cu043fu043eu0440u0442u0438u0440u0443u0435u043c u0432u0441u0435 u043eu0431u0440u0430u0431u043eu0442u0447u0438u043au0438 u0438u0437 u043eu0441u043du043eu0432u043du043eu0433u043e u0444u0430u0439u043bu0430
const commandHandlers = require('./handlers/commandHandlers');
const messageHandlers = require('./handlers/messageHandlers');
const aiHandler = require('./handlers/aiHandler');
const caseHandlers = require('./handlers/caseHandlers');
const subscriptionHandlers = require('./handlers/subscriptionHandlers_new');
const adminHandlers = require('./handlers/adminHandlers');
const menuHandlers = require('./handlers/menuHandlers');
const whisperService = require('./services/whisperService');

// u0420u0435u0433u0438u0441u0442u0440u0438u0440u0443u0435u043c u0432u0441u0435 u043eu0431u0440u0430u0431u043eu0442u0447u0438u043au0438 u043au043eu043cu0430u043du0434
bot.onText(/\/start/, (msg) => commandHandlers.handleStart(bot, msg));
bot.onText(/\/help/, (msg) => commandHandlers.handleHelp(bot, msg));
bot.onText(/\/reset/, (msg) => commandHandlers.handleReset(bot, msg));
bot.onText(/\/case/, (msg) => caseHandlers.handleCaseCommand(bot, msg));
bot.onText(/\/menu/, (msg) => menuHandlers.handleMenu(bot, msg));
bot.onText(/\/admin/, (msg) => adminHandlers.handleAdmin(bot, msg));
bot.onText(/\/subscription/, (msg) => subscriptionHandlers.handleSubscription(bot, msg));

// u0420u0435u0433u0438u0441u0442u0440u0438u0440u0443u0435u043c u043eu0431u0440u0430u0431u043eu0442u0447u0438u043a u0434u043bu044f callback-u0437u0430u043fu0440u043eu0441u043eu0432 (u043du0430u0436u0430u0442u0438u044f u043du0430 u043au043du043eu043fu043au0438)
bot.on('callback_query', (callbackQuery) => {
  const data = callbackQuery.data;
  
  if (data.startsWith('category_')) {
    // u041eu0431u0440u0430u0431u043eu0442u043au0430 u0432u044bu0431u043eu0440u0430 u043au0430u0442u0435u0433u043eu0440u0438u0438
    caseHandlers.handleCategorySelection(bot, callbackQuery);
  } else if (data === 'next') {
    // u041eu0431u0440u0430u0431u043eu0442u043au0430 u043au043du043eu043fu043au0438 "u0414u0430u043bu044cu0448u0435"
    caseHandlers.handleCategorySelection(bot, callbackQuery);
  } else if (data === 'end_session') {
    // u041eu0431u0440u0430u0431u043eu0442u043au0430 u0437u0430u0432u0435u0440u0448u0435u043du0438u044f u0441u0435u0441u0441u0438u0438
    caseHandlers.handleEndSession(bot, callbackQuery);
  } else if (data === 'continue_session') {
    // u041eu0431u0440u0430u0431u043eu0442u043au0430 u043fu0440u043eu0434u043eu043bu0436u0435u043du0438u044f u0441u0435u0441u0441u0438u0438
    caseHandlers.handleContinueSession(bot, callbackQuery);
  }
});

// u0420u0435u0433u0438u0441u0442u0440u0438u0440u0443u0435u043c u043eu0431u0440u0430u0431u043eu0442u0447u0438u043a u0434u043bu044f u0442u0435u043au0441u0442u043eu0432u044bu0445 u0441u043eu043eu0431u0449u0435u043du0438u0439
bot.on('message', async (msg) => {
  // u041fu0440u043eu0432u0435u0440u044fu0435u043c, u0447u0442u043e u044du0442u043e u043du0435 u043au043eu043cu0430u043du0434u0430 (u043au043eu043cu0430u043du0434u044b u043eu0431u0440u0430u0431u0430u0442u044bu0432u0430u044eu0442u0441u044f u0432u044bu0448u0435)
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  
  // u041eu0431u0440u0430u0431u043eu0442u043au0430 u0433u043eu043bu043eu0441u043eu0432u044bu0445 u0441u043eu043eu0431u0449u0435u043du0438u0439
  if (msg.voice) {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      
      // u041eu0442u043fu0440u0430u0432u043bu044fu0435u043c u0441u043eu043eu0431u0449u0435u043du0438u0435 u043e u043du0430u0447u0430u043bu0435 u043eu0431u0440u0430u0431u043eu0442u043au0438
      const processingMessage = await bot.sendMessage(chatId, 'u041eu0431u0440u0430u0431u0430u0442u044bu0432u0430u044e u0432u0430u0448u0435 u0433u043eu043bu043eu0441u043eu0432u043eu0435 u0441u043eu043eu0431u0449u0435u043du0438u0435...');
      
      // u0420u0430u0441u043fu043eu0437u043du0430u0435u043c u0433u043eu043bu043eu0441u043eu0432u043eu0435 u0441u043eu043eu0431u0449u0435u043du0438u0435
      const recognizedText = await whisperService.handleVoiceMessage(bot, msg);
      
      // u0423u0434u0430u043bu044fu0435u043c u0441u043eu043eu0431u0449u0435u043du0438u0435 u043e u043eu0431u0440u0430u0431u043eu0442u043au0435
      await bot.deleteMessage(chatId, processingMessage.message_id);
      
      // u041eu0442u043fu0440u0430u0432u043bu044fu0435u043c u0440u0430u0441u043fu043eu0437u043du0430u043du043du044bu0439 u0442u0435u043au0441u0442
      await bot.sendMessage(chatId, `u0412u044b u0441u043au0430u0437u0430u043bu0438: ${recognizedText}`);
      
      // u041eu0431u0440u0430u0431u0430u0442u044bu0432u0430u0435u043c u0442u0435u043au0441u0442 u043au0430u043a u043eu0431u044bu0447u043du043eu0435 u0441u043eu043eu0431u0449u0435u043du0438u0435
      msg.text = recognizedText;
      await caseHandlers.handleCaseMessage(bot, msg);
    } catch (error) {
      console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 u0433u043eu043bu043eu0441u043eu0432u043eu0433u043e u0441u043eu043eu0431u0449u0435u043du0438u044f:', error);
      bot.sendMessage(msg.chat.id, 'u041fu0440u043eu0438u0437u043eu0448u043bu0430 u043eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 u0433u043eu043bu043eu0441u043eu0432u043eu0433u043e u0441u043eu043eu0431u0449u0435u043du0438u044f. u041fu043eu0436u0430u043bu0443u0439u0441u0442u0430, u043fu043eu043fu0440u043eu0431u0443u0439u0442u0435 u0435u0449u0435 u0440u0430u0437 u0438u043bu0438 u043du0430u043fu0438u0448u0438u0442u0435 u0442u0435u043au0441u0442u043eu043c.');
    }
    return;
  }
  
  // u041eu0431u0440u0430u0431u043eu0442u043au0430 u0442u0435u043au0441u0442u043eu0432u044bu0445 u0441u043eu043eu0431u0449u0435u043du0438u0439 u0432 u0440u0430u043cu043au0430u0445 u043au0435u0439u0441u0430
  if (msg.text) {
    await caseHandlers.handleCaseMessage(bot, msg);
  }
});

// u041eu0431u0440u0430u0431u043eu0442u0447u0438u043a u0437u0430u0432u0435u0440u0448u0435u043du0438u044f u043fu0440u043eu0446u0435u0441u0441u0430
process.on('SIGINT', () => {
  console.log('u0411u043eu0442 u043eu0441u0442u0430u043du0430u0432u043bu0438u0432u0430u0435u0442u0441u044f...');
  server.close();
  process.exit(0);
});
