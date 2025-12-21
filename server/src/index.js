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
            serverSelectionTimeoutMS: 25000, // Timeout for server selection (25s)
            socketTimeoutMS: 45000, // Socket timeout (45s)
            maxPoolSize: 10, // Maximum connection pool size
            minPoolSize: 1, // Minimum connection pool size
            maxIdleTimeMS: 30000, // Maximum idle time for connections
            // bufferCommands: false, // Disable buffering
        });

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
