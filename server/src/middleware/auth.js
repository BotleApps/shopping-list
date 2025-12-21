const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
