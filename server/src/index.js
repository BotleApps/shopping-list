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
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-list', {
            // Optimized settings for serverless environments
            serverSelectionTimeoutMS: 30000, // Timeout for server selection (30s)
            socketTimeoutMS: 60000, // Socket timeout (60s)
            maxPoolSize: 10, // Maximum connection pool size
            minPoolSize: 1, // Minimum connection pool size
            maxIdleTimeMS: 60000, // Maximum idle time for connections
            bufferCommands: true, // Allow buffering commands while connecting
            connectTimeoutMS: 30000, // Connection timeout (30s)
        });

        // Also set default timeout for operations
        mongoose.set('bufferTimeoutMS', 60000); // 60 second buffer timeout

        isConnected = db.connections[0].readyState === 1;
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

// Connect to MongoDB
connectDB();

// Ensure DB connection before handling requests (middleware)
app.use(async (req, res, next) => {
    try {
        if (!isConnected) {
            await connectDB();
        }
        next();
    } catch (err) {
        console.error('DB connection middleware error:', err);
        res.status(503).json({ message: 'Database connection failed. Please try again.' });
    }
});

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Shopping List API is running');
});

// Health check endpoint (also warms up the connection)
app.get('/api/health', async (req, res) => {
    try {
        // Check if mongoose is connected
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
            database: states[dbState] || 'unknown'
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

        // Try a simple query if connected
        if (dbState === 1) {
            log('Testing database query...');
            const User = require('./models/User');
            const userCount = await User.countDocuments();
            log(`User count: ${userCount}`);
        } else {
            log('Attempting to connect to MongoDB...');
            await connectDB();
            log('Connection established');
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
