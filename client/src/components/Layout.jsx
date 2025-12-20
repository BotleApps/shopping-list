import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, Settings } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/master-list', icon: List, label: 'Master List' },
        { path: '/settings', icon: Settings, label: 'Settings' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <main className="p-4 pb-24 max-w-2xl mx-auto">
                {children}
            </main>

            <nav
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-3 z-50 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
                role="navigation"
                aria-label="Main navigation"
            >
                {navItems.map(({ path, icon: Icon, label }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`flex flex-col items-center px-4 py-1 rounded-xl transition-colors touch-target ${isActive(path)
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        aria-current={isActive(path) ? 'page' : undefined}
                        aria-label={label}
                    >
                        <Icon size={24} aria-hidden="true" />
                        <span className="text-xs mt-1 font-medium">{label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
