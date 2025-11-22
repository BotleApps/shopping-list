const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const List = require('../models/List');

// --- Product Routes ---

// Get all products (Master List)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new product
router.post('/products', async (req, res) => {
    const product = new Product(req.body);
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a product
router.patch('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- List Routes ---

// Get all active lists
router.get('/lists', async (req, res) => {
    try {
        const lists = await List.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 });
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new list
router.post('/lists', async (req, res) => {
    const list = new List({
        name: req.body.name || 'New Shopping List',
        type: req.body.type || 'Regular'
    });
    try {
        const newList = await list.save();
        res.status(201).json(newList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get active shopping list (Legacy support / Default)
router.get('/lists/active', async (req, res) => {
    console.log("Hit /lists/active");
    try {
        // Find the most recent active list
        let list = await List.findOne({ status: 'active' }).sort({ createdAt: -1 }).populate('items.product');
        if (!list) {
            list = new List({ name: 'My Shopping List' });
            await list.save();
        }
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific list
router.get('/lists/:id', async (req, res) => {
    try {
        const list = await List.findById(req.params.id).populate('items.product');
        if (!list) return res.status(404).json({ message: 'List not found' });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Archive a list
router.post('/lists/:id/archive', async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        list.status = 'archived';
        await list.save();
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Unarchive a list
router.post('/lists/:id/unarchive', async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) return res.status(404).json({ message: 'List not found' });

        list.status = 'active';
        await list.save();
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add item to list
router.post('/lists/:id/items', async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        const { productId, quantity, customName } = req.body;

        // Check if item already exists
        const existingItemIndex = list.items.findIndex(item =>
            (item.product && item.product.toString() === productId) ||
            (item.customName && item.customName === customName)
        );

        if (existingItemIndex > -1) {
            list.items[existingItemIndex].quantity += quantity || 1;
        } else {
            list.items.push({ product: productId, quantity: quantity || 1, customName });
        }

        await list.save();
        const updatedList = await List.findById(req.params.id).populate('items.product');
        res.json(updatedList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update item in list (quantity, purchased status)
router.patch('/lists/:id/items/:itemId', async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        const item = list.items.id(req.params.itemId);
        if (req.body.quantity) item.quantity = req.body.quantity;
        if (req.body.isPurchased !== undefined) item.isPurchased = req.body.isPurchased;

        await list.save();
        const updatedList = await List.findById(req.params.id).populate('items.product');
        res.json(updatedList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove item from list
router.delete('/lists/:id/items/:itemId', async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        list.items.pull(req.params.itemId);
        await list.save();
        const updatedList = await List.findById(req.params.id).populate('items.product');
        res.json(updatedList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Clear completed items
router.post('/lists/:id/clear-completed', async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        list.items = list.items.filter(item => !item.isPurchased);
        await list.save();
        const updatedList = await List.findById(req.params.id).populate('items.product');
        res.json(updatedList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- AI Routes ---

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

router.post('/ai/suggest', async (req, res) => {
    try {
        const products = await Product.find();

        // If no API key is configured (or using mock), perform a simple heuristic or mock response
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "mock-key") {
            // Mock Logic: Suggest items that have a default quantity > 0 and are not in the current list (simplified)
            // In a real mock, we might just pick 3 random items.
            const shuffled = products.sort(() => 0.5 - Math.random());
            const suggestions = shuffled.slice(0, 3).map(p => ({
                product: p._id,
                reason: "Based on your monthly consumption habits (Mock AI)"
            }));
            return res.json({ suggestions });
        }

        // Real AI Logic
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const productList = products.map(p =>
            `- ${p.name} (Brand: ${p.brand || 'N/A'}, Avg Monthly: ${p.averageMonthlyConsumption} ${p.unit})`
        ).join('\n');

        const prompt = `
      I have a master list of grocery items with their average monthly consumption. 
      Please suggest a shopping list for this week based on this data.
      Return the result as a JSON array of objects, where each object has:
      - "productName": The exact name of the product from the list
      - "reason": A brief reason for the suggestion
      
      Master List:
      ${productList}
      
      Output JSON only, no markdown formatting.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const suggestionsData = JSON.parse(jsonStr);

        // Map back to Product IDs
        const suggestions = [];
        for (const item of suggestionsData) {
            const product = products.find(p => p.name === item.productName);
            if (product) {
                suggestions.push({
                    product: product._id,
                    reason: item.reason
                });
            }
        }

        res.json({ suggestions });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ message: "Failed to generate suggestions" });
    }
});

module.exports = router;
