import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Code, Coffee, Mail } from 'lucide-react';

const About = () => {
    const navigate = useNavigate();

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
                <h1 className="text-2xl font-bold">About</h1>
            </header>

            {/* App Logo & Version */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                    <ShoppingBag size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Shopping List</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Version 1.0.0</p>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Shopping List is a smart, intuitive app designed to simplify your grocery shopping experience.
                    Keep track of your favorite products, create multiple shopping lists, and get AI-powered
                    suggestions based on your shopping habits.
                </p>
            </div>

            {/* Features */}
            <Section title="Features">
                <div className="grid grid-cols-2 gap-3">
                    <FeatureCard emoji="📝" title="Multiple Lists" />
                    <FeatureCard emoji="🤖" title="AI Suggestions" />
                    <FeatureCard emoji="☁️" title="Cloud Sync" />
                    <FeatureCard emoji="🌙" title="Dark Mode" />
                    <FeatureCard emoji="📱" title="PWA Support" />
                    <FeatureCard emoji="🔒" title="Secure Auth" />
                </div>
            </Section>

            {/* Tech Stack */}
            <Section title="Built With">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                        <TechBadge name="React" color="blue" />
                        <TechBadge name="Node.js" color="green" />
                        <TechBadge name="MongoDB" color="emerald" />
                        <TechBadge name="Tailwind CSS" color="cyan" />
                        <TechBadge name="Vercel" color="gray" />
                        <TechBadge name="Google AI" color="purple" />
                    </div>
                </div>
            </Section>

            {/* Credits */}
            <Section title="Made With Love">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-pink-100 dark:border-pink-800">
                    <div className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400 mb-3">
                        <Coffee size={20} />
                        <span className="font-medium">+</span>
                        <Code size={20} />
                        <span className="font-medium">+</span>
                        <Heart size={20} />
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
                        Built with passion for making everyday tasks easier.
                    </p>
                </div>
            </Section>

            {/* Links */}
            <div className="flex flex-col gap-3 mt-8">
                <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Mail size={18} className="text-blue-500" />
                    <span>Send Feedback</span>
                </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-400">
                <p>© 2026 Shopping List App</p>
                <p className="mt-1">All rights reserved</p>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">{title}</h3>
        {children}
    </div>
);

const FeatureCard = ({ emoji, title }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <div className="text-2xl mb-2">{emoji}</div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
    </div>
);

const TechBadge = ({ name, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
        gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
            {name}
        </span>
    );
};

export default About;
