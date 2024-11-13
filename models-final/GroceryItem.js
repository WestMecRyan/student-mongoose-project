// models/GroceryItem.js
const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema({
  item: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  food_group: {
    type: String,
    required: [true, 'Food group is required'],
    enum: ['fruits', 'vegetables', 'proteins', 'dairy', 'grains', 'nuts']
  },
  price_in_usd: {
    type: Number,
    required: [true, 'Price is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  calories_per_100g: Number,
  organic: Boolean,
  wild_caught: Boolean,
  fat_content: String,
  gluten_free: Boolean,
  free_range: Boolean
});

module.exports = mongoose.model('GroceryItem', grocerySchema);
