import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Check, Trash2, ShoppingCart, Sparkles, X, ArrowLeft, ArrowUpDown, MoreVertical, ListFilter } from 'lucide-react';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryIcons';
import { getRunOutPrediction } from '../utils/dateHelpers';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import SwipeableItem from '../components/SwipeableItem';
import Confetti from '../components/Confetti';
import { useToast } from '../context/ToastContext';

const ShoppingList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError, showInfo, showWithUndo } = useToast();
    const [list, setList] = useState(null);
    const [products, setProducts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default'); // default, category, alpha, purchased
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [quickAddText, setQuickAddText] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [addingItemId, setAddingItemId] = useState(null); // Track which item is being added
    const [isQuickAdding, setIsQuickAdding] = useState(false);
    const prevProgressRef = useRef(0);
    const quickAddRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchList(id);
        }
        fetchProducts();
    }, [id]);

    // Check for 100% completion
    useEffect(() => {
        if (list) {
            const totalItems = list.items.length;
            const purchasedItems = list.items.filter(i => i.isPurchased).length;
            const currentProgress = totalItems === 0 ? 0 : (purchasedItems / totalItems) * 100;

            // Trigger confetti when reaching 100% (and we weren't at 100% before)
            if (currentProgress === 100 && prevProgressRef.current < 100 && totalItems > 0) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 100);
            }

            prevProgressRef.current = currentProgress;
        }
    }, [list]);

    const fetchList = async (listId) => {
        try {
            const response = await api.get(`/lists/${listId}`);
            setList(response.data);
        } catch (error) {
            console.error('Error fetching list:', error);
            showError('Failed to load shopping list');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            showError('Failed to load products');
        }
    };

    const handleAddItem = async (productId) => {
        if (addingItemId) return; // Prevent double-clicks
        setAddingItemId(productId);
        try {
            await api.post(`/lists/${list._id}/items`, { productId, quantity: 1 });
            const response = await api.get(`/lists/${list._id}`);
            setList(response.data);
            setIsAddModalOpen(false);
            showSuccess('Item added to list');
        } catch (error) {
            console.error('Error adding item:', error);
            showError('Failed to add item');
        } finally {
            setAddingItemId(null);
        }
    };

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!quickAddText.trim()) return;

        // Check if the text matches an existing product
        const matchingProduct = products.find(p =>
            p.name.toLowerCase() === quickAddText.toLowerCase() ||
            (p.alias && p.alias.toLowerCase() === quickAddText.toLowerCase())
        );

        if (matchingProduct) {
            await handleAddItem(matchingProduct._id);
        } else {
            // Add as custom item
            try {
                await api.post(`/lists/${list._id}/items`, { customName: quickAddText.trim(), quantity: 1 });
                const response = await api.get(`/lists/${list._id}`);
                setList(response.data);
                showSuccess('Custom item added');
            } catch (error) {
                console.error('Error adding custom item:', error);
                showError('Failed to add item');
            }
        }
        setQuickAddText('');
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await api.patch(`/lists/${list._id}/items/${itemId}`, { quantity: newQuantity });
            const response = await api.get(`/lists/${list._id}`);
            setList(response.data);
        } catch (error) {
            console.error('Error updating quantity:', error);
            showError('Failed to update quantity');
        }
    };

    const handleTogglePurchased = async (itemId, currentStatus) => {
        // Optimistic update
        setList(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item._id === itemId ? { ...item, isPurchased: !currentStatus } : item
            )
        }));

        try {
            await api.patch(`/lists/${list._id}/items/${itemId}`, { isPurchased: !currentStatus });
            const response = await api.get(`/lists/${list._id}`);
            setList(response.data);
        } catch (error) {
            console.error('Error updating item:', error);
            showError('Failed to update item status');
            fetchList(id); // Revert on error
        }
    };

    const handleRemoveItem = async (itemId) => {
        const removedItem = list.items.find(i => i._id === itemId);

        // Optimistic update
        setList(prev => ({
            ...prev,
            items: prev.items.filter(item => item._id !== itemId)
        }));

        try {
            await api.delete(`/lists/${list._id}/items/${itemId}`);
            showWithUndo('Item removed', async () => {
                // Undo: re-add the item
                try {
                    if (removedItem.product) {
                        await api.post(`/lists/${list._id}/items`, {
                            productId: removedItem.product._id,
                            quantity: removedItem.quantity
                        });
                    } else {
                        await api.post(`/lists/${list._id}/items`, {
                            customName: removedItem.customName,
                            quantity: removedItem.quantity
                        });
                    }
                    fetchList(id);
                } catch (err) {
                    showError('Failed to restore item');
                }
            });
        } catch (error) {
            console.error('Error removing item:', error);
            showError('Failed to remove item');
            fetchList(id); // Revert on error
        }
    };

    const handleClearCompleted = async () => {
        const completedItems = list.items.filter(i => i.isPurchased);
        if (completedItems.length === 0) {
            showInfo('No completed items to clear');
            return;
        }

        // Optimistic update
        setList(prev => ({
            ...prev,
            items: prev.items.filter(item => !item.isPurchased)
        }));

        try {
            await api.post(`/lists/${list._id}/clear-completed`);
            showWithUndo(`${completedItems.length} item(s) cleared`, async () => {
                // Undo would require re-adding all items - for simplicity, just refresh
                fetchList(id);
            });
        } catch (error) {
            console.error('Error clearing completed:', error);
            showError('Failed to clear completed items');
            fetchList(id); // Revert on error
        }
        setShowActionsMenu(false);
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
            const enrichedSuggestions = response.data.suggestions.map(s => {
                const product = products.find(p => p._id === s.product);
                return { ...s, productDetails: product };
            }).filter(s => s.productDetails);
            setAiSuggestions(enrichedSuggestions);
            showInfo('AI suggestions generated!');
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            showError('Failed to get AI suggestions');
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

    // Sorting logic
    const sortItems = (items) => {
        const sorted = [...items];
        switch (sortBy) {
            case 'category':
                sorted.sort((a, b) => {
                    const catA = a.product?.category || 'Other';
                    const catB = b.product?.category || 'Other';
                    return catA.localeCompare(catB);
                });
                break;
            case 'alpha':
                sorted.sort((a, b) => {
                    const nameA = a.product?.name || a.customName || '';
                    const nameB = b.product?.name || b.customName || '';
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'purchased':
                sorted.sort((a, b) => {
                    if (a.isPurchased === b.isPurchased) return 0;
                    return a.isPurchased ? 1 : -1;
                });
                break;
            default:
                break;
        }
        return sorted;
    };

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

    if (!list) return <LoadingIndicator fullScreen message="Loading list..." />;

    const filteredProducts = products.filter(p =>
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.alias && p.alias.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        !list.items.some(item => item.product && item.product._id === p._id)
    );

    const sortedItems = sortItems(list.items);
    const displayItems = sortBy === 'category' ? groupByCategory(sortedItems) : { 'All Items': sortedItems };
    const completedCount = list.items.filter(i => i.isPurchased).length;
    const totalItems = list.items.length;
    const progress = totalItems === 0 ? 0 : (completedCount / totalItems) * 100;

    const aiLoadingTips = [
        "💡 Pro tip: Group similar items together when shopping!",
        "🛒 Smart shoppers make lists and stick to them!",
        "📱 Use the Master List to track your regular purchases",
        "⏰ Shopping during off-peak hours saves time!"
    ];

    return (
        <div className="pb-20">
            <Confetti trigger={showConfetti} />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full touch-target transition-colors"
                    aria-label="Go back to home"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{list.name}</h2>
                    <p className="text-sm text-gray-500">{completedCount} of {totalItems} completed</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleAiSuggest}
                        className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 touch-target transition-colors"
                        aria-label="Get AI suggestions"
                    >
                        <Sparkles size={16} />
                        <span className="hidden sm:inline">AI</span>
                    </button>

                    {/* Sort dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className={`flex items-center gap-1 text-sm px-3 py-2 rounded-xl border transition-colors touch-target ${sortBy !== 'default'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : 'text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            aria-label="Sort options"
                            aria-expanded={showSortMenu}
                        >
                            <ListFilter size={16} />
                        </button>

                        {showSortMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 w-48 z-50 animate-scale-in">
                                    <p className="px-4 py-1 text-xs text-gray-500 uppercase font-semibold">Sort by</p>
                                    {[
                                        { value: 'default', label: 'Default order' },
                                        { value: 'category', label: 'Category' },
                                        { value: 'alpha', label: 'Alphabetically' },
                                        { value: 'purchased', label: 'Purchased status' }
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${sortBy === option.value ? 'text-blue-600 dark:text-blue-400 font-medium' : ''
                                                }`}
                                        >
                                            {option.label}
                                            {sortBy === option.value && ' ✓'}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* More actions */}
                    <div className="relative">
                        <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl touch-target transition-colors"
                            aria-label="More actions"
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showActionsMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowActionsMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 w-48 z-50 animate-scale-in">
                                    <button
                                        onClick={handleClearCompleted}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-red-500 transition-colors"
                                    >
                                        Clear Completed ({completedCount})
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            {totalItems > 0 && (
                <div className="mb-4">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Quick Add Input */}
            <form onSubmit={handleQuickAdd} className="mb-6">
                <div className="relative">
                    <input
                        ref={quickAddRef}
                        type="text"
                        placeholder="Quick add item..."
                        className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        value={quickAddText}
                        onChange={(e) => setQuickAddText(e.target.value)}
                        aria-label="Quick add item"
                    />
                    <button
                        type="submit"
                        disabled={!quickAddText.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
                        aria-label="Add item"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                {quickAddText && (
                    <p className="text-xs text-gray-500 mt-1 ml-2">
                        {products.some(p => p.name.toLowerCase().includes(quickAddText.toLowerCase()))
                            ? '↵ Press Enter to add matching product'
                            : '↵ Press Enter to add as custom item'}
                    </p>
                )}
            </form>

            {/* Items List */}
            {Object.entries(displayItems).map(([category, items]) => (
                <div key={category} className="mb-6">
                    {sortBy === 'category' && items.length > 0 && (
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
                            <SwipeableItem
                                key={item._id}
                                onSwipeRight={() => handleTogglePurchased(item._id, item.isPurchased)}
                                onSwipeLeft={() => handleRemoveItem(item._id)}
                                rightLabel={item.isPurchased ? "Undo" : "Done"}
                                disabled={false}
                            >
                                <div className={`p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${item.isPurchased ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}`}>
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => handleTogglePurchased(item._id, item.isPurchased)}
                                            className={`mt-1 p-1.5 rounded-full border-2 transition-all touch-target flex items-center justify-center ${item.isPurchased
                                                ? 'bg-green-500 border-green-500 text-white animate-pulse-success'
                                                : 'border-gray-300 dark:border-gray-600 text-transparent hover:border-green-500'
                                                }`}
                                            aria-label={item.isPurchased ? 'Mark as not purchased' : 'Mark as purchased'}
                                        >
                                            <Check size={16} />
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className={`font-semibold text-lg truncate ${item.isPurchased ? 'line-through text-gray-500' : ''}`}>
                                                        {item.product ? item.product.name : item.customName}
                                                    </p>
                                                    {item.product?.alias && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate">
                                                            {item.product.alias}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleAmazonSearch(item.product ? item.product.name : item.customName)}
                                                        className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors touch-target"
                                                        title="Search on Amazon"
                                                        aria-label="Search on Amazon"
                                                    >
                                                        <ShoppingCart size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveItem(item._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-target"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs items-center mt-2">
                                                <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full overflow-hidden">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                        className="px-3 py-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors touch-target"
                                                        disabled={item.quantity <= 1}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="px-2 py-1 font-medium min-w-[60px] text-center">
                                                        {item.quantity} {item.product ? item.product.unit : 'unit'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                        className="px-3 py-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors touch-target"
                                                        aria-label="Increase quantity"
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
                                                        {getRunOutPrediction(item.product.consumptionDuration, item.quantity)}
                                                    </span>
                                                )}
                                            </div>

                                            {item.product?.notes && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic line-clamp-2">
                                                    Note: {item.product.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SwipeableItem>
                        ))}
                    </div>
                </div>
            ))}

            {/* Empty state */}
            {list.items.length === 0 && (
                <EmptyState
                    type="items"
                    title="Your list is empty"
                    description="Add items from your master list or use quick add above to start shopping!"
                    actionLabel="Browse Master List"
                    onAction={() => setIsAddModalOpen(true)}
                />
            )}

            {/* FAB */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-500/40 hover:scale-105 transition-all touch-target"
                aria-label="Add item from master list"
            >
                <Plus size={24} />
            </button>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 animate-fade-in"
                    onClick={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}
                >
                    <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-xl rounded-t-xl p-6 h-[80vh] flex flex-col animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Add from Master List</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label="Close modal"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            aria-label="Search products"
                        />

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => handleAddItem(product._id)}
                                    disabled={addingItemId === product._id}
                                    className={`w-full p-3 text-left rounded-lg border border-gray-100 dark:border-gray-700 transition-all ${addingItemId === product._id
                                        ? 'opacity-60 cursor-wait bg-blue-50 dark:bg-blue-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            {product.alias && (
                                                <p className="text-xs text-gray-500 italic">{product.alias}</p>
                                            )}
                                        </div>
                                        {addingItemId === product._id ? (
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Plus size={20} className="text-blue-600 dark:text-blue-400" />
                                        )}
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
                                    <p className="text-sm mt-2">Use Quick Add above to add custom items!</p>
                                </div>
                            )}
                            {filteredProducts.length === 0 && !searchTerm && (
                                <EmptyState
                                    type="products"
                                    title="All products added"
                                    description="You've added all products from your master list. Add more products in the Master List section."
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Suggestions Modal */}
            {isAiModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={(e) => e.target === e.currentTarget && setIsAiModalOpen(false)}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="text-purple-500" />
                                AI Suggestions
                            </h3>
                            <button
                                onClick={() => setIsAiModalOpen(false)}
                                className="text-gray-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                aria-label="Close AI suggestions"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {isLoadingAi ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                <p className="text-gray-500 mb-4">Analyzing your shopping patterns...</p>
                                <p className="text-sm text-purple-500 italic">
                                    {aiLoadingTips[Math.floor(Math.random() * aiLoadingTips.length)]}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {aiSuggestions.length > 0 ? (
                                    aiSuggestions.map((suggestion, index) => (
                                        <div key={index} className="border dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold">{suggestion.productDetails.name}</h4>
                                                <button
                                                    onClick={() => handleAddSuggestion(suggestion)}
                                                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{suggestion.reason}</p>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState
                                        type="ai"
                                        title="No suggestions right now"
                                        description="Keep shopping and we'll learn your preferences to give better recommendations!"
                                    />
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
