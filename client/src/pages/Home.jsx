import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, ShoppingBag, Calendar, Search, Archive, ArchiveRestore, X } from 'lucide-react';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatRelativeDate } from '../utils/dateHelpers';

const Home = () => {
    const { showSuccess, showError, showWithUndo } = useToast();
    const { user } = useAuth();
    const [lists, setLists] = useState([]);
    const [archivedLists, setArchivedLists] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
        const listToArchive = lists.find(l => l._id === listId);

        // Optimistically update UI
        setLists(prev => prev.filter(l => l._id !== listId));
        setArchivedLists(prev => [{ ...listToArchive, status: 'archived' }, ...prev]);

        try {
            await api.post(`/lists/${listId}/archive`);
            showWithUndo('List archived', async () => {
                // Undo: unarchive the list
                try {
                    await api.post(`/lists/${listId}/unarchive`);
                    fetchLists();
                } catch (err) {
                    showError('Failed to restore list');
                }
            });
        } catch (error) {
            console.error('Error archiving list:', error);
            showError('Failed to archive list');
            fetchLists(); // Revert on error
        }
    };

    const handleUnarchiveList = async (listId, e) => {
        e.stopPropagation();
        const listToRestore = archivedLists.find(l => l._id === listId);

        // Optimistically update UI
        setArchivedLists(prev => prev.filter(l => l._id !== listId));
        setLists(prev => [{ ...listToRestore, status: 'active' }, ...prev]);

        try {
            await api.post(`/lists/${listId}/unarchive`);
            showSuccess('List restored');
        } catch (error) {
            console.error('Error unarchiving list:', error);
            showError('Failed to restore list');
            fetchLists(); // Revert on error
        }
    };

    // Filter lists by search term
    const filteredLists = (showArchived ? archivedLists : lists).filter(list =>
        list.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayLists = filteredLists;
    const showSearch = lists.length + archivedLists.length >= 3;

    if (isLoading) return <LoadingIndicator fullScreen message="Loading dashboard..." />;

    return (
        <div className="pb-20">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Shopping List</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img src={user?.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'} alt="Profile" referrerPolicy="no-referrer" />
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
                                aria-label={showArchived ? 'Show active lists' : 'Show archived lists'}
                            >
                                {showArchived ? 'Show Active' : `Archived (${archivedLists.length})`}
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-primary font-medium flex items-center gap-1 touch-target"
                        aria-label="Create new list"
                    >
                        <Plus size={18} />
                        New List
                    </button>
                </div>

                {/* Search bar - shown when user has multiple lists */}
                {showSearch && (
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search lists..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search lists"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {displayLists.map(list => {
                        const totalItems = list.items.length;
                        const purchasedItems = list.items.filter(i => i.isPurchased).length;
                        const progress = totalItems === 0 ? 0 : (purchasedItems / totalItems) * 100;
                        const isComplete = progress === 100 && totalItems > 0;

                        return (
                            <div
                                key={list._id}
                                onClick={() => navigate(`/list/${list._id}`)}
                                className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-98 transition-all cursor-pointer hover:shadow-md ${isComplete ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${list.type === 'Party' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} dark:bg-opacity-20`}>
                                            <ShoppingBag size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{list.name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={12} aria-hidden="true" />
                                                {formatRelativeDate(list.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => showArchived ? handleUnarchiveList(list._id, e) : handleArchiveList(list._id, e)}
                                        className="text-gray-400 hover:text-gray-600 p-2 touch-target rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title={showArchived ? 'Restore' : 'Archive'}
                                        aria-label={showArchived ? 'Restore list' : 'Archive list'}
                                    >
                                        {showArchived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                                        <span>{isComplete ? '✓ Complete!' : 'Progress'}</span>
                                        <span>{purchasedItems}/{totalItems} items</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty state */}
                    {displayLists.length === 0 && !searchTerm && (
                        <EmptyState
                            type="lists"
                            title={showArchived ? 'No archived lists' : 'No shopping lists yet'}
                            description={showArchived
                                ? "Lists you archive will appear here for safekeeping."
                                : "Create your first shopping list to get started. Keep track of what you need to buy!"}
                            actionLabel={showArchived ? null : "Create Your First List"}
                            onAction={showArchived ? null : () => setIsModalOpen(true)}
                            showTips={!showArchived && lists.length === 0}
                        />
                    )}

                    {/* No search results */}
                    {displayLists.length === 0 && searchTerm && (
                        <div className="text-center py-10 text-gray-500">
                            <p>No lists matching "{searchTerm}"</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-2 text-blue-600 hover:underline text-sm"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Create List Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md animate-scale-in">
                        <h2 className="text-xl font-bold mb-4">Create New List</h2>
                        <form onSubmit={handleCreateList} className="space-y-4">
                            <div>
                                <label htmlFor="listName" className="block text-sm font-medium mb-1">List Name</label>
                                <input
                                    id="listName"
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    value={newListName}
                                    onChange={e => setNewListName(e.target.value)}
                                    placeholder="e.g., Weekly Groceries"
                                />
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30"
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
