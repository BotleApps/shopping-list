import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Check, Trash2, ShoppingCart, ExternalLink, Sparkles, X } from 'lucide-react';

const ShoppingList = () => {
    const [list, setList] = useState(null);
    const [products, setProducts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchList();
        fetchProducts();
    }, []);

    const fetchList = async () => {
        try {
            const response = await api.get('/lists/active');
            setList(response.data);
        } catch (error) {
            console.error('Error fetching list:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleAddItem = async (productId) => {
        try {
            await api.post(`/lists/${list._id}/items`, { productId, quantity: 1 });
            fetchList();
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleTogglePurchased = async (itemId, currentStatus) => {
        try {
            await api.patch(`/lists/${list._id}/items/${itemId}`, { isPurchased: !currentStatus });
            fetchList();
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await api.delete(`/lists/${list._id}/items/${itemId}`);
            fetchList();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const handleClearCompleted = async () => {
        try {
            await api.post(`/lists/${list._id}/clear-completed`);
            fetchList();
        } catch (error) {
            console.error('Error clearing completed:', error);
        }
    };

    const handleAmazonSearch = (itemName) => {
        const query = encodeURIComponent(itemName);
        window.open(`https://www.amazon.in/s?k=${query}`, '_blank');
    };

    const handleAiSuggest = async () => {
        setIsAiModalOpen(true);
        setIsLoadingAi(true);
        try {
            const response = await api.post('/ai/suggest');
            // Enrich suggestions with full product details
            const enrichedSuggestions = response.data.suggestions.map(s => {
                const product = products.find(p => p._id === s.product);
                return { ...s, productDetails: product };
            }).filter(s => s.productDetails); // Filter out any missing products
            setAiSuggestions(enrichedSuggestions);
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            alert('Failed to get suggestions');
            setIsAiModalOpen(false);
        } finally {
            setIsLoadingAi(false);
        }
    };

    const handleAddSuggestion = async (suggestion) => {
        await handleAddItem(suggestion.product);
        setAiSuggestions(prev => prev.filter(s => s.product !== suggestion.product));
        if (aiSuggestions.length <= 1) {
            setIsAiModalOpen(false);
        }
    };

    if (!list) return <div className="p-4 text-center">Loading...</div>;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !list.items.some(item => item.product && item.product._id === p._id)
    );

    return (
        <div className="pb-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My List</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleAiSuggest}
                        className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800"
                    >
                        <Sparkles size={16} />
                        <span>AI Suggest</span>
                    </button>
                    <button
                        onClick={handleClearCompleted}
                        className="text-sm text-gray-500 hover:text-red-500"
                    >
                        Clear Completed
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {list.items.map(item => (
                    <div
                        key={item._id}
                        className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-3 ${item.isPurchased ? 'opacity-60' : ''}`}
                    >
                        <button
                            onClick={() => handleTogglePurchased(item._id, item.isPurchased)}
                            className={`p-1 rounded-full border-2 ${item.isPurchased ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}
                        >
                            <Check size={16} />
                        </button>

                        <div className="flex-1">
                            <p className={`font-medium ${item.isPurchased ? 'line-through' : ''}`}>
                                {item.product ? item.product.name : item.customName}
                            </p>
                            <p className="text-xs text-gray-500">
                                {item.quantity} {item.product ? item.product.unit : 'unit'}
                            </p>
                        </div>

                        <button
                            onClick={() => handleAmazonSearch(item.product ? item.product.name : item.customName)}
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-full"
                            title="Search on Amazon"
                        >
                            <ShoppingCart size={20} />
                        </button>

                        <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-full"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
                {list.items.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        <p>Your list is empty.</p>
                        <p className="text-sm mt-2">Add items or ask AI for suggestions!</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-transform hover:scale-105"
            >
                <Plus size={24} />
            </button>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-xl rounded-t-xl p-6 h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Item</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500"><X size={24} /></button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search master list..."
                            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => handleAddItem(product._id)}
                                    className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex justify-between items-center"
                                >
                                    <span>{product.name}</span>
                                    <Plus size={20} className="text-primary" />
                                </button>
                            ))}
                            {filteredProducts.length === 0 && searchTerm && (
                                <div className="text-center text-gray-500 mt-4">
                                    <p>No matching products found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Suggestions Modal */}
            {isAiModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="text-purple-500" />
                                AI Suggestions
                            </h3>
                            <button onClick={() => setIsAiModalOpen(false)} className="text-gray-500"><X size={24} /></button>
                        </div>

                        {isLoadingAi ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                <p className="text-gray-500">Thinking...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {aiSuggestions.length > 0 ? (
                                    aiSuggestions.map((suggestion, index) => (
                                        <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold">{suggestion.productDetails.name}</h4>
                                                <button
                                                    onClick={() => handleAddSuggestion(suggestion)}
                                                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{suggestion.reason}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500">No suggestions available at the moment.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingList;
