import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoadingIndicator = ({ message = "Loading...", fullScreen = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="w-32 h-32">
                <DotLottieReact
                    src="/animations/loading-indicator.lottie"
                    loop
                    autoplay
                />
            </div>
            {message && (
                <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                {content}
            </div>
        );
    }

    return content;
};

export default LoadingIndicator;
