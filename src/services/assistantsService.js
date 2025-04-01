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
 * Проверяет существование ассистента по его ID
 * @param {string} assistantId - ID ассистента для проверки
 * @returns {Promise<boolean>} - true, если ассистент существует, иначе false
 */
async function validateAssistant(assistantId) {
  try {
    console.log(`[DEBUG] Проверяем существование ассистента: ${assistantId}`);
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    console.log(`[DEBUG] Ассистент найден: ${assistant.name || assistant.id}`);
    return true;
  } catch (error) {
    console.error(`[DEBUG] Ошибка при проверке ассистента: ${error.message}`);
    return false;
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
    // Проверяем существование ассистента
    const isValid = await validateAssistant(assistantId);
    if (!isValid) {
      throw new Error(`Ассистент с ID ${assistantId} не найден`);
    }
    
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
    // Устанавливаем максимальное время ожидания - 60 секунд
    const MAX_WAIT_TIME = 60000; // 60 секунд
    const startTime = Date.now();
    let checkCount = 0;
    
    const checkStatus = async () => {
      try {
        checkCount++;
        const elapsedTime = Date.now() - startTime;
        console.log(`[DEBUG] Проверка #${checkCount}: Проверяем статус выполнения: threadId=${threadId}, runId=${runId}, прошло ${elapsedTime}ms`);
        
        // Проверяем, не превысили ли мы максимальное время ожидания
        if (elapsedTime > MAX_WAIT_TIME) {
          console.error(`[DEBUG] Превышено максимальное время ожидания (${MAX_WAIT_TIME}ms)`);
          resolve('Извините, ответ от ассистента занимает слишком много времени. Пожалуйста, попробуйте еще раз.');
          return;
        }
        
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);
        console.log(`[DEBUG] Текущий статус: ${run.status}`);
        
        if (run.status === 'completed') {
          console.log(`[DEBUG] Выполнение завершено, получаем сообщение ассистента`);
          // Получаем последнее сообщение ассистента
          const messages = await openai.beta.threads.messages.list(threadId, {
            order: 'desc',
            limit: 1
          });
          
          console.log(`[DEBUG] Получено ${messages.data.length} сообщений`);
          if (messages.data.length > 0) {
            console.log(`[DEBUG] Роль последнего сообщения: ${messages.data[0].role}`);
          }
          
          if (messages.data.length > 0 && messages.data[0].role === 'assistant') {
            let responseText = '';
            
            // Собираем текст из всех частей сообщения
            for (const contentPart of messages.data[0].content) {
              console.log(`[DEBUG] Тип части сообщения: ${contentPart.type}`);
              if (contentPart.type === 'text') {
                responseText += contentPart.text.value;
              }
            }
            
            console.log(`[DEBUG] Сформирован ответ ассистента длиной ${responseText.length} символов`);
            resolve(responseText || 'Ассистент отправил пустой ответ.');
          } else {
            console.log(`[DEBUG] Ассистент не ответил или сообщение не найдено`);
            resolve('Ассистент не ответил. Пожалуйста, попробуйте еще раз.');
          }
        } else if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
          console.error(`[DEBUG] Выполнение завершилось с ошибкой: ${run.status}`);
          if (run.last_error) {
            console.error(`[DEBUG] Детали ошибки: ${JSON.stringify(run.last_error)}`);
          }
          resolve(`Произошла ошибка при обработке запроса: ${run.status}. Пожалуйста, попробуйте еще раз.`);
        } else {
          // Продолжаем проверять статус
          console.log(`[DEBUG] Ожидаем завершения, проверим снова через 1 секунду (проверка #${checkCount})`);
          setTimeout(checkStatus, 1000);
        }
      } catch (error) {
        console.error(`[DEBUG] Ошибка при проверке статуса: ${error.message}`);
        // Вместо отклонения промиса, возвращаем сообщение об ошибке
        resolve(`Произошла ошибка при обработке запроса: ${error.message}. Пожалуйста, попробуйте еще раз.`);
      }
    };
    
    // Начинаем проверку статуса
    console.log(`[DEBUG] Начинаем проверку статуса выполнения`);
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
    console.log(`[DEBUG] Начало обработки сообщения от пользователя ${userId}: ${message}`);
    
    // Проверяем, есть ли активная сессия
    if (!userSessions[userId]) {
      console.log(`[DEBUG] Активная сессия не найдена для пользователя ${userId}`);
      throw new Error('У вас нет активной сессии. Выберите категорию кейса.');
    }
    
    const { threadId, assistantId, category } = userSessions[userId];
    console.log(`[DEBUG] Найдена активная сессия: threadId=${threadId}, assistantId=${assistantId}, category=${category}`);
    
    // Добавляем сообщение пользователя в тред
    console.log(`[DEBUG] Добавляем сообщение пользователя в тред ${threadId}`);
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });
    
    // Запускаем выполнение ассистента
    console.log(`[DEBUG] Запускаем выполнение ассистента ${assistantId}`);
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    console.log(`[DEBUG] Запущено выполнение: runId=${run.id}`);
    
    // Ожидаем завершения выполнения
    console.log(`[DEBUG] Ожидаем завершения выполнения...`);
    const response = await waitForRunCompletion(threadId, run.id);
    console.log(`[DEBUG] Получен ответ от ассистента: ${response.substring(0, 100)}...`);
    return response;
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
