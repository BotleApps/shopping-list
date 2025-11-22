import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, List, ChevronDown, Check } from 'lucide-react';

const ListSelector = ({ currentList, onListChange }) => {
    const [lists, setLists] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        fetchLists();
    }, [currentList]);

    const fetchLists = async () => {
        try {
            const response = await api.get('/lists');
            setLists(response.data);
        } catch (error) {
            console.error('Error fetching lists:', error);
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/lists', { name: newListName });
            setLists([response.data, ...lists]);
            onListChange(response.data);
            setIsCreating(false);
            setNewListName('');
            setIsOpen(false);
        } catch (error) {
            console.error('Error creating list:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 font-bold text-xl hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
            >
                <span>{currentList ? currentList.name : 'Select List'}</span>
                <ChevronDown size={20} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-20 overflow-hidden">
                        <div className="max-h-60 overflow-y-auto">
                            {lists.map(list => (
                                <button
                                    key={list._id}
                                    onClick={() => {
                                        onListChange(list);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 ${currentList?._id === list._id ? 'text-primary bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <span className="truncate">{list.name}</span>
                                    {currentList?._id === list._id && <Check size={16} />}
                                </button>
                            ))}
                        </div>

                        <div className="border-t dark:border-gray-700 p-2">
                            {isCreating ? (
                                <form onSubmit={handleCreateList} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="List Name"
                                        className="flex-1 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                        autoFocus
                                    />
                                    <button type="submit" className="bg-primary text-white p-2 rounded">
                                        <Check size={16} />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full flex items-center gap-2 p-2 text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    <Plus size={16} />
                                    <span className="text-sm font-medium">Create New List</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ListSelector;
