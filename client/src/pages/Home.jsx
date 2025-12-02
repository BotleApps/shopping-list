import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, ShoppingBag, Calendar, MoreVertical, CheckCircle, Archive, ArchiveRestore } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import { useToast } from '../context/ToastContext';

const Home = () => {
    const { showSuccess, showError } = useToast();
    const [lists, setLists] = useState([]);
    const [archivedLists, setArchivedLists] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/lists');
            const activeLists = response.data.filter(l => l.status !== 'archived');
            const archived = response.data.filter(l => l.status === 'archived');
            setLists(activeLists);
            setArchivedLists(archived);
        } catch (error) {
            console.error('Error fetching lists:', error);
            showError('Failed to load lists');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (newListName) {
            try {
                const response = await api.post('/lists', { name: newListName });
                setLists([response.data, ...lists]);
                setIsModalOpen(false);
                setNewListName('');
                showSuccess('List created successfully');
                navigate(`/list/${response.data._id}`);
            } catch (error) {
                console.error('Error creating list:', error);
                showError('Failed to create list');
            }
        }
    };

    const handleArchiveList = async (listId, e) => {
        e.stopPropagation();
        if (!window.confirm('Archive this list? You can restore it later.')) {
            return;
        }
        try {
            await api.post(`/lists/${listId}/archive`);
            fetchLists();
            showSuccess('List archived');
        } catch (error) {
            console.error('Error archiving list:', error);
            showError('Failed to archive list');
        }
    };

    const handleUnarchiveList = async (listId, e) => {
        e.stopPropagation();
        try {
            await api.post(`/lists/${listId}/unarchive`);
            fetchLists();
            showSuccess('List restored');
        } catch (error) {
            console.error('Error unarchiving list:', error);
            showError('Failed to restore list');
        }
    };

    const displayLists = showArchived ? archivedLists : lists;

    if (isLoading) return <LoadingIndicator fullScreen message="Loading dashboard..." />;

    return (
        <div className="pb-20">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Shopping List</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back!</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
                </div>
            </header>

            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold">My Lists</h2>
                        {archivedLists.length > 0 && (
                            <button
                                onClick={() => setShowArchived(!showArchived)}
                                className={`text-sm px-3 py-1 rounded-full transition-colors ${showArchived
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {showArchived ? 'Show Active' : `Archived (${archivedLists.length})`}
                            </button>
                        )}
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="text-primary font-medium flex items-center gap-1">
                        <Plus size={18} /> New List
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {displayLists.map(list => {
                        const totalItems = list.items.length;
                        const purchasedItems = list.items.filter(i => i.isPurchased).length;
                        const progress = totalItems === 0 ? 0 : (purchasedItems / totalItems) * 100;

                        return (
                            <div
                                key={list._id}
                                onClick={() => navigate(`/list/${list._id}`)}
                                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-transform cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${list.type === 'Party' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} dark:bg-opacity-20`}>
                                            <ShoppingBag size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{list.name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(list.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => showArchived ? handleUnarchiveList(list._id, e) : handleArchiveList(list._id, e)}
                                        className="text-gray-400 hover:text-gray-600 p-2"
                                        title={showArchived ? 'Restore' : 'Archive'}
                                    >
                                        {showArchived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{purchasedItems}/{totalItems} items</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-primary h-full rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {displayLists.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            <p>{showArchived ? 'No archived lists' : 'No active lists'}</p>
                            {!showArchived && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-4 text-blue-600 hover:underline"
                                >
                                    Create your first list
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New List</h2>
                        <form onSubmit={handleCreateList} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">List Name</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                                    value={newListName}
                                    onChange={e => setNewListName(e.target.value)}
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
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
