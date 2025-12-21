# Google OAuth Authentication Setup Guide

This document explains how to set up Google OAuth authentication for the Shopping List application.

## Prerequisites

- A Google Cloud Console account
- The application deployed or running locally

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Shopping List App")
4. Click "Create"

## Step 2: Configure OAuth Consent Screen

1. In the Cloud Console, navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (or Internal if using Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Shopping List
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the **Scopes** page, click "Add or Remove Scopes"
7. Add these scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
   - `openid`
8. Click "Save and Continue"
9. Add test users if in testing mode
10. Click "Save and Continue" → "Back to Dashboard"

## Step 3: Create OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Select **Web application** as the application type
4. Enter a name (e.g., "Shopping List Web Client")
5. Add **Authorized JavaScript origins**:
   - For local development: `http://localhost:5173`
   - For production: Your frontend domain (e.g., `https://your-app.vercel.app`)
6. Add **Authorized redirect URIs**:
   - For local development: `http://localhost:5001/api/auth/google/callback`
   - For production: `https://your-api.vercel.app/api/auth/google/callback`
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

### Backend (.env)

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key

# Session Secret
SESSION_SECRET=your-session-secret

# Frontend URL
CLIENT_URL=http://localhost:5173

# MongoDB
MONGODB_URI=your-mongodb-connection-string
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5001
```

## Step 5: Deploy Considerations

### For Vercel Deployment

1. Add all environment variables in Vercel project settings
2. Update `GOOGLE_CALLBACK_URL` to use your production domain
3. Update `CLIENT_URL` to your frontend production URL
4. Add production domains to Google OAuth authorized origins/redirects

### For Production

1. Set `NODE_ENV=production`
2. Use HTTPS for all URLs
3. Generate strong secrets for `JWT_SECRET` and `SESSION_SECRET`
4. Configure proper CORS origins

## Authentication Flow

1. User clicks "Continue with Google" on login page
2. User is redirected to Google's OAuth consent screen
3. After approval, Google redirects to `/api/auth/google/callback`
4. Server creates/updates user in database
5. Server generates JWT token and sets HTTP-only cookie
6. User is redirected to frontend with `?auth=success`
7. Frontend detects success and fetches user data

## Security Features

- **HTTP-only cookies**: JWT tokens are stored in HTTP-only cookies, preventing XSS attacks
- **CORS configuration**: Only specified origins can access the API
- **User data isolation**: Each user can only access their own lists and products
- **Token expiration**: JWT tokens expire after 7 days

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google` | GET | Initiates Google OAuth flow |
| `/api/auth/google/callback` | GET | OAuth callback URL |
| `/api/auth/status` | GET | Check authentication status |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/logout` | POST | Logout user |

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the callback URL in your `.env` exactly matches what's configured in Google Console
- Check for trailing slashes

### "Invalid credentials" Error
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Ensure you're using the correct project in Google Console

### Cookies Not Being Set
- Ensure CORS is configured with `credentials: true`
- For cross-domain cookies, set `sameSite: 'none'` and `secure: true`

### User Data Not Loading
- Check browser developer tools for network errors
- Verify the JWT_SECRET is the same across all requests
