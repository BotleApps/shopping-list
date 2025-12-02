import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, Tag, Clock, FileText } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import { useToast } from '../context/ToastContext';

const MasterList = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
                showSuccess('Product deleted');
            } catch (error) {
                console.error('Error deleting product:', error);
                showError('Failed to delete product');
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.alias && p.alias.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) return <LoadingIndicator fullScreen message="Loading master list..." />;

    return (
        <div className="pb-20">
            <h1 className="text-3xl font-bold mb-6">Master List</h1>
            <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => navigate('/master-list/new')}
                    className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-colors shadow-md"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm mt-1">Add a new product to get started!</p>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    {product.alias && <p className="text-sm text-gray-500 italic">{product.alias}</p>}
                                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                                            <Tag size={12} /> {product.category}
                                        </span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            {product.defaultQuantity} {product.unit}
                                        </span>
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-1">
                                            <Clock size={12} /> Lasts {product.consumptionDuration} days
                                        </span>
                                    </div>
                                    {product.notes && (
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <FileText size={12} /> {product.notes}
                                        </p>
                                    )}
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                                        {product.preferredStore && (
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold">Store:</span> {product.preferredStore}
                                            </div>
                                        )}
                                        {product.lastKnownPrice && (
                                            <div className="flex items-center gap-1">
                                                <span className="font-semibold">Price:</span> ₹{product.lastKnownPrice}
                                            </div>
                                        )}
                                        {product.bestPrice && (
                                            <div className="col-span-2 bg-green-50 dark:bg-green-900/20 p-1 rounded text-green-700 dark:text-green-400 flex items-center gap-2">
                                                <span className="font-bold">Best Deal:</span> ₹{product.bestPrice}
                                                {product.bestPriceStore && ` @ ${product.bestPriceStore}`}
                                                {product.bestPriceLink && (
                                                    <a href={product.bestPriceLink} target="_blank" rel="noopener noreferrer" className="underline ml-auto">
                                                        View
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {product.consumersCount > 0 && (
                                            <div className="col-span-2 text-gray-400 flex items-center gap-1">
                                                <span className="font-semibold">{product.consumersCount}</span> consumers bought this
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/master-list/edit/${product._id}`)} className="text-blue-500 hover:text-blue-700 p-2">
                                        <Edit2 size={20} />
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 hover:text-red-700 p-2">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>


        </div>
    );
};

export default MasterList;
