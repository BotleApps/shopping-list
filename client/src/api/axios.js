import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor to add Authorization header as fallback for mobile browsers
// Mobile browsers (especially iOS Safari) may block cross-site cookies
// So we also send the token via Authorization header if available in localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stored token on auth failure
            localStorage.removeItem('auth_token');
            // Redirect to login if unauthorized
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
