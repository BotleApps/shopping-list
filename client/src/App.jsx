import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MasterList from './pages/MasterList';
import ShoppingList from './pages/ShoppingList';
import { ShoppingCart, List as ListIcon } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20">
        <header className="bg-white dark:bg-gray-800 shadow p-4 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-primary">Shopping List AI</h1>
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<ShoppingList />} />
            <Route path="/master" element={<MasterList />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-4 z-10">
          <Link to="/" className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary active:text-primary">
            <ShoppingCart size={24} />
            <span className="text-xs mt-1">Shopping List</span>
          </Link>
          <Link to="/master" className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary active:text-primary">
            <ListIcon size={24} />
            <span className="text-xs mt-1">Master List</span>
          </Link>
        </nav>
      </div>
    </Router>
  );
}

export default App;
