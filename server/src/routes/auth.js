const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const router = express.Router();
const { generateToken, isAuthenticated } = require('../middleware/auth');
const dbConnect = require('../lib/dbConnect');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        // Log any errors for debugging
        if (err) {
            console.error('Passport auth error:', err);
            return res.redirect(`${CLIENT_URL}/login?error=auth_error&message=${encodeURIComponent(err.message)}`);
        }

        if (!user) {
            console.error('No user returned from Google auth:', info);
            return res.redirect(`${CLIENT_URL}/login?error=no_user`);
        }

        try {
            // Generate JWT token
            const token = generateToken(user);

            console.log('OAuth callback for user:', user.email);

            // Cookie options for cross-origin authentication
            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            };

            if (process.env.NODE_ENV === 'production') {
                cookieOptions.partitioned = true;
            }

            res.cookie('token', token, cookieOptions);

            // Redirect with token in URL (mobile browsers may block cookies)
            res.redirect(`${CLIENT_URL}?auth=success&token=${encodeURIComponent(token)}`);
        } catch (tokenError) {
            console.error('Token generation error:', tokenError);
            return res.redirect(`${CLIENT_URL}/login?error=token_error`);
        }
    })(req, res, next);
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user
router.get('/me', isAuthenticated, (req, res) => {
    res.json({
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture
    });
});

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', (req, res) => {
    try {
        console.log('Clearing auth cookie. Request cookies:', req.cookies || {});
    } catch (e) {
        console.log('Failed to log cookies on logout:', e && e.message ? e.message : e);
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    });
    res.json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/status
// @desc    Check authentication status
router.get('/status', async (req, res) => {
    try {
        // Check for token in cookie first, then Authorization header (mobile fallback)
        let token = req.cookies?.token;
        
        // Fallback: Check Authorization header (for mobile browsers that block cookies)
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.json({ authenticated: false });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopping-list-secret-key');

        // CRITICAL: Ensure DB connection before querying
        await dbConnect();

        const User = require('../models/User');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.json({ authenticated: false });
        }

        res.json({
            authenticated: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });
    } catch (err) {
        console.error('Auth status error:', err.message);
        // Return unauthenticated on error instead of 500
        res.json({ authenticated: false });
    }
});

// @route   GET /api/auth/debug
// @desc    Debug endpoint to check environment
router.get('/debug', (req, res) => {
    res.json({
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasMongoUri: !!process.env.MONGODB_URI,
        clientUrl: process.env.CLIENT_URL,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        nodeEnv: process.env.NODE_ENV
    });
});

// @route   GET /api/auth/diagnostic
// @desc    Full diagnostic endpoint with timing info
router.get('/diagnostic', async (req, res) => {
    const startTime = Date.now();
    const logs = [];

    const log = (msg) => {
        const elapsed = Date.now() - startTime;
        logs.push(`[${elapsed}ms] ${msg}`);
        console.log(`[DIAG ${elapsed}ms] ${msg}`);
    };

    log('Starting diagnostic');

    try {
        // Check MongoDB connection state
        const dbState = mongoose.connection.readyState;
        const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        log(`MongoDB initial state: ${states[dbState]} (${dbState})`);

        // Try to establish connection
        log('Attempting to connect...');
        await dbConnect();
        log(`Connection established, state: ${mongoose.connection.readyState}`);

        // Test database query
        log('Testing database query...');
        const User = require('../models/User');
        const userCount = await User.countDocuments();
        log(`User count: ${userCount}`);

        const totalTime = Date.now() - startTime;
        log(`Diagnostic complete in ${totalTime}ms`);

        res.json({
            status: 'ok',
            totalTimeMs: totalTime,
            database: states[mongoose.connection.readyState],
            dbState: mongoose.connection.readyState,
            userCount,
            logs: logs
        });
    } catch (err) {
        log(`Error: ${err.message}`);
        res.status(500).json({
            status: 'error',
            error: err.message,
            logs: logs
        });
    }
});

module.exports = router;
