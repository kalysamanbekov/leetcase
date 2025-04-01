/**
 * u0417u0430u043fu0443u0441u043a Telegram u0431u043eu0442u0430 u0441 u0438u0441u043fu043eu043bu044cu0437u043eu0432u0430u043du0438u0435u043c webhook u0434u043bu044f Render
 */

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const path = require('path');
const webhookPath = path.join(__dirname, 'webhook.js');
const { setupWebhook, startServer } = require(webhookPath);

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

// Импортируем утилиты для работы с чатами
const chatUtils = require('./utils/chatUtils');

// u0420u0435u0433u0438u0441u0442u0440u0438u0440u0443u0435u043c u0432u0441u0435 u043eu0431u0440u0430u0431u043eu0442u0447u0438u043au0438 u043au043eu043cu0430u043du0434 - u043eu0442u0432u0435u0447u0430u0435u043c u0442u043eu043bu044cu043au043e u0432 u043fu0440u0438u0432u0430u0442u043du044bu0445 u0447u0430u0442u0430u0445
bot.onText(/\/start/, (msg) => {
  if (chatUtils.isPrivateChat(msg)) {
    commandHandlers.handleStart(bot, msg);
  }
});

bot.onText(/\/help/, (msg) => {
  if (chatUtils.isPrivateChat(msg)) {
    commandHandlers.handleHelp(bot, msg);
  }
});

bot.onText(/\/reset/, (msg) => {
  if (chatUtils.isPrivateChat(msg)) {
    commandHandlers.handleReset(bot, msg);
  }
});

bot.onText(/\/case/, (msg) => {
  if (chatUtils.isPrivateChat(msg)) {
    caseHandlers.handleCase(bot, msg);
  }
});

bot.onText(/\/menu/, (msg) => {
  if (chatUtils.isPrivateChat(msg)) {
    menuHandlers.handleMenu(bot, msg);
  }
});

bot.onText(/\/admin/, (msg) => {
  if (chatUtils.isPrivateChat(msg)) {
    adminHandlers.handleAdmin(bot, msg);
  }
});

bot.onText(/\/subscription/, (msg) => {
  if (chatUtils.isPrivateChat(msg)) {
    subscriptionHandlers.handleSubscription(bot, msg);
  }
});

// u041eu0431u0440u0430u0431u043eu0442u0447u0438u043a u0437u0430u0432u0435u0440u0448u0435u043du0438u044f u043fu0440u043eu0446u0435u0441u0441u0430
process.on('SIGINT', () => {
  console.log('u0411u043eu0442 u043eu0441u0442u0430u043du0430u0432u043bu0438u0432u0430u0435u0442u0441u044f...');
  server.close();
  process.exit(0);
});
