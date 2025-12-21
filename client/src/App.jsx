import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import ShoppingList from './pages/ShoppingList';
import MasterList from './pages/MasterList';
import Settings from './pages/Settings';
import EditProfile from './pages/EditProfile';
import PrivacySecurity from './pages/PrivacySecurity';
import ProductForm from './pages/ProductForm';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout><Home /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/list/:id" element={
                <ProtectedRoute>
                  <Layout><ShoppingList /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/master-list" element={
                <ProtectedRoute>
                  <Layout><MasterList /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/master-list/new" element={
                <ProtectedRoute>
                  <Layout><ProductForm /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/master-list/edit/:id" element={
                <ProtectedRoute>
                  <Layout><ProductForm /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout><Settings /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings/profile" element={
                <ProtectedRoute>
                  <Layout><EditProfile /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings/security" element={
                <ProtectedRoute>
                  <Layout><PrivacySecurity /></Layout>
                </ProtectedRoute>
              } />

              {/* 404 Not Found - Catch all unmatched routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
