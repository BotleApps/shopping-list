const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const setupPassport = () => {
    // Serialize user into session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
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
