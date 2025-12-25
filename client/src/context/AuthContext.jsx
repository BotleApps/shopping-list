import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check authentication status on mount
    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);

            // Add timeout to prevent infinite loading (30 seconds for cold starts)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await api.get('/auth/status', {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.data.authenticated) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
                console.error('Auth check timed out');
            } else {
                console.error('Auth check failed:', err);
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Check for auth success parameter in URL first
        const params = new URLSearchParams(window.location.search);
        const authSuccess = params.get('auth') === 'success';
        const tokenFromUrl = params.get('token');

        // If we have a token in the URL (fallback for mobile browsers that block cookies)
        // Store it in localStorage for future requests
        if (authSuccess && tokenFromUrl) {
            console.log('Received token via URL fallback (mobile browser cookie workaround)');
            localStorage.setItem('auth_token', tokenFromUrl);
        }

        if (authSuccess) {
            // Remove the query parameters (token and auth)
            window.history.replaceState({}, '', window.location.pathname);
        }

        // Then check auth status
        checkAuth();
    }, [checkAuth]);

    // Login with Google - redirects to backend OAuth
    const loginWithGoogle = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.location.href = `${apiUrl}/api/auth/google`;
    };

    // Logout - completely signs out from Google to allow account selection on next login
    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            // Clear localStorage token (used as fallback for mobile browsers)
            localStorage.removeItem('auth_token');
            // Redirect to Google's logout URL to completely sign out from Google
            // This forces users to re-authenticate and choose an account on next login
            window.location.href = 'https://accounts.google.com/logout?continue=https://accounts.google.com/AccountChooser?continue=' + encodeURIComponent(window.location.origin + '/login');
        } catch (err) {
            console.error('Logout failed:', err);
            // Still clear user state even if API call fails
            setUser(null);
            // Clear localStorage token
            localStorage.removeItem('auth_token');
            window.location.href = 'https://accounts.google.com/logout?continue=https://accounts.google.com/AccountChooser?continue=' + encodeURIComponent(window.location.origin + '/login');
        }
    };

    // Get current user
    const getCurrentUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            return response.data;
        } catch (err) {
            setUser(null);
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        loginWithGoogle,
        logout,
        getCurrentUser,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
