# Quick Start Template - New App Setup Checklist

> Use this checklist to quickly set up a new app with the same architecture as Shopping List.

## Pre-requisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] GitHub account
- [ ] Vercel account (connected to GitHub)
- [ ] MongoDB Atlas account
- [ ] Google Cloud Console account

---

## Phase 1: Initial Setup (15 mins)

### 1.1 Create Repository
```bash
# Create new directory
mkdir my-new-app && cd my-new-app
git init

# Create folder structure
mkdir -p client server docs
touch .gitignore README.md
```

### 1.2 Setup .gitignore
```gitignore
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# Build outputs
dist/
build/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## Phase 2: Frontend Setup (20 mins)

### 2.1 Initialize React + Vite
```bash
cd client
npm create vite@latest . -- --template react
```

### 2.2 Install Dependencies
```bash
# Core dependencies
npm install axios react-router-dom lucide-react

# Optional but recommended
npm install framer-motion vite-plugin-pwa

# Dev dependencies for Tailwind
npm install -D tailwindcss @tailwindcss/postcss autoprefixer postcss
```

### 2.3 Create Key Files

**`client/vercel.json`**
```json
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
    ]
}
```

**`client/.env.production.template`**
```bash
VITE_API_URL=https://your-backend.vercel.app
```

**`client/src/api/axios.js`**
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : 'http://localhost:5001/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

---

## Phase 3: Backend Setup (30 mins)

### 3.1 Initialize Node.js
```bash
cd ../server
npm init -y
```

### 3.2 Install Dependencies
```bash
npm install express mongoose cors cookie-parser dotenv \
  passport passport-google-oauth20 jsonwebtoken express-session
```

### 3.3 Update package.json
```json
{
  "type": "commonjs",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  }
}
```

### 3.4 Create Key Files

**`server/vercel.json`**
```json
{
  "version": 2,
  "builds": [
    { "src": "src/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "src/index.js" }
  ],
  "functions": {
    "src/index.js": { "maxDuration": 30 }
  }
}
```

**`server/.env.example`**
```bash
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-jwt-secret-min-32-characters
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3.5 Create Folder Structure
```bash
mkdir -p src/config src/middleware src/models src/routes
touch src/index.js src/config/passport.js src/middleware/auth.js
touch src/models/User.js src/routes/auth.js src/routes/api.js
```

---

## Phase 4: External Services Setup (30 mins)

### 4.1 MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user (save credentials!)
4. Network Access → Add IP `0.0.0.0/0`
5. Get connection string → Replace `<password>` with your password

### 4.2 Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. APIs & Services → OAuth consent screen → Configure
4. APIs & Services → Credentials → Create OAuth 2.0 Client ID
5. Add Authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback`
6. Save Client ID and Client Secret

---

## Phase 5: Vercel Deployment (20 mins)

### 5.1 Push to GitHub
```bash
cd ..  # Back to root
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/my-new-app.git
git push -u origin main
```

### 5.2 Create Frontend Project
1. Vercel Dashboard → New Project
2. Import GitHub repo
3. **Root Directory**: `client`
4. **Framework**: Vite
5. Add Environment Variables:
   - `VITE_API_URL` = (leave empty for now, add after backend deployed)

### 5.3 Create Backend Project
1. Vercel Dashboard → New Project
2. Import SAME GitHub repo
3. **Root Directory**: `server`
4. **Framework**: Other
5. Add ALL Environment Variables from `.env.example`
6. Update `GOOGLE_CALLBACK_URL` with Vercel URL

### 5.4 Post-Deployment
1. Copy backend Vercel URL
2. Update frontend `VITE_API_URL` environment variable
3. Redeploy frontend
4. Add production callback URL to Google OAuth

---

## Phase 6: Testing Checklist

### Local Development
- [ ] Backend starts without errors (`npm run dev` in server/)
- [ ] Frontend starts without errors (`npm run dev` in client/)
- [ ] Can reach `http://localhost:5001/api/health`
- [ ] Google OAuth redirects work locally
- [ ] Cookies are set after login
- [ ] Protected routes work

### Production
- [ ] Both Vercel projects deployed successfully
- [ ] Backend health check works: `https://your-api.vercel.app/api/health`
- [ ] Frontend loads without console errors
- [ ] Google OAuth works end-to-end
- [ ] Cookies are set with `Secure` and `SameSite=None`
- [ ] API calls work from frontend

---

## Quick Reference: Key Code Patterns

### Protected Route Component
```jsx
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
};
```

### Auth Context Pattern
```jsx
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loginWithGoogle = () => {
        window.location.href = `${API_URL}/api/auth/google`;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

### Express Auth Middleware
```javascript
const isAuthenticated = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
```

---

## Estimated Total Time: ~2 hours

| Phase | Time |
|-------|------|
| Initial Setup | 15 mins |
| Frontend Setup | 20 mins |
| Backend Setup | 30 mins |
| External Services | 30 mins |
| Vercel Deployment | 20 mins |
| Testing | 15 mins |

---

*Use this alongside [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanations.*
