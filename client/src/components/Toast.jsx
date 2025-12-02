import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-green-500" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />
    };

    const bgColors = {
        success: 'bg-white dark:bg-gray-800 border-green-500',
        error: 'bg-white dark:bg-gray-800 border-red-500',
        info: 'bg-white dark:bg-gray-800 border-blue-500'
    };

    return (
        <div className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border-l-4 ${bgColors[type]} animate-slide-up transition-all duration-300`}>
            {icons[type]}
            <p className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">{message}</p>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
