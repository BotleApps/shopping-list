import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';

const Login = () => {
    const { loginWithGoogle, isAuthenticated } = useAuth();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check for error in URL params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorType = params.get('error');
        const errorMessage = params.get('message');

        if (errorType) {
            // Clean the URL
            window.history.replaceState({}, '', '/login');

            // Set user-friendly error message
            if (errorMessage?.includes('timeout') || errorMessage?.includes('buffering')) {
                setError({
                    title: 'Connection Slow',
                    message: 'The server is warming up. Please try again in a moment.',
                    canRetry: true
                });
            } else if (errorType === 'auth_failed') {
                setError({
                    title: 'Authentication Failed',
                    message: 'Could not sign in with Google. Please try again.',
                    canRetry: true
                });
            } else {
                setError({
                    title: 'Something Went Wrong',
                    message: errorMessage || 'Please try signing in again.',
                    canRetry: true
                });
            }
        }
    }, []);

    // If already authenticated, redirect to home
    if (isAuthenticated) {
        window.location.href = '/';
        return null;
    }

    const handleLogin = () => {
        setError(null);
        setIsLoading(true);
        loginWithGoogle();
    };

    const handleRetry = async () => {
        setIsLoading(true);
        setError(null);

        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 500));

        loginWithGoogle();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and App Name */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <ShoppingBag size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Shopping List</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Organize your shopping, simplify your life</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <h3 className="font-semibold text-orange-700 dark:text-orange-400">{error.title}</h3>
                                <p className="text-sm text-orange-600 dark:text-orange-400/80 mt-1">{error.message}</p>
                            </div>
                        </div>
                        {error.canRetry && (
                            <button
                                onClick={handleRetry}
                                disabled={isLoading}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 py-2 rounded-lg font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                {isLoading ? 'Connecting...' : 'Try Again'}
                            </button>
                        )}
                    </div>
                )}

                {/* Login Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-2">
                        Welcome!
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
                        Sign in to access your shopping lists and AI-powered suggestions.
                    </p>

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl px-6 py-4 text-white font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw size={20} className="animate-spin" />
                                <span>Connecting...</span>
                            </>
                        ) : (
                            <>
                                {/* Google Icon SVG */}
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path
                                        fill="#ffffff"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#ffffff"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#ffffff"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#ffffff"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    {/* Terms */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
