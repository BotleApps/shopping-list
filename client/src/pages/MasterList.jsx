import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, Tag, Clock, FileText, X, Package } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { getRunOutPrediction } from '../utils/dateHelpers';

const MasterList = () => {
    const navigate = useNavigate();
    const { showSuccess, showError, showWithUndo } = useToast();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all');

    const categories = ['all', 'Fruits & Veggies', 'Dairy & Eggs', 'Bakery', 'Meat & Seafood', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Personal Care', 'Other'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            showError('Failed to load master list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        const productToDelete = products.find(p => p._id === id);

        // Optimistic update
        setProducts(prev => prev.filter(p => p._id !== id));

        try {
            await api.delete(`/products/${id}`);
            showWithUndo('Product deleted', async () => {
                // Undo: re-create the product
                try {
                    await api.post('/products', productToDelete);
                    fetchProducts();
                } catch (err) {
                    showError('Failed to restore product');
                }
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            showError('Failed to delete product');
            fetchProducts(); // Revert on error
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.alias && p.alias.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Group products by category for display
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    if (isLoading) return <LoadingIndicator fullScreen message="Loading master list..." />;

    return (
        <div className="pb-20">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Master List</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {products.length} product{products.length !== 1 ? 's' : ''} in your catalog
                </p>
            </header>

            {/* Search and Add */}
            <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search products"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => navigate('/master-list/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30 touch-target"
                    aria-label="Add new product"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Category filter */}
            <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-2 min-w-max">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCategory === cat
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products list */}
            <div className="space-y-6">
                {Object.keys(groupedProducts).length === 0 ? (
                    searchTerm || filterCategory !== 'all' ? (
                        <div className="text-center py-10 text-gray-500">
                            <p>No products match your search</p>
                            <button
                                onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}
                                className="mt-2 text-blue-600 hover:underline text-sm"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <EmptyState
                            type="products"
                            title="No products yet"
                            description="Start building your master catalog of products. Add items you regularly buy for quick access when creating shopping lists."
                            actionLabel="Add Your First Product"
                            onAction={() => navigate('/master-list/new')}
                            showTips={true}
                        />
                    )
                ) : (
                    Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                        <div key={category}>
                            {filterCategory === 'all' && (
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Package size={14} />
                                    {category} ({categoryProducts.length})
                                </h2>
                            )}
                            <div className="grid grid-cols-1 gap-3">
                                {categoryProducts.map(product => (
                                    <div
                                        key={product._id}
                                        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                                                {product.alias && (
                                                    <p className="text-sm text-gray-500 italic truncate">{product.alias}</p>
                                                )}

                                                <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Tag size={12} aria-hidden="true" />
                                                        {product.category}
                                                    </span>
                                                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                                                        {product.defaultQuantity} {product.unit}
                                                    </span>
                                                    {product.consumptionDuration && (
                                                        <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                                                            <Clock size={12} aria-hidden="true" />
                                                            {product.consumptionDuration} days
                                                        </span>
                                                    )}
                                                </div>

                                                {product.notes && (
                                                    <p className="text-xs text-gray-400 mt-2 flex items-start gap-1 line-clamp-2">
                                                        <FileText size={12} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                                                        {product.notes}
                                                    </p>
                                                )}

                                                {/* Price info */}
                                                {(product.preferredStore || product.lastKnownPrice || product.bestPrice) && (
                                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                        {product.preferredStore && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-medium">Store:</span> {product.preferredStore}
                                                            </div>
                                                        )}
                                                        {product.lastKnownPrice && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-medium">Price:</span> ₹{product.lastKnownPrice}
                                                            </div>
                                                        )}
                                                        {product.bestPrice && (
                                                            <div className="col-span-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold">Best Deal:</span> ₹{product.bestPrice}
                                                                {product.bestPriceStore && ` @ ${product.bestPriceStore}`}
                                                                {product.bestPriceLink && (
                                                                    <a
                                                                        href={product.bestPriceLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="underline ml-auto"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        View
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-1 ml-3 flex-shrink-0">
                                                <button
                                                    onClick={() => navigate(`/master-list/edit/${product._id}`)}
                                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors touch-target"
                                                    aria-label={`Edit ${product.name}`}
                                                >
                                                    <Edit2 size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors touch-target"
                                                    aria-label={`Delete ${product.name}`}
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MasterList;
