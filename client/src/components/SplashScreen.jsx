import React from 'react';
import { ShoppingBag } from 'lucide-react';

const SplashScreen = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center z-50">
            {/* App Icon */}
            <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-purple-500/30 flex items-center justify-center animate-pulse">
                    <ShoppingBag size={48} className="text-white" />
                </div>
                {/* Animated ring */}
                <div className="absolute inset-0 -m-2 rounded-3xl border-4 border-purple-400/30 animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            {/* App Name */}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Shopping List
            </h1>

            {/* Loading indicator */}
            <div className="flex items-center gap-2 mt-4">
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>

            {/* Message */}
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                {message}
            </p>
        </div>
    );
};

export default SplashScreen;
