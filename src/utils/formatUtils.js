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
  
  // Простой подход - не используем регулярные выражения
  // Используем только базовые замены для Telegram HTML
  
  // Заменим все HTML-подобные теги, чтобы избежать конфликтов
  let cleanText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Добавляем заголовки и подзаголовки
  cleanText = cleanText
    .replace(/^# (.+)$/gm, '<b>📝 $1</b>')  // заголовки 1 уровня
    .replace(/^## (.+)$/gm, '<b>📌 $1</b>'); // заголовки 2 уровня

  // Добавляем маркеры текста
  const lines = cleanText.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      // Начало блока кода
      const codeBlock = [];
      i++; // Пропускаем строку с ```
      
      // Собираем все строки кода до закрывающего ```
      while (i < lines.length && !lines[i].includes('```')) {
        codeBlock.push(lines[i]);
        i++;
      }
      
      // Добавляем блок кода с тегами <pre>
      processedLines.push(`<pre>${codeBlock.join('\n')}</pre>`);
    } else if (line.trim().startsWith('- ')) {
      // Маркированный список
      processedLines.push(line.replace(/^- (.+)$/, '• $1'));
    } else if (line.trim().startsWith('> ')) {
      // Цитата
      processedLines.push(line.replace(/^> (.+)$/, '<i>$1</i>'));
    } else {
      // Обычная строка
      let processedLine = line;
      
      // Обрабатываем инлайн-код
      processedLine = processedLine.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // Жирный текст (**текст**)
      processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
      
      // Курсив (*текст*)
      processedLine = processedLine.replace(/\*([^*]+)\*/g, '<i>$1</i>');
      
      // Ссылки [текст](ссылка)
      processedLine = processedLine.replace(/\[([^\[\]]+)\]\(([^\(\)]+)\)/g, '<a href="$2">$1</a>');
      
      processedLines.push(processedLine);
    }
  }
  
  // Добавляем специальные маркеры для разделов, если нужно
  return processedLines.join('\n')
    .replace(/Задача:/g, '<b>📝 Задача:</b>')
    .replace(/Описание:/g, '<b>📝 Описание:</b>')
    .replace(/Контекст:/g, '<b>📝 Контекст:</b>')
    .replace(/Задачи:/g, '<b>📝 Задачи:</b>')
    .replace(/Данные:/g, '<b>📝 Данные:</b>')
    .replace(/Вопросы/g, '<b>📝 Вопросы</b>')
    .replace(/Кейс:/g, '<b>📊 Кейс:</b>')
    .replace(/Метрики:/g, '<b>📊 Метрики:</b>')
    .replace(/Решение:/g, '<b>💡 Решение:</b>')
    .replace(/Вывод:/g, '<b>💡 Вывод:</b>')
    .replace(/Важно:/g, '<b>⚠️ Важно:</b>')
    .replace(/Пример:/g, '<b>📋 Пример:</b>');
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
