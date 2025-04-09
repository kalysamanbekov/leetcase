/**
 * Утилиты для форматирования текста в Telegram
 */

/**
 * Форматирует текст от GPT для отображения в Telegram с HTML-разметкой
 * @param {string} text - Исходный текст от GPT
 * @returns {string} - Отформатированный текст с HTML-тегами
 */
function formatGptTextForTelegram(text) {
  if (!text) return '';
  
  // Супер простой подход - создаём жесткий тест, чтобы определить, работает ли HTML вообще
  // Это минимальная версия для отладки
  
  // 1. Очищаем текст от существующих HTML-тегов
  let cleanText = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // 2. Добавляем простейшие маркеры в начало и конец текста - для проверки работы HTML
  return `<b>НАЧАЛО СООБЩЕНИЯ</b>\n\n${cleanText}\n\n<b>КОНЕЦ СООБЩЕНИЯ</b>`;
}

/**
 * Добавляет структуру и эмодзи к тексту
 * @param {string} text - Исходный текст
 * @returns {string} - Текст с добавленными эмодзи и структурой
 */
function addStructureAndEmoji(text) {
  if (!text) return '';
  
  // Добавляем эмодзи к заголовкам и ключевым фразам
  const withEmoji = text
    .replace(/^Аналитика/gm, '📊 Аналитика')
    .replace(/^Стратегия/gm, '🧠 Стратегия')
    .replace(/^Soft Skills/gm, '🤝 Soft Skills')
    .replace(/^Product Sense/gm, '🔍 Product Sense')
    .replace(/^Брейнтизеры/gm, '🧩 Брейнтизеры')
    .replace(/Задача:/g, '📝 Задача:')
    .replace(/Решение:/g, '💡 Решение:')
    .replace(/Подсказка:/g, '💭 Подсказка:')
    .replace(/Пример:/g, '📋 Пример:')
    .replace(/Важно:/g, '⚠️ Важно:')
    .replace(/Совет:/g, '💬 Совет:');
  
  // Добавляем разделители между секциями
  return withEmoji.replace(/\n\n(?=[📊🧠🤝🔍🧩])/g, '\n\n————————————\n\n');
}

/**
 * Заполняет шаблон кейса данными
 * @param {Object} data - Данные для заполнения шаблона
 * @returns {string} - Заполненный шаблон
 */
function fillCaseTemplate(data) {
  const template = `
<b>${data.category || 'Кейс'}</b>

📝 <b>Задача:</b>
${data.taskDescription || ''}

⏱ <b>Время на решение:</b> ${data.timeLimit || '20'} минут

💭 <b>Подсказка:</b>
${data.hint || ''}
`;

  return template;
}

/**
 * Форматирует приветственное сообщение
 * @returns {string} - Отформатированное приветственное сообщение
 */
function formatWelcomeMessage() {
  return `
👋 <b>Привет! Я LeetCase</b>
<i>Твой помощник в подготовке к продуктовым интервью</i>

В топовых продуктовых компаниях проверяют 5 ключевых областей:

📊 <b>Аналитика</b> — работа с данными, метрики
🧠 <b>Стратегия</b> — развитие продукта, решения
🤝 <b>Soft Skills</b> — коммуникация, лидерство
🔍 <b>Product Sense</b> — понимание пользователей
🧩 <b>Брейнтизеры</b> — логические головоломки

————————————
Нажми кнопку "Дальше", чтобы начать!
`;
}

/**
 * Форматирует сообщение о подписке
 * @param {number} price - Стоимость подписки
 * @returns {string} - Отформатированное сообщение о подписке
 */
function formatSubscriptionMessage(price) {
  return `
🏆 <b>Премиум-подписка</b>

📦 <b>Что входит:</b>
• Неограниченное количество кейсов
• Детальный разбор решений
• Эксклюзивные материалы
• Доступ ко всем категориям

💰 <b>Стоимость:</b> ${price} ₽/месяц

⭐️ Инвестируй в свое будущее!
`;
}

/**
 * Форматирует сообщение о достижении лимита
 * @param {number} price - Стоимость подписки
 * @returns {string} - Отформатированное сообщение о лимите
 */
function formatLimitReachedMessage(price) {
  return `
🏁 <b>Достигнут лимит бесплатных кейсов</b>

Ты уже прошел все бесплатные кейсы и показал отличный потенциал!

🔓 <b>Unlim Mode:</b> Полный доступ к базе кейсов

📦 <b>Что входит в подписку:</b>
• Неограниченное количество кейсов
• Детальный разбор твоих решений
• Эксклюзивные материалы для PM
• Доступ ко всем категориям и уровням сложности

💰 <b>Цена твоего развития:</b>
• Месяц: ${price} ₽
`;
}

module.exports = {
  formatGptTextForTelegram,
  addStructureAndEmoji,
  fillCaseTemplate,
  formatWelcomeMessage,
  formatSubscriptionMessage,
  formatLimitReachedMessage
};
