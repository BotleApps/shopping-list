# ===========================================
# VERCEL PRODUCTION ENVIRONMENT VARIABLES
# ===========================================
# Copy these to your Vercel project settings
# (Settings → Environment Variables)
# ===========================================

# -------------------------------------------
# BACKEND (shopping-list-cpuc6lfo6-sivakumarvemulas-projects.vercel.app)
# -------------------------------------------

# MongoDB Connection (your Vercel/Atlas MongoDB URI)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shopping-list?retryWrites=true&w=majority

# JWT Secret (generate a strong random string - minimum 32 characters)
# You can generate one at: https://generate-secret.vercel.app/32
JWT_SECRET=GENERATE_A_STRONG_RANDOM_SECRET_HERE

# Session Secret
SESSION_SECRET=GENERATE_ANOTHER_STRONG_SECRET_HERE

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console
GOOGLE_CALLBACK_URL=https://shopping-list-cpuc6lfo6-sivakumarvemulas-projects.vercel.app/api/auth/google/callback

# Frontend URL (for CORS and redirects after login)
CLIENT_URL=https://shopping-list-ui-tau.vercel.app

# Gemini API Key (optional, for AI suggestions)
GEMINI_API_KEY=your-gemini-api-key-or-mock-key

# Environment
NODE_ENV=production

# -------------------------------------------
# FRONTEND (shopping-list-ui-tau.vercel.app)
# -------------------------------------------

# Backend API URL
VITE_API_URL=https://shopping-list-cpuc6lfo6-sivakumarvemulas-projects.vercel.app
