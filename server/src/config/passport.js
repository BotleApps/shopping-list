const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper to ensure DB is connected (waits up to 60 seconds for cold starts)
const ensureConnected = async (maxWaitMs = 60000) => {
    const startTime = Date.now();

    // If already connected, return immediately
    if (mongoose.connection.readyState === 1) {
        return true;
    }

    console.log('Waiting for MongoDB connection... Current state:', mongoose.connection.readyState);

    // Wait for connection
    while (mongoose.connection.readyState !== 1) {
        if (Date.now() - startTime > maxWaitMs) {
            console.error('MongoDB connection timeout after', maxWaitMs, 'ms');
            throw new Error(`Database connection timeout after ${maxWaitMs}ms`);
        }

        // If disconnected, try to trigger connection
        if (mongoose.connection.readyState === 0) {
            console.log('MongoDB disconnected, attempting to reconnect...');
            try {
                await mongoose.connect(process.env.MONGODB_URI, {
                    serverSelectionTimeoutMS: 30000,
                    socketTimeoutMS: 60000,
                    connectTimeoutMS: 30000,
                });
                console.log('Reconnection successful');
            } catch (err) {
                console.error('Reconnection attempt failed:', err.message);
            }
        }

        // Wait 500ms before checking again
        await new Promise(resolve => setTimeout(resolve, 500));

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        if (elapsed % 5 === 0 && elapsed > 0) {
            console.log(`Still waiting for MongoDB... ${elapsed}s elapsed, state:`, mongoose.connection.readyState);
        }
    }

    console.log('MongoDB connected! Ready for queries.');
    return true;
};

const setupPassport = () => {
    // Serialize user into session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            await ensureConnected();
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.error('Deserialize error:', err);
            done(err, null);
        }
    });

    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        const startTime = Date.now();

        try {
            console.log('Google OAuth callback received for:', profile.emails?.[0]?.value);

            // Ensure database is connected before proceeding
            console.log('Ensuring database connection...');
            await ensureConnected();
            console.log('Database connected, proceeding with user lookup');

            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                console.log('Existing user found:', user.email, 'in', Date.now() - startTime, 'ms');
                // Update last login
                await user.updateLastLogin();
                return done(null, user);
            }

            console.log('Creating new user for:', profile.emails?.[0]?.value);

            // Create new user
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                picture: profile.photos?.[0]?.value
            });

            console.log('New user created:', user.email, 'in', Date.now() - startTime, 'ms');
            done(null, user);
        } catch (err) {
            console.error('Google OAuth error:', err);
            console.error('Time elapsed:', Date.now() - startTime, 'ms');
            done(err, null);
        }
    }));
};

module.exports = setupPassport;
