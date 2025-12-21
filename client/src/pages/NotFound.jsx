import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, ShoppingBag } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                {/* Animated 404 Illustration */}
                <div className="relative mb-8">
                    <div className="text-9xl font-bold text-blue-100 dark:text-gray-800 select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 shadow-xl animate-bounce">
                            <ShoppingBag size={48} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                    Oops! Page not found
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Looks like this page went shopping and never came back!
                    Let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/30 transition-all"
                    >
                        <Home size={20} />
                        Go Home
                    </button>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Or try one of these:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <QuickLink label="Shopping Lists" path="/" />
                        <QuickLink label="Master List" path="/master-list" />
                        <QuickLink label="Settings" path="/settings" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickLink = ({ label, path }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(path)}
            className="px-4 py-2 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
            {label}
        </button>
    );
};

export default NotFound;
