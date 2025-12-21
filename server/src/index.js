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

// MongoDB connection with optimized settings for serverless
let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        console.log('Connecting to MongoDB...');
        const db = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-list', {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            maxPoolSize: 10,
            minPoolSize: 1,
            maxIdleTimeMS: 60000,
            bufferCommands: true,
            connectTimeoutMS: 30000,
        });

        mongoose.set('bufferTimeoutMS', 60000);
        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB connected successfully, state:', mongoose.connection.readyState);
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        isConnected = false;
        throw err;
    }
};

// Connect to MongoDB on startup
connectDB();

// Root endpoint
app.get('/', (req, res) => {
    res.send('Shopping List API is running');
});

// ============================================
// PUBLIC ENDPOINTS (No auth required)
// Must be defined BEFORE apiRoutes
// ============================================

// Health check endpoint
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

// Diagnostic endpoint for debugging
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

        // Try to connect if not connected
        if (dbState !== 1) {
            log('Attempting to connect to MongoDB...');
            await connectDB();
            log(`Connection attempt complete, new state: ${mongoose.connection.readyState}`);
        }

        // Try a simple query if connected
        if (mongoose.connection.readyState === 1) {
            log('Testing database query...');
            const User = require('./models/User');
            const userCount = await User.countDocuments();
            log(`User count: ${userCount}`);
        }

        const totalTime = Date.now() - startTime;
        log(`Diagnostic complete in ${totalTime}ms`);

        res.json({
            status: 'ok',
            totalTimeMs: totalTime,
            database: states[mongoose.connection.readyState],
            environment: envCheck,
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
