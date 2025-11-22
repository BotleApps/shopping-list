import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Search, Edit2, Trash2, Tag, Clock, FileText } from 'lucide-react';

const MasterList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        alias: '',
        category: 'Other',
        defaultQuantity: 1,
        unit: 'unit',
        consumptionDuration: 7,
        notes: ''
    });

    const categories = ['Fruits & Veggies', 'Dairy & Eggs', 'Bakery', 'Meat & Seafood', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Personal Care', 'Other'];
    const units = ['unit', 'kg', 'g', 'l', 'ml', 'pack', 'dozen', 'bunch'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (newProduct._id) {
                await api.patch(`/products/${newProduct._id}`, newProduct);
            } else {
                await api.post('/products', newProduct);
            }
            setIsModalOpen(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const resetForm = () => {
        setNewProduct({
            name: '',
            alias: '',
            category: 'Other',
            defaultQuantity: 1,
            unit: 'unit',
            consumptionDuration: 7,
            notes: ''
        });
    };

    const handleEditProduct = (product) => {
        setNewProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.alias && p.alias.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="pb-20">
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
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredProducts.map(product => (
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
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditProduct(product)} className="text-blue-500 hover:text-blue-700 p-2">
                                    <Edit2 size={20} />
                                </button>
                                <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 hover:text-red-700 p-2">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{newProduct._id ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Alias (Local Name)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                    value={newProduct.alias}
                                    onChange={e => setNewProduct({ ...newProduct, alias: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Default Qty</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                        value={newProduct.defaultQuantity}
                                        onChange={e => setNewProduct({ ...newProduct, defaultQuantity: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Unit</label>
                                    <select
                                        className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                        value={newProduct.unit}
                                        onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                                    >
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Lasts For (Days)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                    value={newProduct.consumptionDuration}
                                    onChange={e => setNewProduct({ ...newProduct, consumptionDuration: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea
                                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                    value={newProduct.notes}
                                    onChange={e => setNewProduct({ ...newProduct, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    {newProduct._id ? 'Save Changes' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterList;
