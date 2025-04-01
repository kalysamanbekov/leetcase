/**
 * Индексный файл для инициализации базы данных
 */

// Импортируем модуль подключения к MongoDB
const { connectToDatabase } = require('./mongoose');

/**
 * Инициализирует подключение к базе данных
 * @returns {Promise} Промис, который разрешается после установки соединения
 */
async function initDatabase() {
  try {
    // Устанавливаем соединение с MongoDB
    await connectToDatabase();
    console.log('База данных инициализирована успешно');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    throw error;
  }
}

module.exports = {
  initDatabase
};
