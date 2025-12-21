import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Download, Trash2, Lock, Eye, Database, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PrivacySecurity = () => {
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

            {/* How We Protect Your Data */}
            <Section title="How We Protect Your Data">
                <InfoCard
                    icon={<Lock size={20} />}
                    title="Encrypted Connection"
                    description="All data transmitted between your device and our servers is encrypted using HTTPS/TLS."
                />
                <InfoCard
                    icon={<Database size={20} />}
                    title="Secure Storage"
                    description="Your shopping lists and products are stored in a secure MongoDB database with industry-standard encryption."
                />
                <InfoCard
                    icon={<Shield size={20} />}
                    title="Google Authentication"
                    description="We use Google's secure OAuth 2.0 for authentication. We never store your Google password."
                />
                <InfoCard
                    icon={<Eye size={20} />}
                    title="Data Isolation"
                    description="Your data is completely private. Only you can access your shopping lists and products."
                />
            </Section>

            {/* Data We Collect */}
            <Section title="Data We Collect">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span><strong>Profile Information:</strong> Name, email, and profile picture from your Google account</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span><strong>Shopping Lists:</strong> Lists you create and items you add</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span><strong>Product Catalog:</strong> Products you save to your master list</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✗</span>
                            <span><strong>We don't collect:</strong> Location data, browsing history, or any data from other apps</span>
                        </li>
                    </ul>
                </div>
            </Section>

            {/* Your Rights */}
            <Section title="Your Rights">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="flex items-center gap-3">
                        <Download size={20} className="text-blue-500" />
                        <div>
                            <p className="font-medium">Export Your Data</p>
                            <p className="text-sm text-gray-500">Download all your shopping lists and products</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Trash2 size={20} className="text-red-500" />
                        <div>
                            <p className="font-medium">Delete Your Account</p>
                            <p className="text-sm text-gray-500">Permanently remove all your data from our servers</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Contact */}
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Questions about your privacy?</p>
                <p className="mt-1">Contact us at <span className="text-blue-500">privacy@shoppinglist.app</span></p>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{title}</h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

const InfoCard = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-3">
        <div className="text-blue-500 mt-0.5">{icon}</div>
        <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </div>
);

export default PrivacySecurity;
