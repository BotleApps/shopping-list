require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');

const dbConnect = require('./lib/dbConnect');
const setupPassport = require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Session configuration (required for Passport OAuth flow)
app.use(session({
    secret: process.env.SESSION_SECRET || 'shopping-list-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
setupPassport();

// Export dbConnect for use in routes
module.exports.dbConnect = dbConnect;

// Root endpoint
app.get('/', (req, res) => {
    res.send('Shopping List API is running');
});

// ============================================
// Health check endpoint (no DB required)
// ============================================
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: states[dbState] || 'unknown',
        dbState: dbState
    });
});

// ============================================
// Diagnostic endpoint (tests DB connection)
// ============================================
app.get('/api/debug/status', async (req, res) => {
    const startTime = Date.now();
    const logs = [];

    const log = (msg) => {
        const elapsed = Date.now() - startTime;
        logs.push(`[${elapsed}ms] ${msg}`);
    };

    log('Starting diagnostic');

    try {
        const envCheck = {
            MONGODB_URI: !!process.env.MONGODB_URI,
            GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
            JWT_SECRET: !!process.env.JWT_SECRET,
            CLIENT_URL: process.env.CLIENT_URL || 'not set',
            NODE_ENV: process.env.NODE_ENV || 'not set'
        };
        log(`Environment check complete`);

        // Test DB connection
        log('Connecting to database...');
        await dbConnect();
        log('Database connected');

        // Test query
        log('Testing query...');
        const User = require('./models/User');
        const userCount = await User.countDocuments();
        log(`Found ${userCount} users`);

        res.json({
            status: 'ok',
            totalTimeMs: Date.now() - startTime,
            database: 'connected',
            userCount,
            environment: envCheck,
            logs
        });
    } catch (err) {
        log(`Error: ${err.message}`);
        res.status(500).json({
            status: 'error',
            error: err.message,
            logs
        });
    }
});

// ============================================
// Auth Routes
// ============================================
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ============================================
// Protected API Routes
// ============================================
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
