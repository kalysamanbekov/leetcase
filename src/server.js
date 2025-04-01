/**
 * Простой HTTP-сервер для Render
 */

const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('LeetCase Telegram Bot is running!');
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = server;
