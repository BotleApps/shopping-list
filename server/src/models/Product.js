const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    brand: String,
    imageUrl: String,
    defaultQuantity: { type: Number, default: 1 },
    unit: { type: String, default: 'unit' }, // e.g., kg, liters, pack
    averageMonthlyConsumption: { type: Number, default: 1 },
    category: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
