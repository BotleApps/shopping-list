import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Check, Trash2, ShoppingCart, ExternalLink, Sparkles, X, ArrowLeft, ArrowUpDown } from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';

const ShoppingList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [list, setList] = useState(null);
    const [products, setProducts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortByCategory, setSortByCategory] = useState(false);

    useEffect(() => {
        if (id) {
            fetchList(id);
        }
        fetchProducts();
    }, [id]);

    const fetchList = async (listId) => {
        try {
            const response = await api.get(`/lists/${listId}`);
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
            // Refresh current list
            const response = await api.get(`/lists/${list._id}`);
            setList(response.data);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await api.patch(`/lists/${list._id}/items/${itemId}`, { quantity: newQuantity });
            const response = await api.get(`/lists/${list._id}`);
            setList(response.data);
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleTogglePurchased = async (itemId, currentStatus) => {
        try {
            await api.patch(`/lists/${list._id}/items/${itemId}`, { isPurchased: !currentStatus });
            const response = await api.get(`/lists/${list._id}`);
            setList(response.data);
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this item from the list?')) {
            return;
        }
        try {
            await api.delete(`/lists/${list._id}/items/${itemId}`);
            const response = await api.get(`/lists/${list._id}`);
            setList(response.data);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const handleClearCompleted = async () => {
        if (!window.confirm('Clear all completed items from this list?')) {
            return;
        }
        try {
            await api.post(`/lists/${list._id}/clear-completed`);
            const response = await api.get(`/lists/${list._id}`);
            setList(response.data);
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
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.alias && p.alias.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        !list.items.some(item => item.product && item.product._id === p._id)
    );

    // Group items by category
    const groupByCategory = (items) => {
        const grouped = {};
        items.forEach(item => {
            const category = item.product?.category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        return grouped;
    };

    const displayItems = sortByCategory ? groupByCategory(list.items) : { 'All Items': list.items };

    return (
        <div className="pb-20">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold">{list.name}</h2>
                <div className="flex-1" />
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortByCategory(!sortByCategory)}
                        className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full border transition-colors ${sortByCategory
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <ArrowUpDown size={16} />
                        <span className="hidden sm:inline">Sort</span>
                    </button>
                    <button
                        onClick={handleAiSuggest}
                        className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800"
                    >
                        <Sparkles size={16} />
                        <span className="hidden sm:inline">AI Suggest</span>
                    </button>
                    <button
                        onClick={handleClearCompleted}
                        className="text-sm text-gray-500 hover:text-red-500 hidden sm:block"
                    >
                        Clear Completed
                    </button>
                </div>
            </div>

            {Object.entries(displayItems).map(([category, items]) => (
                <div key={category} className="mb-6">
                    {sortByCategory && (
                        <div className="flex items-center gap-2 mb-3 px-1">
                            {(() => {
                                const CategoryIcon = getCategoryIcon(category);
                                const colorClass = getCategoryColor(category);
                                return (
                                    <>
                                        <div className={`p-2 rounded-lg ${colorClass}`}>
                                            <CategoryIcon size={18} />
                                        </div>
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">{category}</h3>
                                        <span className="text-xs text-gray-500">({items.length})</span>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                    <div className="space-y-3">
                        {items.map(item => (
                            <div
                                key={item._id}
                                className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${item.isPurchased ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => handleTogglePurchased(item._id, item.isPurchased)}
                                        className={`mt-1 p-1 rounded-full border-2 transition-all ${item.isPurchased ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-green-500'}`}
                                    >
                                        <Check size={16} />
                                    </button>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <p className={`font-semibold text-lg ${item.isPurchased ? 'line-through' : ''}`}>
                                                    {item.product ? item.product.name : item.customName}
                                                </p>
                                                {item.product?.alias && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                        {item.product.alias}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleAmazonSearch(item.product ? item.product.name : item.customName)}
                                                    className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                                    title="Search on Amazon"
                                                >
                                                    <ShoppingCart size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs items-center">
                                            <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full overflow-hidden">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                    className="px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    −
                                                </button>
                                                <span className="px-2 py-1 font-medium">
                                                    {item.quantity} {item.product ? item.product.unit : 'unit'}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                    className="px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {item.product?.category && (
                                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                                    {item.product.category}
                                                </span>
                                            )}
                                            {item.product?.consumptionDuration && (
                                                <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full">
                                                    Lasts {item.product.consumptionDuration * item.quantity} days
                                                </span>
                                            )}
                                        </div>

                                        {item.product?.notes && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                                Note: {item.product.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <div className="text-center text-gray-500 py-10">
                                <p>No items in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-all"
            >
                <Plus size={24} />
            </button>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-xl rounded-t-xl p-6 h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add Item</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"><X size={24} /></button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search master list..."
                            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => handleAddItem(product._id)}
                                    className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            {product.alias && (
                                                <p className="text-xs text-gray-500 italic">{product.alias}</p>
                                            )}
                                        </div>
                                        <Plus size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex flex-wrap gap-1 text-xs mt-2">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            {product.category}
                                        </span>
                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                            {product.defaultQuantity} {product.unit}
                                        </span>
                                    </div>
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
