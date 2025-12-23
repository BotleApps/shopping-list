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

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
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
