import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Download, Trash2, Lock, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PrivacySecurity = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { showInfo, showError } = useToast();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleExportData = () => {
        showInfo('Data export will be available soon!');
    };

    const handleDeleteAccount = async () => {
        // In production, this would call an API to delete the account
        showInfo('Account deletion will be available soon. Please contact support.');
        setShowDeleteConfirm(false);
    };

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
                <h1 className="text-2xl font-bold">Privacy & Security</h1>
            </header>

            {/* Security Status */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Shield size={24} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h4 className="font-medium text-green-700 dark:text-green-400">Account Secured</h4>
                        <p className="text-sm text-green-600 dark:text-green-400/80">
                            Your account is protected with Google Sign-In
                        </p>
                    </div>
                </div>
            </div>

            {/* Security Features */}
            <div className="space-y-6">
                <Section title="Authentication">
                    <SettingRow
                        icon={<Lock size={20} />}
                        title="Google Sign-In"
                        description={`Signed in as ${user?.email || 'unknown'}`}
                        badge="Active"
                        badgeColor="green"
                    />
                </Section>

                <Section title="Data Privacy">
                    <SettingRow
                        icon={<Eye size={20} />}
                        title="Data Storage"
                        description="Your data is securely stored in the cloud"
                    />
                    <SettingRow
                        icon={<Download size={20} />}
                        title="Export My Data"
                        description="Download a copy of your shopping lists and products"
                        onClick={handleExportData}
                        actionable
                    />
                </Section>

                <Section title="Account Management">
                    <div
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => setShowDeleteConfirm(true)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-red-500">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <span className="font-medium text-red-600 dark:text-red-400 block">Delete Account</span>
                                <span className="text-xs text-red-500/80">Permanently delete your account and all data</span>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm animate-scale-in">
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold">Delete Account?</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This action cannot be undone. All your shopping lists, products, and preferences will be permanently deleted.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Section = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{title}</h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const SettingRow = ({ icon, title, description, badge, badgeColor, onClick, actionable }) => (
    <div
        className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${actionable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''} transition-colors`}
        onClick={onClick}
        role={actionable ? 'button' : undefined}
        tabIndex={actionable ? 0 : undefined}
    >
        <div className="flex items-center gap-3">
            <div className="text-gray-500 dark:text-gray-400">
                {icon}
            </div>
            <div>
                <span className="font-medium text-gray-800 dark:text-gray-100 block">{title}</span>
                {description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
                )}
            </div>
        </div>
        {badge && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColor === 'green'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                {badge}
            </span>
        )}
    </div>
);

export default PrivacySecurity;
