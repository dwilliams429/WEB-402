const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  ingredients: [{
    name: String,
    quantity: String,
    unit: String
  }],
  instructions: { type: String, required: true },
  prepTime: { type: String },
  cookTime: { type: String },
  servings: { type: Number },
  isAIGenerated: { type: Boolean, default: false },
  originalPrompt: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', recipeSchema);
