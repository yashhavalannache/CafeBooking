import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import WhatsAppButton from './components/WhatsAppButton';
import { ToastContainer } from './components/Toast';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ReservationPage from './pages/ReservationPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage'; // Customer Auth
import AdminLogin from './pages/AdminLogin'; // Secure metadata-based Admin Login portal
import { supabase } from './lib/supabase';

// Standard client-facing layout wrapper
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
      <WhatsAppButton />
    </div>
  );
}

// Protected Route Shield - Now checks metadata matching our updated AdminLogin file
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        // Retrieve the current authenticated session user object
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Read the role attribute directly from App Metadata or User Metadata arrays
        const userRole = user.app_metadata?.role || user.user_metadata?.role;

        if (userRole === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      } {
        setLoading(false);
      }
    }

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6F4E37]"></div>
      </div>
    );
  }

  // If validated as admin, render children components; otherwise, safely eject them to login
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* ── CUSTOMER PAGES (Wrapped in Layout) ── */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/menu" element={<Layout><MenuPage /></Layout>} />
        <Route path="/reservations" element={<Layout><ReservationPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/auth" element={<Layout><AuthPage /></Layout>} />

        {/* ── SEPARATED ADMIN PORTALS (No shared customer navbar/footer structures) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Dashboard Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          } 
        />

        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}