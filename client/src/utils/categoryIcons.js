import {
    Apple,
    Milk,
    Croissant,
    Beef,
    Package,
    Cookie,
    Coffee,
    Sparkles,
    Heart,
    ShoppingBag
} from 'lucide-react';

export const categoryIcons = {
    'Fruits & Veggies': Apple,
    'Dairy & Eggs': Milk,
    'Bakery': Croissant,
    'Meat & Seafood': Beef,
    'Pantry': Package,
    'Snacks': Cookie,
    'Beverages': Coffee,
    'Household': Sparkles,
    'Personal Care': Heart,
    'Other': ShoppingBag
};

export const categoryColors = {
    'Fruits & Veggies': 'text-green-600 bg-green-50 dark:bg-green-900/20',
    'Dairy & Eggs': 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    'Bakery': 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    'Meat & Seafood': 'text-red-600 bg-red-50 dark:bg-red-900/20',
    'Pantry': 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    'Snacks': 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    'Beverages': 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
    'Household': 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    'Personal Care': 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
    'Other': 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
};

export const getCategoryIcon = (category) => {
    return categoryIcons[category] || categoryIcons['Other'];
};

export const getCategoryColor = (category) => {
    return categoryColors[category] || categoryColors['Other'];
};
