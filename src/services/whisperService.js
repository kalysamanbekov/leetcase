/**
 * u0421u0435u0440u0432u0438u0441 u0434u043bu044f u0440u0430u0431u043eu0442u044b u0441 OpenAI Whisper API u0434u043bu044f u0440u0430u0441u043fu043eu0437u043du0430u0432u0430u043du0438u044f u0440u0435u0447u0438
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');
const config = require('../config');

// u0414u0438u0440u0435u043au0442u043eu0440u0438u044f u0434u043bu044f u0432u0440u0435u043cu0435u043du043du043eu0433u043e u0445u0440u0430u043du0435u043du0438u044f u0430u0443u0434u0438u043eu0444u0430u0439u043bu043eu0432
const TEMP_DIR = path.join(__dirname, '../../temp');

// u0421u043eu0437u0434u0430u0435u043c u0434u0438u0440u0435u043au0442u043eu0440u0438u044e, u0435u0441u043bu0438 u043eu043du0430 u043du0435 u0441u0443u0449u0435u0441u0442u0432u0443u0435u0442
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * u0421u043au0430u0447u0438u0432u0430u0435u0442 u0430u0443u0434u0438u043eu0444u0430u0439u043b u043fu043e URL
 * @param {string} fileUrl - URL u0444u0430u0439u043bu0430 u0434u043bu044f u0441u043au0430u0447u0438u0432u0430u043du0438u044f
 * @param {string} userId - ID u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f u0434u043bu044f u0441u043eu0437u0434u0430u043du0438u044f u0443u043du0438u043au0430u043bu044cu043du043eu0433u043e u0438u043cu0435u043du0438 u0444u0430u0439u043bu0430
 * @returns {Promise<string>} u041fu0443u0442u044c u043a u0441u043au0430u0447u0430u043du043du043eu043cu0443 u0444u0430u0439u043bu0443
 */
async function downloadAudioFile(fileUrl, userId) {
  try {
    const timestamp = Date.now();
    const filePath = path.join(TEMP_DIR, `voice_${userId}_${timestamp}.ogg`);
    
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream'
    });
    
    await pipeline(response.data, createWriteStream(filePath));
    console.log(`u0410u0443u0434u0438u043eu0444u0430u0439u043b u0441u043eu0445u0440u0430u043du0435u043d: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u0441u043au0430u0447u0438u0432u0430u043du0438u0438 u0430u0443u0434u0438u043eu0444u0430u0439u043bu0430:', error);
    throw new Error('u041du0435 u0443u0434u0430u043bu043eu0441u044c u0441u043au0430u0447u0430u0442u044c u0430u0443u0434u0438u043eu0444u0430u0439u043b');
  }
}

/**
 * u041eu0442u043fu0440u0430u0432u043bu044fu0435u0442 u0430u0443u0434u0438u043eu0444u0430u0439u043b u0432 Whisper API u0434u043bu044f u0440u0430u0441u043fu043eu0437u043du0430u0432u0430u043du0438u044f u0440u0435u0447u0438
 * @param {string} audioFilePath - u041fu0443u0442u044c u043a u0430u0443u0434u0438u043eu0444u0430u0439u043bu0443
 * @returns {Promise<string>} u0420u0430u0441u043fu043eu0437u043du0430u043du043du044bu0439 u0442u0435u043au0441u0442
 */
async function transcribeAudio(audioFilePath) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFilePath));
    formData.append('model', 'whisper-1');
    formData.append('language', 'ru'); // u0423u043au0430u0437u044bu0432u0430u0435u043c u044fu0437u044bu043a u0434u043bu044f u043bu0443u0447u0448u0435u0433u043e u0440u0430u0441u043fu043eu0437u043du0430u0432u0430u043du0438u044f
    
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${config.openaiApiKey}`
        }
      }
    );
    
    // u0423u0434u0430u043bu044fu0435u043c u0432u0440u0435u043cu0435u043du043du044bu0439 u0444u0430u0439u043b u043fu043eu0441u043bu0435 u043eu0431u0440u0430u0431u043eu0442u043au0438
    fs.unlinkSync(audioFilePath);
    
    return response.data.text;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u0440u0430u0441u043fu043eu0437u043du0430u0432u0430u043du0438u0438 u0440u0435u0447u0438:', error.response?.data || error.message);
    
    // u041fu044bu0442u0430u0435u043cu0441u044f u0443u0434u0430u043bu0438u0442u044c u0444u0430u0439u043b u0432 u0441u043bu0443u0447u0430u0435 u043eu0448u0438u0431u043au0438
    try {
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    } catch (e) {
      console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u0443u0434u0430u043bu0435u043du0438u0438 u0444u0430u0439u043bu0430:', e);
    }
    
    throw new Error('u041du0435 u0443u0434u0430u043bu043eu0441u044c u0440u0430u0441u043fu043eu0437u043du0430u0442u044c u0440u0435u0447u044c');
  }
}

/**
 * u041eu0431u0440u0430u0431u0430u0442u044bu0432u0430u0435u0442 u0433u043eu043bu043eu0441u043eu0432u043eu0435 u0441u043eu043eu0431u0449u0435u043du0438u0435 u0438 u0432u043eu0437u0432u0440u0430u0449u0430u0435u0442 u0440u0430u0441u043fu043eu0437u043du0430u043du043du044bu0439 u0442u0435u043au0441u0442
 * @param {Object} bot - u042du043au0437u0435u043cu043fu043bu044fu0440 u0431u043eu0442u0430
 * @param {Object} msg - u041eu0431u044au0435u043au0442 u0441u043eu043eu0431u0449u0435u043du0438u044f
 * @returns {Promise<string>} u0420u0430u0441u043fu043eu0437u043du0430u043du043du044bu0439 u0442u0435u043au0441u0442
 */
async function handleVoiceMessage(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const fileId = msg.voice.file_id;
  
  try {
    // u041eu0442u043fu0440u0430u0432u043bu044fu0435u043c u0441u043eu043eu0431u0449u0435u043du0438u0435 u043e u043du0430u0447u0430u043bu0435 u043eu0431u0440u0430u0431u043eu0442u043au0438
    const processingMessage = await bot.sendMessage(chatId, 'u041eu0431u0440u0430u0431u0430u0442u044bu0432u0430u044e u0432u0430u0448u0435 u0433u043eu043bu043eu0441u043eu0432u043eu0435 u0441u043eu043eu0431u0449u0435u043du0438u0435...');
    
    // u041fu043eu043bu0443u0447u0430u0435u043c u0438u043du0444u043eu0440u043cu0430u0446u0438u044e u043e u0444u0430u0439u043bu0435
    const fileInfo = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${config.telegramToken}/${fileInfo.file_path}`;
    
    // u0421u043au0430u0447u0438u0432u0430u0435u043c u0430u0443u0434u0438u043eu0444u0430u0439u043b
    const audioFilePath = await downloadAudioFile(fileUrl, userId);
    
    // u041eu0431u043du043eu0432u043bu044fu0435u043c u0441u043eu043eu0431u0449u0435u043du0438u0435 u043e u0441u0442u0430u0442u0443u0441u0435
    await bot.editMessageText('u0420u0430u0441u043fu043eu0437u043du0430u044e u0440u0435u0447u044c...', {
      chat_id: chatId,
      message_id: processingMessage.message_id
    });
    
    // u041eu0442u043fu0440u0430u0432u043bu044fu0435u043c u0430u0443u0434u0438u043eu0444u0430u0439u043b u0432 Whisper API
    const transcribedText = await transcribeAudio(audioFilePath);
    
    // u0423u0434u0430u043bu044fu0435u043c u0441u043eu043eu0431u0449u0435u043du0438u0435 u043e u0441u0442u0430u0442u0443u0441u0435
    await bot.deleteMessage(chatId, processingMessage.message_id);
    
    return transcribedText;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 u0433u043eu043bu043eu0441u043eu0432u043eu0433u043e u0441u043eu043eu0431u0449u0435u043du0438u044f:', error);
    await bot.sendMessage(chatId, `u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 u0433u043eu043bu043eu0441u043eu0432u043eu0433u043e u0441u043eu043eu0431u0449u0435u043du0438u044f: ${error.message}`);
    throw error;
  }
}

module.exports = {
  handleVoiceMessage
};
