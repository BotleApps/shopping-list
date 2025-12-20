import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Moon, Globe, ChevronRight, LogOut, Bell, Shield, HelpCircle, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const Settings = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { showInfo } = useToast();
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        return localStorage.getItem('notifications') === 'true';
    });

    const handleNotificationToggle = () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        localStorage.setItem('notifications', newValue.toString());
        showInfo(newValue ? 'Notifications enabled' : 'Notifications disabled');
    };

    const handleLogout = () => {
        showInfo('Logout functionality coming soon!');
    };

    return (
        <div className="pb-20">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    U
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold">User</h2>
                    <p className="text-gray-500 text-sm">Manage your profile</p>
                </div>
                <button
                    onClick={() => navigate('/settings/profile')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-target"
                    aria-label="Edit profile"
                >
                    <ChevronRight size={20} className="text-gray-400" />
                </button>
            </div>

            <div className="space-y-4">
                <Section title="Preferences">
                    <SettingItem
                        icon={<Moon size={20} />}
                        title="Dark Mode"
                        description="Reduce eye strain in low light"
                        type="toggle"
                        isActive={theme === 'dark'}
                        onToggle={toggleTheme}
                    />
                    <SettingItem
                        icon={<Globe size={20} />}
                        title="Language"
                        value="English"
                        description="App display language"
                    />
                    <SettingItem
                        icon={<Bell size={20} />}
                        title="Notifications"
                        description="Get reminders for low stock items"
                        type="toggle"
                        isActive={notificationsEnabled}
                        onToggle={handleNotificationToggle}
                    />
                </Section>

                <Section title="Account">
                    <SettingItem
                        icon={<User size={20} />}
                        title="Edit Profile"
                        description="Update your personal information"
                        onClick={() => navigate('/settings/profile')}
                    />
                    <SettingItem
                        icon={<Shield size={20} />}
                        title="Privacy & Security"
                        description="Manage your data and security settings"
                        onClick={() => navigate('/settings/security')}
                    />
                </Section>

                <Section title="Support">
                    <SettingItem
                        icon={<HelpCircle size={20} />}
                        title="Help & FAQ"
                        description="Get answers to common questions"
                        onClick={() => showInfo('Help center coming soon!')}
                    />
                    <SettingItem
                        icon={<Info size={20} />}
                        title="About"
                        description="Version 1.0.0"
                        onClick={() => showInfo('Shopping List App v1.0.0')}
                    />
                </Section>

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center justify-center gap-2 font-semibold mt-8 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors touch-target"
                    aria-label="Log out"
                >
                    <LogOut size={20} />
                    Log Out
                </button>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div>
        <h3 className="text-gray-500 font-semibold mb-2 ml-1 uppercase text-xs tracking-wider">{title}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm divide-y dark:divide-gray-700">
            {children}
        </div>
    </div>
);

const SettingItem = ({ icon, title, description, value, type, isActive, onToggle, onClick }) => (
    <div
        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        onClick={type === 'toggle' && onToggle ? onToggle : onClick}
        role={type === 'toggle' ? 'switch' : 'button'}
        aria-checked={type === 'toggle' ? isActive : undefined}
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (type === 'toggle' && onToggle) {
                    onToggle();
                } else if (onClick) {
                    onClick();
                }
            }
        }}
    >
        <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <span className="font-medium text-gray-800 dark:text-gray-100 block">{title}</span>
                {description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">{description}</span>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400 flex-shrink-0 ml-2">
            {value && <span className="text-sm">{value}</span>}
            {type === 'toggle' ? (
                <div
                    className={`w-12 h-7 rounded-full relative transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    aria-hidden="true"
                >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${isActive ? 'right-1' : 'left-1'}`} />
                </div>
            ) : (
                <ChevronRight size={18} />
            )}
        </div>
    </div>
);

export default Settings;
