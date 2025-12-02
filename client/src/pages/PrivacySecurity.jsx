import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PrivacySecurity = () => {
    const navigate = useNavigate();
    const { showError } = useToast();

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            showError('Account deletion is not implemented in this demo');
        }
    };

    return (
        <div className="pb-20">
            <header className="mb-6 flex items-center gap-4">
                <button onClick={() => navigate('/settings')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">Privacy & Security</h1>
            </header>

            <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3">
                    <Shield className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="font-bold text-blue-800 dark:text-blue-300">Your account is secure</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            We use industry-standard encryption to protect your data. No suspicious activity detected.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider ml-1">Security</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Protection</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    We implement robust security measures to safeguard your personal information.
                                    All sensitive data is encrypted at rest and in transit. We regularly audit our
                                    systems to ensure your shopping lists and preferences remain private and secure.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider ml-1">Privacy</h3>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                                <Eye size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Data, Your Control</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    We respect your privacy. We do not sell your personal data to third parties.
                                    Your shopping habits are analyzed solely to provide you with smart suggestions
                                    and improve your app experience. You retain full ownership of your data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
                        <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                            <AlertTriangle size={20} /> Danger Zone
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
                            Deleting your account will permanently remove all your lists, preferences, and data. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full py-3 px-4 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacySecurity;
