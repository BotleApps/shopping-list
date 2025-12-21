const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const List = require('../models/List');
const { isAuthenticated } = require('../middleware/auth');

// Apply authentication to all routes
router.use(isAuthenticated);

// --- Product Routes ---

// Get all products (Master List) for authenticated user
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({ user: req.user._id }).sort({ name: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new product
router.post('/products', async (req, res) => {
    const product = new Product({
        ...req.body,
        user: req.user._id
    });
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
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
    try {
        const result = await Product.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!result) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- List Routes ---

// Get all lists for authenticated user
router.get('/lists', async (req, res) => {
    try {
        const lists = await List.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new list
router.post('/lists', async (req, res) => {
    const list = new List({
        name: req.body.name || 'New Shopping List',
        type: req.body.type || 'Regular',
        user: req.user._id
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
    try {
        let list = await List.findOne({ user: req.user._id, status: 'active' })
            .sort({ createdAt: -1 })
            .populate('items.product');
        if (!list) {
            list = new List({ name: 'My Shopping List', user: req.user._id });
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
        const list = await List.findOne({ _id: req.params.id, user: req.user._id })
            .populate('items.product');
        if (!list) return res.status(404).json({ message: 'List not found' });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Archive a list
router.post('/lists/:id/archive', async (req, res) => {
    try {
        const list = await List.findOne({ _id: req.params.id, user: req.user._id });
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
        const list = await List.findOne({ _id: req.params.id, user: req.user._id });
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
        const list = await List.findOne({ _id: req.params.id, user: req.user._id });
        if (!list) return res.status(404).json({ message: 'List not found' });

        const { productId, quantity, customName } = req.body;

        // Verify product belongs to user if productId is provided
        if (productId) {
            const product = await Product.findOne({ _id: productId, user: req.user._id });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
        }

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
        const updatedList = await List.findById(list._id).populate('items.product');
        res.json(updatedList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update item in list (quantity, purchased status)
router.patch('/lists/:id/items/:itemId', async (req, res) => {
    try {
        const list = await List.findOne({ _id: req.params.id, user: req.user._id });
        if (!list) return res.status(404).json({ message: 'List not found' });

        const item = list.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (req.body.quantity) item.quantity = req.body.quantity;
        if (req.body.isPurchased !== undefined) item.isPurchased = req.body.isPurchased;

        await list.save();
        const updatedList = await List.findById(list._id).populate('items.product');
        res.json(updatedList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Remove item from list
router.delete('/lists/:id/items/:itemId', async (req, res) => {
    try {
        const list = await List.findOne({ _id: req.params.id, user: req.user._id });
        if (!list) return res.status(404).json({ message: 'List not found' });

        list.items.pull(req.params.itemId);
        await list.save();
        const updatedList = await List.findById(list._id).populate('items.product');
        res.json(updatedList);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Clear completed items
router.post('/lists/:id/clear-completed', async (req, res) => {
    try {
        const list = await List.findOne({ _id: req.params.id, user: req.user._id });
        if (!list) return res.status(404).json({ message: 'List not found' });

        list.items = list.items.filter(item => !item.isPurchased);
        await list.save();
        const updatedList = await List.findById(list._id).populate('items.product');
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
        const products = await Product.find({ user: req.user._id });

        // If no API key is configured (or using mock), perform a simple heuristic or mock response
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "mock-key") {
            // Mock Logic: Suggest items that have a default quantity > 0 and are not in the current list (simplified)
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
