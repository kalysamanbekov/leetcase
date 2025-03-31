const { OpenAI } = require('openai');
const config = require('../config');

// Создаем экземпляр клиента OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Хранилище активных сессий пользователей
// Формат: { userId: { threadId, assistantId, category } }
const userSessions = {};

/**
 * Создает новый тред для разговора с ассистентом
 * @returns {Promise<string>} - ID созданного треда
 */
async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Ошибка при создании треда:', error);
    throw new Error('Не удалось создать тред для разговора');
  }
}

/**
 * Создает новую сессию для пользователя с выбранным ассистентом
 * @param {string} userId - ID пользователя
 * @param {string} assistantId - ID ассистента
 * @param {string} category - Категория кейса
 * @returns {Promise<Object>} - Информация о сессии
 */
async function createSession(userId, assistantId, category) {
  try {
    // Создаем новый тред
    const threadId = await createThread();
    
    // Сохраняем сессию пользователя
    userSessions[userId] = { threadId, assistantId, category };
    
    // Добавляем начальное сообщение в тред
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: `Я хочу пройти кейс-интервью по категории "${category}". Пожалуйста, начните кейс.`
    });
    
    // Запускаем выполнение ассистента
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    
    // Ожидаем завершения выполнения
    const response = await waitForRunCompletion(threadId, run.id);
    
    return {
      threadId,
      assistantId,
      category,
      initialResponse: response
    };
  } catch (error) {
    console.error('Ошибка при создании сессии:', error);
    throw new Error('Не удалось создать сессию с ассистентом');
  }
}

/**
 * Ожидает завершения выполнения ассистента
 * @param {string} threadId - ID треда
 * @param {string} runId - ID запуска
 * @returns {Promise<string>} - Ответ ассистента
 */
async function waitForRunCompletion(threadId, runId) {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);
        
        if (run.status === 'completed') {
          // Получаем последнее сообщение ассистента
          const messages = await openai.beta.threads.messages.list(threadId, {
            order: 'desc',
            limit: 1
          });
          
          if (messages.data.length > 0 && messages.data[0].role === 'assistant') {
            let responseText = '';
            
            // Собираем текст из всех частей сообщения
            for (const contentPart of messages.data[0].content) {
              if (contentPart.type === 'text') {
                responseText += contentPart.text.value;
              }
            }
            
            resolve(responseText);
          } else {
            resolve('Ассистент не ответил.');
          }
        } else if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
          reject(new Error(`Выполнение завершилось с ошибкой: ${run.status}`));
        } else {
          // Продолжаем проверять статус
          setTimeout(checkStatus, 1000);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    // Начинаем проверку статуса
    checkStatus();
  });
}

/**
 * Отправляет сообщение в существующий тред и получает ответ
 * @param {string} userId - ID пользователя
 * @param {string} message - Сообщение пользователя
 * @returns {Promise<string>} - Ответ ассистента
 */
async function sendMessage(userId, message) {
  try {
    // Проверяем, есть ли активная сессия
    if (!userSessions[userId]) {
      throw new Error('У вас нет активной сессии. Выберите категорию кейса.');
    }
    
    const { threadId, assistantId } = userSessions[userId];
    
    // Добавляем сообщение пользователя в тред
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });
    
    // Запускаем выполнение ассистента
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    
    // Ожидаем завершения выполнения
    return await waitForRunCompletion(threadId, run.id);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    throw error;
  }
}

/**
 * Проверяет, есть ли у пользователя активная сессия
 * @param {string} userId - ID пользователя
 * @returns {boolean} - Есть ли активная сессия
 */
function hasActiveSession(userId) {
  return !!userSessions[userId];
}

/**
 * Завершает текущую сессию пользователя
 * @param {string} userId - ID пользователя
 */
function endSession(userId) {
  if (userSessions[userId]) {
    delete userSessions[userId];
    return true;
  }
  return false;
}

/**
 * Получает информацию о текущей сессии пользователя
 * @param {string} userId - ID пользователя
 * @returns {Object|null} - Информация о сессии или null, если сессии нет
 */
function getSessionInfo(userId) {
  return userSessions[userId] || null;
}

module.exports = {
  createSession,
  sendMessage,
  hasActiveSession,
  endSession,
  getSessionInfo
};
