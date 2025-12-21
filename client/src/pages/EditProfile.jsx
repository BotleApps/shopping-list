import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="pb-20">
            <header className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate('/settings')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full touch-target"
                    aria-label="Go back"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">Profile</h1>
            </header>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                        {user?.picture ? (
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    Profile photo managed by Google
                </p>
            </div>

            {/* Profile Information (Read-only since managed by Google) */}
            <div className="space-y-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <div className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                            {user?.name || 'Not available'}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <div className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                            {user?.email || 'Not available'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Linked Account */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Linked Account</h3>
                <div className="w-full flex items-center gap-3 p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <div className="flex-1">
                        <span className="font-medium text-green-700 dark:text-green-400">Connected to Google</span>
                        <p className="text-xs text-green-600 dark:text-green-500">{user?.email}</p>
                    </div>
                    <Shield size={20} className="text-green-500" />
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">About Your Profile</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400/80">
                    Your profile information is managed through your Google account.
                    To update your name or photo, visit your Google Account settings.
                </p>
            </div>
        </div>
    );
};

export default EditProfile;
