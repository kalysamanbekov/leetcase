/**
 * Модель подписки пользователя для MongoDB
 */
const mongoose = require('mongoose');

// Схема подписки пользователя
const subscriptionSchema = new mongoose.Schema({
  // ID пользователя в Telegram
  userId: {
    type: String,
    required: true,
    unique: true
  },
  // Количество использованных запросов
  requestsCount: {
    type: Number,
    default: 0
  },
  // Флаг премиум-подписки
  isPremium: {
    type: Boolean,
    default: false
  },
  // Дата окончания подписки (для премиум-пользователей)
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  // Дата создания записи
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Дата последнего обновления
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Обновляем дату последнего обновления перед сохранением
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Создаем модель
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
