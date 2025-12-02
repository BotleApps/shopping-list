import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, Settings } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <main className="p-4 pb-24">
                {children}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-4 z-50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-primary' : 'text-gray-400'}`}>
                    <Home size={24} />
                    <span className="text-xs mt-1 font-medium">Home</span>
                </Link>
                <Link to="/master-list" className={`flex flex-col items-center ${isActive('/master-list') ? 'text-primary' : 'text-gray-400'}`}>
                    <List size={24} />
                    <span className="text-xs mt-1 font-medium">Master List</span>
                </Link>
                <Link to="/settings" className={`flex flex-col items-center ${isActive('/settings') ? 'text-primary' : 'text-gray-400'}`}>
                    <Settings size={24} />
                    <span className="text-xs mt-1 font-medium">Settings</span>
                </Link>
            </nav>
        </div>
    );
};

export default Layout;
