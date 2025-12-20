import React from 'react';
import { ShoppingBag, Package, ListChecks, Sparkles } from 'lucide-react';

const illustrations = {
    lists: ShoppingBag,
    products: Package,
    items: ListChecks,
    ai: Sparkles
};

const EmptyState = ({
    type = 'lists',
    title,
    description,
    actionLabel,
    onAction,
    showTips = false
}) => {
    const Icon = illustrations[type] || ShoppingBag;

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6 animate-pulse">
                <Icon size={40} className="text-blue-500 dark:text-blue-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {title}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                {description}
            </p>

            {onAction && actionLabel && (
                <button
                    onClick={onAction}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all active:scale-95"
                >
                    {actionLabel}
                </button>
            )}

            {showTips && (
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 max-w-sm">
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">💡 Quick Tip</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        Start by adding products to your Master List. Then create shopping lists and add items from your master list for quick, organized shopping!
                    </p>
                </div>
            )}
        </div>
    );
};

export default EmptyState;
