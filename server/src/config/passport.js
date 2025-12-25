const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const dbConnect = require('../lib/dbConnect');

const setupPassport = () => {
    // Serialize user into session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            await dbConnect();
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.error('Deserialize error:', err.message);
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

            // CRITICAL: Ensure database is connected BEFORE any mongoose operation
            console.log('Connecting to database...');
            await dbConnect();
            console.log('Database connected in', Date.now() - startTime, 'ms');

            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                console.log('Existing user found:', user.email, 'in', Date.now() - startTime, 'ms');
                // Update last login (don't await to speed up response)
                user.updateLastLogin().catch(err => console.error('Failed to update last login:', err.message));
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
            console.error('Google OAuth error:', err.message);
            console.error('Time elapsed:', Date.now() - startTime, 'ms');
            done(err, null);
        }
    }));
};

module.exports = setupPassport;
