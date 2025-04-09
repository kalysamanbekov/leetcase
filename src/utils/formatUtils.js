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
  
  // Если текст уже содержит HTML-теги, экранируем их, чтобы Telegram не пытался интерпретировать
  if (/<b>|<i>|<code>|<pre>|<a\s/i.test(text)) {
    console.log('Текст уже содержит HTML-теги, экранируем их');
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  // Telegram поддерживает только теги: <b>, <i>, <code>, <pre>, <a href="...">
  
  // 1. Обрабатываем блоки кода - важно сделать это до обработки других элементов
  // удаляем указание языка, если оно есть
  let result = text.replace(/```(?:[a-z]+)?\n([\s\S]+?)\n```/g, '<pre>$1</pre>');
  
  // 2. Обрабатываем инлайн-код
  result = result.replace(/`([^`]+?)`/g, '<code>$1</code>');
  
  // 3. Заменяем маркеры списков
  result = result.replace(/^- (.+)$/gm, '• $1');
  
  // 4. Обрабатываем заголовки
  result = result.replace(/^# (.+)$/gm, '<b>📝 $1</b>');
  result = result.replace(/^## (.+)$/gm, '<b>📌 $1</b>');
  
  // 5. Обрабатываем жирный текст
  result = result.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  
  // 6. Обрабатываем курсив
  result = result.replace(/\*(.+?)\*/g, '<i>$1</i>');
  
  // 7. Обрабатываем ссылки
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // 8. Обрабатываем цитаты как курсив
  result = result.replace(/^> (.+)$/gm, '<i>$1</i>');
  
  return result;
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
