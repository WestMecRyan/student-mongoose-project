const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema({
    item: {
        type: String,
        required: [true, 'item requires a string value']
    },
    food_group: {
        type: String,
        required: [true, 'food_group is required'],
        enum: ['proteins', 'dairy', 'fruits', 'vegetables', 'nuts', 'grains']
    },
    price_in_usd: {
        type: Number,
        required: [true, 'price is required'],
        min: [0, 'please enter a positive value']
    },
    organic: {
        type: Boolean,
        required: [false]
    },
    calories_per_100g: {
        type: Number,
        required: [true, "calories per 100g is required"]
    }
});

module.exports = mongoose.model('GroceryItem', grocerySchema);