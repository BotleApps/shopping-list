const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper to wait for DB connection
const waitForConnection = async (maxWaitMs = 30000) => {
    const startTime = Date.now();

    while (mongoose.connection.readyState !== 1) {
        if (Date.now() - startTime > maxWaitMs) {
            throw new Error('Database connection timeout');
        }
        // Wait 500ms before checking again
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Waiting for MongoDB connection... State:', mongoose.connection.readyState);
    }

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
            await waitForConnection();
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
        try {
            console.log('Google OAuth callback received for:', profile.emails?.[0]?.value);

            // Wait for database connection before proceeding
            console.log('Waiting for database connection...');
            await waitForConnection();
            console.log('Database connected, proceeding with user lookup');

            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                console.log('Existing user found:', user.email);
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

            console.log('New user created:', user.email);
            done(null, user);
        } catch (err) {
            console.error('Google OAuth error:', err);
            done(err, null);
        }
    }));
};

module.exports = setupPassport;
