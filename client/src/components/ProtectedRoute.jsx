import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashScreen from './SplashScreen';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, checkAuth } = useAuth();
    const location = useLocation();
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 2;

    // Check if we have a stored token (mobile browser fallback)
    const hasStoredToken = typeof window !== 'undefined' && localStorage.getItem('auth_token');

    // If we have a token but auth failed, retry (handles race conditions)
    useEffect(() => {
        if (!loading && hasStoredToken && !isAuthenticated && retryCount < maxRetries) {
            console.log(`[ProtectedRoute] Token exists but not authenticated, retry ${retryCount + 1}/${maxRetries}`);
            const timer = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                checkAuth();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, hasStoredToken, isAuthenticated, retryCount, checkAuth]);

    if (loading) {
        return <SplashScreen message="Getting things ready..." />;
    }

    // If we have a token but not authenticated yet, and haven't exhausted retries
    if (hasStoredToken && !isAuthenticated && retryCount < maxRetries) {
        return <SplashScreen message="Signing you in..." />;
    }

    if (!isAuthenticated) {
        // Clear any invalid token before redirecting
        if (hasStoredToken) {
            console.log('[ProtectedRoute] Token invalid or expired, clearing');
            localStorage.removeItem('auth_token');
        }
        // Save the attempted location for redirect after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
