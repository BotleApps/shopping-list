import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ShoppingList from './pages/ShoppingList';
import MasterList from './pages/MasterList';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';

import PrivacySecurity from './pages/PrivacySecurity';
import ProductForm from './pages/ProductForm';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/list/:id" element={<ShoppingList />} />
              <Route path="/master-list" element={<MasterList />} />
              <Route path="/master-list/new" element={<ProductForm />} />
              <Route path="/master-list/edit/:id" element={<ProductForm />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/profile" element={<EditProfile />} />
              <Route path="/settings/security" element={<PrivacySecurity />} />
            </Routes>
          </Layout>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
