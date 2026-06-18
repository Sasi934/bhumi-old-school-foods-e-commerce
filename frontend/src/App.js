import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LangProvider } from './context/LangContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminInventory from './pages/admin/AdminInventory';
import AdminNotifications from './pages/admin/AdminNotifications';

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>

              {/* ─── ADMIN ROUTES ─── */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              {/* ─── PUBLIC ROUTES ─── */}
              <Route path="/*" element={
                <>
                  <Navbar />
                  <CartDrawer />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ProductListingPage />} />
                    <Route path="/shop/:category" element={<ProductListingPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                    <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  <Footer />
                </>
              } />

            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LangProvider>
  );
}

export default App;