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
  
  // Сначала проверяем, содержит ли текст уже HTML-теги
  // Если да, то возвращаем его как есть, чтобы избежать двойного форматирования
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  
  // Базовое структурирование - заменяем маркеры списков на символ •
  let formattedText = text
    .replace(/^- (.+)$/gm, '• $1') // Заменяем дефисы на маркеры списка
    .replace(/^(\d+)\. (.+)$/gm, '$1. $2'); // Сохраняем нумерованные списки
  
  // Форматирование заголовков с эмодзи
  formattedText = formattedText
    // Заголовки с определением подходящего эмодзи по контексту
    .replace(/^# (.+?)(?:\s|$)/gm, (match, title) => {
      let emoji = '📝'; // Эмодзи по умолчанию для заголовков
      
      // Выбираем эмодзи в зависимости от содержания заголовка
      if (/анализ|метрик|данны[хе]|статисти[кч]/i.test(title)) emoji = '📊';
      else if (/стратеги|план|развити[ея]|цел[иь]/i.test(title)) emoji = '🧠';
      else if (/soft\s*skills|коммуникац|общени|команд/i.test(title)) emoji = '🤝';
      else if (/product\s*sense|пользовател|клиент|потребност/i.test(title)) emoji = '🔍';
      else if (/брейнтизер|головоломк|загадк|задач/i.test(title)) emoji = '🧩';
      else if (/пример|образец|демонстрац/i.test(title)) emoji = '📋';
      else if (/решени|ответ|вывод/i.test(title)) emoji = '💡';
      else if (/важн|вниман|предупрежден/i.test(title)) emoji = '⚠️';
      else if (/код|программ|разработк/i.test(title)) emoji = '💻';
      
      return `<b>${emoji} ${title}</b>`;
    })
    // Подзаголовки
    .replace(/^## (.+?)(?:\s|$)/gm, (match, title) => {
      let emoji = '📌'; // Эмодзи по умолчанию для подзаголовков
      return `<b>${emoji} ${title}</b>`;
    });
  
  // Форматирование кода и других элементов
  formattedText = formattedText
    // Блоки кода - Telegram не поддерживает атрибут language в теге pre
    .replace(/```([a-z]*)\n([\s\S]+?)\n```/g, '<pre>$2</pre>')
    // Инлайн-код
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Жирный текст
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    // Курсив
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    // Ссылки в формате [текст](ссылка)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Цитаты - Telegram не поддерживает тег blockquote, заменяем на курсив
    .replace(/^> (.+)$/gm, '<i>$1</i>');
  
  // Экранируем специальные символы HTML, которые могут вызвать проблемы
  // Но только те, которые не являются частью HTML-тегов
  formattedText = formattedText
    .replace(/&(?!amp;|lt;|gt;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Восстанавливаем HTML-теги
    .replace(/&lt;(\/?)(b|i|code|pre|a)(\s+[^&]*?)?&gt;/gi, '<$1$2$3>');
  
  return formattedText;
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
