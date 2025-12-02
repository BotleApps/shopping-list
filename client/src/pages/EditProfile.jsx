import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, User, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const EditProfile = () => {
    const navigate = useNavigate();
    const { showSuccess } = useToast();
    const [formData, setFormData] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically call the API to update profile
        showSuccess('Profile updated successfully');
        setTimeout(() => navigate('/settings'), 1000);
    };

    return (
        <div className="pb-20">
            <header className="mb-6 flex items-center gap-4">
                <button onClick={() => navigate('/settings')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">Edit Profile</h1>
            </header>

            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary-dark transition-colors">
                        <Camera size={16} />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Linked Accounts</h3>
                    <button type="button" className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="font-medium">Connect with Google</span>
                    </button>
                </div>

                <button type="submit" className="w-full bg-primary text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-98 transition-all">
                    <Save size={20} />
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditProfile;
