import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ShoppingBag, List, Sparkles, Cloud, Moon, HelpCircle, MessageCircle } from 'lucide-react';

const Help = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            category: 'Getting Started',
            icon: <ShoppingBag size={20} />,
            questions: [
                {
                    q: 'How do I create a new shopping list?',
                    a: 'From the Home screen, tap the "New List" button in the top right corner. Enter a name for your list and tap "Create". You can create as many lists as you need for different occasions.'
                },
                {
                    q: 'How do I add items to my shopping list?',
                    a: 'Open a shopping list and use the search bar at the top to find items from your Master List, or tap "Add Custom Item" to add a new item. You can also use AI suggestions to quickly add commonly purchased items.'
                },
                {
                    q: 'What is the Master List?',
                    a: 'The Master List is your personal product catalog. It stores all the products you frequently buy, including their categories, brands, and notes. When you add items to a shopping list, they come from your Master List.'
                }
            ]
        },
        {
            category: 'Managing Products',
            icon: <List size={20} />,
            questions: [
                {
                    q: 'How do I add a new product to my Master List?',
                    a: 'Go to the Master List tab and tap the "+" button. Fill in the product details like name, category, brand, and any notes. The product will be saved and available for all your future shopping lists.'
                },
                {
                    q: 'Can I edit or delete products?',
                    a: 'Yes! In the Master List, swipe left on any product to reveal the edit and delete options. You can update product details or remove products you no longer need.'
                },
                {
                    q: 'How do I organize products by category?',
                    a: 'When creating or editing a product, select a category. Your products will automatically be grouped by category in both the Master List and your shopping lists for easier navigation.'
                }
            ]
        },
        {
            category: 'AI Features',
            icon: <Sparkles size={20} />,
            questions: [
                {
                    q: 'What are AI suggestions?',
                    a: 'AI suggestions analyze your shopping patterns and recommend items you might want to add to your list. The more you use the app, the smarter the suggestions become!'
                },
                {
                    q: 'How accurate are the AI suggestions?',
                    a: 'The AI learns from your actual purchases and preferences. Over time, it becomes more accurate at predicting what you need. You can always dismiss suggestions that are not relevant.'
                }
            ]
        },
        {
            category: 'Sync & Account',
            icon: <Cloud size={20} />,
            questions: [
                {
                    q: 'Is my data synced across devices?',
                    a: 'Yes! Your shopping lists and Master List are automatically synced to the cloud. Sign in with the same Google account on any device to access your lists.'
                },
                {
                    q: 'Can I use the app offline?',
                    a: 'The app works best with an internet connection, but you can view your cached lists offline. Any changes you make will sync automatically when you\'re back online.'
                },
                {
                    q: 'How do I switch accounts?',
                    a: 'Go to Settings and tap "Log Out". You\'ll be completely signed out of your Google account and can then sign in with a different account.'
                }
            ]
        },
        {
            category: 'App Settings',
            icon: <Moon size={20} />,
            questions: [
                {
                    q: 'How do I enable dark mode?',
                    a: 'Go to Settings and toggle "Dark Mode" on. The app will switch to a darker color scheme that\'s easier on your eyes in low-light conditions.'
                },
                {
                    q: 'How do I archive a list?',
                    a: 'On the Home screen, tap the archive icon on any list to move it to your archived lists. Archived lists are kept for reference but won\'t clutter your active lists view. You can restore them anytime.'
                }
            ]
        }
    ];

    const toggleFaq = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setOpenFaq(openFaq === key ? null : key);
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
                <h1 className="text-2xl font-bold">Help & FAQ</h1>
            </header>

            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <HelpCircle size={28} />
                    <h2 className="text-xl font-bold">How can we help?</h2>
                </div>
                <p className="text-blue-100 text-sm">
                    Find answers to common questions about using Shopping List.
                    Browse the categories below or contact us if you need more help.
                </p>
            </div>

            {/* FAQ Categories */}
            <div className="space-y-4">
                {faqs.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                            <div className="text-blue-600 dark:text-blue-400">
                                {category.icon}
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">{category.category}</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {category.questions.map((faq, questionIndex) => {
                                const isOpen = openFaq === `${categoryIndex}-${questionIndex}`;
                                return (
                                    <div key={questionIndex}>
                                        <button
                                            onClick={() => toggleFaq(categoryIndex, questionIndex)}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <span className="font-medium text-gray-700 dark:text-gray-200 pr-4">{faq.q}</span>
                                            <ChevronDown
                                                size={20}
                                                className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <p className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                    <MessageCircle size={24} className="text-green-500" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">Still need help?</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Can't find what you're looking for? We're happy to help!
                </p>
                <button
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    onClick={() => window.location.href = 'mailto:support@shoppinglist.app'}
                >
                    Contact Support
                </button>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">💡 Quick Tips</h4>
                <ul className="text-sm text-yellow-600 dark:text-yellow-400/80 space-y-1">
                    <li>• Swipe left on items in your list to mark them as purchased</li>
                    <li>• Use categories to keep your Master List organized</li>
                    <li>• Archive completed lists to keep your home screen tidy</li>
                </ul>
            </div>
        </div>
    );
};

export default Help;
