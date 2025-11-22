import React from 'react';
import { User, Moon, Globe, ChevronRight, LogOut, Bell, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="pb-20">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">John Doe</h2>
                    <p className="text-gray-500 text-sm">john.doe@example.com</p>
                </div>
            </div>

            <div className="space-y-4">
                <Section title="Preferences">
                    <SettingItem
                        icon={<Moon size={20} />}
                        title="Dark Mode"
                        type="toggle"
                        isActive={theme === 'dark'}
                        onToggle={toggleTheme}
                    />
                    <SettingItem icon={<Globe size={20} />} title="Language" value="English" />
                    <SettingItem icon={<Bell size={20} />} title="Notifications" type="toggle" />
                </Section>

                <Section title="Account">
                    <SettingItem icon={<User size={20} />} title="Edit Profile" />
                    <SettingItem icon={<Shield size={20} />} title="Privacy & Security" />
                </Section>

                <button className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center justify-center gap-2 font-semibold mt-8">
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

const SettingItem = ({ icon, title, value, type, isActive, onToggle }) => (
    <div
        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        onClick={type === 'toggle' && onToggle ? onToggle : undefined}
    >
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            {icon}
            <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
            {value && <span className="text-sm">{value}</span>}
            {type === 'toggle' ? (
                <div className={`w-10 h-6 rounded-full relative transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'right-1' : 'left-1'}`} />
                </div>
            ) : (
                <ChevronRight size={18} />
            )}
        </div>
    </div>
);

export default Settings;
