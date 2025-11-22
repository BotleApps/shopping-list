const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    brand: String,
    imageUrl: String,
    defaultQuantity: { type: Number, default: 1 },
    alias: String, // Local name or nickname
    notes: String,
    consumptionDuration: { type: Number, default: 7 }, // Days a unit lasts
    category: {
        type: String,
        default: 'Other',
        enum: ['Fruits & Veggies', 'Dairy & Eggs', 'Bakery', 'Meat & Seafood', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Personal Care', 'Other']
    },
    unit: {
        type: String,
        default: 'unit',
        enum: ['unit', 'kg', 'g', 'l', 'ml', 'pack', 'dozen', 'bunch']
    },
    averageMonthlyConsumption: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);

