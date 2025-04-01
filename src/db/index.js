/**
 * u0418u043du0438u0446u0438u0430u043bu0438u0437u0430u0446u0438u044f u0431u0430u0437u044b u0434u0430u043du043du044bu0445
 */

const { connectToDatabase } = require('./mongoose');

/**
 * u0418u043du0438u0446u0438u0430u043bu0438u0437u0438u0440u0443u0435u0442 u0431u0430u0437u0443 u0434u0430u043du043du044bu0445
 */
async function initDatabase() {
  await connectToDatabase();
}

module.exports = {
  initDatabase
};
