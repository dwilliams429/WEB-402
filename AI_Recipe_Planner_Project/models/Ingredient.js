const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  quantity: { type: String },
  unit: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
