/**
 * u041fu043eu0434u043au043bu044eu0447u0435u043du0438u0435 u043a MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();

// u041fu043eu043bu0443u0447u0430u0435u043c URL u0434u043bu044f u043fu043eu0434u043au043bu044eu0447u0435u043du0438u044f u043a MongoDB u0438u0437 u043fu0435u0440u0435u043cu0435u043du043du044bu0445 u043eu043au0440u0443u0436u0435u043du0438u044f
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-bot';

/**
 * u0423u0441u0442u0430u043du0430u0432u043bu0438u0432u0430u0435u0442 u0441u043eu0435u0434u0438u043du0435u043du0438u0435 u0441 MongoDB
 */
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('u0423u0441u043fu0435u0448u043du043eu0435 u043fu043eu0434u043au043bu044eu0447u0435u043du0438u0435 u043a MongoDB');
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043fu043eu0434u043au043bu044eu0447u0435u043du0438u0438 u043a MongoDB:', error);
  }
}

module.exports = {
  connectToDatabase
};
