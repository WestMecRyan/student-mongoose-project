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
});

module.exports = mongoose.model('GroceryItem', grocerySchema);