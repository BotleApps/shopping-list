require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');

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

// ============================================
// MongoDB Connection for Serverless (Vercel)
// ============================================
// Key fixes for serverless:
// 1. Cache connection across warm invocations
// 2. Disable mongoose buffering - fail fast instead of timeout
// 3. Ensure connection before any DB operation

// Disable buffering - operations will fail immediately if not connected
// This prevents the 10s buffering timeout issue
mongoose.set('bufferCommands', false);

// Cache the connection promise globally (survives across warm function invocations)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // Return cached connection if available
    if (cached.conn) {
        return cached.conn;
    }

    // If a connection is in progress, wait for it
    if (cached.promise) {
        cached.conn = await cached.promise;
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-list';

    console.log('Creating new MongoDB connection...');

    const opts = {
        bufferCommands: false,           // Disable buffering
        serverSelectionTimeoutMS: 10000, // 10s to find a server (fail fast)
        socketTimeoutMS: 45000,          // 45s for socket operations
        maxPoolSize: 10,
        minPoolSize: 0,                  // Allow pool to shrink to 0 in serverless
        maxIdleTimeMS: 10000,            // Close idle connections after 10s
        connectTimeoutMS: 10000,         // 10s to establish connection
        retryWrites: true,
        retryReads: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
            console.log('MongoDB connected successfully');
            return mongoose;
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err.message);
            cached.promise = null; // Reset promise so we can retry
            throw err;
        });

    cached.conn = await cached.promise;
    return cached.conn;
};

// Handle connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    cached.conn = null;
    cached.promise = null;
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    cached.conn = null;
    cached.promise = null;
});

// Export connectDB for use in routes/middleware
module.exports.connectDB = connectDB;

// Middleware to ensure DB connection before processing requests
const ensureDbConnected = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection failed in middleware:', err.message);
        res.status(503).json({
            error: 'Database temporarily unavailable',
            message: 'Please try again in a moment'
        });
    }
};

// Apply DB middleware to all /api routes (except health check)
app.use('/api', (req, res, next) => {
    // Skip DB check for simple health endpoint
    if (req.path === '/health') {
        return next();
    }
    ensureDbConnected(req, res, next);
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Shopping List API is running');
});

// ============================================
// PUBLIC ENDPOINTS (No auth required)
// Must be defined BEFORE apiRoutes
// ============================================

// Health check endpoint (no DB required)
app.get('/api/health', async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

// Diagnostic endpoint for debugging (actively tests connection)
app.get('/api/debug/status', async (req, res) => {
    const startTime = Date.now();
    const logs = [];

    const log = (msg) => {
        const elapsed = Date.now() - startTime;
        logs.push(`[${elapsed}ms] ${msg}`);
        console.log(`[DEBUG ${elapsed}ms] ${msg}`);
    };

    log('Starting diagnostic check');

    try {
        // Check environment variables
        log('Checking environment variables...');
        const envCheck = {
            MONGODB_URI: !!process.env.MONGODB_URI,
            MONGODB_URI_PREFIX: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'not set',
            GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
            JWT_SECRET: !!process.env.JWT_SECRET,
            CLIENT_URL: process.env.CLIENT_URL || 'not set',
            NODE_ENV: process.env.NODE_ENV || 'not set'
        };
        log(`Environment: ${JSON.stringify(envCheck)}`);

        // Check MongoDB connection state
        log('Checking MongoDB connection...');
        const dbState = mongoose.connection.readyState;
        const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        log(`MongoDB state: ${states[dbState]} (${dbState})`);

        // Check cached connection
        const hasCachedConn = !!(global.mongoose && global.mongoose.conn);
        const hasCachedPromise = !!(global.mongoose && global.mongoose.promise);
        log(`Cached connection: ${hasCachedConn}, Cached promise: ${hasCachedPromise}`);

        // Try to connect
        log('Attempting to connect to MongoDB...');
        await connectDB();
        log(`Connection attempt complete, new state: ${mongoose.connection.readyState}`);

        // Try a simple query
        log('Testing database query...');
        const User = require('./models/User');
        const userCount = await User.countDocuments();
        log(`User count: ${userCount}`);

        const totalTime = Date.now() - startTime;
        log(`Diagnostic complete in ${totalTime}ms`);

        res.json({
            status: 'ok',
            totalTimeMs: totalTime,
            database: states[mongoose.connection.readyState],
            userCount,
            environment: envCheck,
            logs: logs
        });
    } catch (err) {
        log(`Error: ${err.message}`);
        res.status(500).json({
            status: 'error',
            error: err.message,
            stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
            logs: logs
        });
    }
});

// ============================================
// PROTECTED ROUTES (Auth required)
// ============================================

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/api/auth', authRoutes);
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
