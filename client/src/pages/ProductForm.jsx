import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import LoadingIndicator from '../components/LoadingIndicator';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showSuccess, showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [product, setProduct] = useState({
        name: '',
        alias: '',
        category: 'Other',
        defaultQuantity: 1,
        unit: 'unit',
        consumptionDuration: 7,
        notes: '',
        preferredStore: '',
        productLink: '',
        lastKnownPrice: '',
        bestPrice: '',
        bestPriceStore: '',
        bestPriceLink: '',
        consumersCount: 0
    });

    const categories = ['Fruits & Veggies', 'Dairy & Eggs', 'Bakery', 'Meat & Seafood', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Personal Care', 'Other'];
    const units = ['unit', 'kg', 'g', 'l', 'ml', 'pack', 'dozen', 'bunch'];

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            // Since we don't have a direct get-by-id for products in the master list view usually,
            // we can reuse the master list fetch or implement a specific endpoint.
            // Assuming the backend supports GET /products/:id (which we should verify/add if missing).
            // Looking at api.js, there isn't a specific GET /products/:id. 
            // Wait, looking at previous file view of api.js, there IS NO GET /products/:id.
            // I will need to add it to the backend or filter from the full list (less efficient but works for now).
            // Let's assume for now I'll add the endpoint or use the full list filter.
            // Actually, let's check api.js again.
            // It has GET /products (all), POST /products, PATCH /products/:id, DELETE /products/:id.
            // It DOES NOT have GET /products/:id.
            // I will implement a client-side filter for now to avoid backend changes if possible, 
            // OR better, I should add the endpoint. 
            // For this step, let's try to fetch all and find.
            const response = await api.get('/products');
            const found = response.data.find(p => p._id === id);
            if (found) {
                setProduct(found);
            } else {
                showError('Product not found');
                navigate('/master-list');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            showError('Failed to load product details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (id) {
                await api.patch(`/products/${id}`, product);
                showSuccess('Product updated successfully');
            } else {
                await api.post('/products', product);
                showSuccess('Product added successfully');
            }
            navigate('/master-list');
        } catch (error) {
            console.error('Error saving product:', error);
            showError('Failed to save product');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && id) return <LoadingIndicator fullScreen message="Loading product..." />;

    return (
        <div className="pb-20">
            <header className="mb-6 flex items-center gap-4">
                <button onClick={() => navigate('/master-list')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">{id ? 'Edit Product' : 'Add New Product'}</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Basic Info</h2>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={product.name}
                            onChange={e => setProduct({ ...product, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Alias (Local Name)</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={product.alias}
                            onChange={e => setProduct({ ...product, alias: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category</label>
                        <select
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={product.category}
                            onChange={e => setProduct({ ...product, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Consumption Details</h2>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Default Qty</label>
                            <input
                                type="number"
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.defaultQuantity}
                                onChange={e => setProduct({ ...product, defaultQuantity: e.target.value })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Unit</label>
                            <select
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.unit}
                                onChange={e => setProduct({ ...product, unit: e.target.value })}
                            >
                                {units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lasts For (Days)</label>
                        <input
                            type="number"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={product.consumptionDuration}
                            onChange={e => setProduct({ ...product, consumptionDuration: e.target.value })}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Shopping Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Preferred Store</label>
                            <input
                                type="text"
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.preferredStore}
                                onChange={e => setProduct({ ...product, preferredStore: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Link</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.productLink}
                                onChange={e => setProduct({ ...product, productLink: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last Known Price</label>
                            <input
                                type="number"
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.lastKnownPrice}
                                onChange={e => setProduct({ ...product, lastKnownPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Consumers Count</label>
                            <input
                                type="number"
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.consumersCount}
                                onChange={e => setProduct({ ...product, consumersCount: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Best Deal Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Best Price</label>
                            <input
                                type="number"
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.bestPrice}
                                onChange={e => setProduct({ ...product, bestPrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Store Name</label>
                            <input
                                type="text"
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.bestPriceStore}
                                onChange={e => setProduct({ ...product, bestPriceStore: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Deal Link</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={product.bestPriceLink}
                                onChange={e => setProduct({ ...product, bestPriceLink: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
                    <textarea
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        rows="3"
                        value={product.notes}
                        onChange={e => setProduct({ ...product, notes: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-98 transition-all"
                >
                    <Save size={20} />
                    {id ? 'Save Changes' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

export default ProductForm;
