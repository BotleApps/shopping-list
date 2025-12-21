import React from 'react';
import { AlertTriangle, Info, Trash2, LogOut } from 'lucide-react';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // 'danger', 'warning', 'info'
    icon = null,
    isLoading = false
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            buttonBg: 'bg-red-600 hover:bg-red-700',
            defaultIcon: <Trash2 size={24} />
        },
        warning: {
            iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
            defaultIcon: <AlertTriangle size={24} />
        },
        info: {
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            buttonBg: 'bg-blue-600 hover:bg-blue-700',
            defaultIcon: <Info size={24} />
        },
        logout: {
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            iconColor: 'text-orange-600 dark:text-orange-400',
            buttonBg: 'bg-orange-600 hover:bg-orange-700',
            defaultIcon: <LogOut size={24} />
        }
    };

    const config = typeConfig[type] || typeConfig.danger;
    const displayIcon = icon || config.defaultIcon;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && !isLoading && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-in">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${config.iconBg}`}>
                        <div className={config.iconColor}>
                            {displayIcon}
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${config.buttonBg}`}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
