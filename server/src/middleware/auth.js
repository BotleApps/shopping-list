const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper to get DB connection (uses global cache)
const getConnection = async () => {
    const cached = global.mongoose;
    if (cached && cached.conn) {
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-list';
    const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 10000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        retryReads: true,
    };

    if (!global.mongoose) {
        global.mongoose = { conn: null, promise: null };
    }

    if (!global.mongoose.promise) {
        global.mongoose.promise = mongoose.connect(MONGODB_URI, opts);
    }

    global.mongoose.conn = await global.mongoose.promise;
    return global.mongoose.conn;
};

// Middleware to check if user is authenticated via JWT
const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopping-list-secret-key');

        // Ensure DB connection before querying
        await getConnection();

        // Get user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('Authentication error:', err.message);
        return res.status(500).json({ message: 'Authentication error' });
    }
};

// Optional authentication - doesn't fail if not authenticated
const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopping-list-secret-key');

            // Ensure DB connection before querying
            await getConnection();

            const user = await User.findById(decoded.userId);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (err) {
        // Continue without authentication
        next();
    }
};

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'shopping-list-secret-key',
        { expiresIn: '7d' }
    );
};

module.exports = { isAuthenticated, optionalAuth, generateToken };
