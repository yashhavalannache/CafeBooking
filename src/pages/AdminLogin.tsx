import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Coffee, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign in the user using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Authentication failed.');

      // 2. Extract user role directly from app_metadata or user_metadata fallback
      const userRole = authData.user.app_metadata?.role || authData.user.user_metadata?.role;

      // 3. Verify if the logged-in user has the admin flag assigned
      if (userRole === 'admin') {
        // Access granted -> redirect securely to the internal dashboard
        navigate('/admin');
      } else {
        // Access denied -> Log the unauthorized user out instantly
        await supabase.auth.signOut();
        throw new Error('Access denied. This portal is restricted to administrators.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFF8E7] min-h-screen flex items-center justify-center p-4 relative selection:bg-[#6F4E37]/20">
      {/* Film Grain Texture Filter Overlay */}
      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.025] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-[#E6D3B3]/60 p-8 sm:p-10" style={{ boxShadow: '0 30px 60px -15px rgba(46, 26, 18, 0.1)' }}>
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#2E1A12] flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30">
            <Coffee className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2E1A12] tracking-tight">Admin Portal</h1>
          <p className="text-xs text-[#6F4E37]/70 mt-1 uppercase tracking-widest font-medium">Brewed & Bliss Management</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600 animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#2E1A12] uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F4E37]/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@brewedandbliss.com"
                className="w-full pl-11 pr-4 py-3.5 bg-[#FFF8E7]/30 border border-[#E6D3B3] rounded-xl text-sm font-sans focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] transition-all text-[#2E1A12]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2E1A12] uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F4E37]/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3.5 bg-[#FFF8E7]/30 border border-[#E6D3B3] rounded-xl text-sm font-sans focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] transition-all text-[#2E1A12]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F4E37]/50 hover:text-[#2E1A12] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E1A12] text-[#FFF8E7] py-4 rounded-xl font-semibold text-sm hover:bg-[#4E342E] transition-colors shadow-lg shadow-[#2E1A12]/10 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Access Role...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-4 border-t border-[#FFF8E7]">
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="text-xs text-[#6F4E37] font-medium hover:underline tracking-wide"
          >
            ← Back to Customer Website
          </button>
        </div>
      </div>
    </div>
  );
}