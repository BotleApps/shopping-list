const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    isPurchased: { type: Boolean, default: false },
    customName: String, // For items not in master list
});

const listSchema = new mongoose.Schema({
    name: { type: String, required: true, default: 'My Shopping List' },
    items: [listItemSchema],
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('List', listSchema);
