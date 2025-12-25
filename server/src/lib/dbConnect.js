/**
 * MongoDB Connection for Serverless (Vercel)
 * 
 * This follows the official Vercel + Mongoose pattern:
 * https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.ts
 * 
 * Key points:
 * 1. Use global variable to cache connection across warm invocations
 * 2. bufferCommands: false - fail fast instead of buffering
 * 3. Always await dbConnect() before ANY mongoose operation
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // Don't throw during module load, check at runtime
    console.warn('MONGODB_URI environment variable not defined');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    // Check for URI at runtime
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    // If we have a cached connection, return it
    if (cached.conn) {
        return cached.conn;
    }

    // If a connection is being established, wait for it
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable mongoose buffering
            maxPoolSize: 10,       // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        };

        console.log('Creating new MongoDB connection...');
        
        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('MongoDB connected successfully');
                return mongoose;
            })
            .catch((err) => {
                // Reset promise on error so we can retry
                cached.promise = null;
                console.error('MongoDB connection failed:', err.message);
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err.message);
    // Reset cache on error
    cached.conn = null;
    cached.promise = null;
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
    // Reset cache on disconnect
    cached.conn = null;
    cached.promise = null;
});

module.exports = dbConnect;
