const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    isPurchased: { type: Boolean, default: false },
    customName: String, // For items not in master list
});

const listSchema = new mongoose.Schema({
    name: { type: String, required: true, default: 'My Shopping List' },
    type: { type: String, default: 'Regular' }, // e.g., Weekly, Monthly, Party
    items: [listItemSchema],
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

// Index for efficient queries by user
listSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('List', listSchema);
