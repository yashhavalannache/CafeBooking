import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Eye, EyeOff, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from '../components/Toast';

type Mode = 'login' | 'signup' | 'forgot';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Valid email required';
    if (mode !== 'forgot') {
      if (password.length < 6) errs.password = 'At least 6 characters';
    }
    if (mode === 'signup' && !name.trim()) errs.name = 'Name required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast(error.message, 'error'); return; }
      toast('Welcome back!', 'success');
      navigate('/');
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      setLoading(false);
      if (error) { toast(error.message, 'error'); return; }
      toast('Account created! You can now sign in.', 'success');
      setMode('login');
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      if (error) { toast(error.message, 'error'); return; }
      setForgotSent(true);
    }
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-3 bg-[#FFF8E7] border rounded-xl text-[#2E1A12] text-sm placeholder-[#6F4E37]/40 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-red-400 focus:ring-red-100' : 'border-[#E6D3B3] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20'
    }`;

  return (
    <div className="min-h-screen bg-[#2E1A12] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#D4AF37]/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#D4AF37]/5 pointer-events-none" />

      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#6F4E37] flex items-center justify-center shadow-2xl">
              <Coffee className="w-7 h-7 text-[#2E1A12]" />
            </div>
            <div>
              <p className="font-display font-bold text-[#FFF8E7] text-2xl">Brewed & Bliss</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">Premium Café</p>
            </div>
          </Link>
        </div>

        <div className="glass-dark rounded-3xl p-8 shadow-2xl">
          {mode !== 'forgot' && (
            <div className="flex rounded-xl overflow-hidden border border-[#D4AF37]/20 mb-7">
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setErrors({}); }}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    mode === m
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12]'
                      : 'text-[#E6D3B3]/60 hover:text-[#E6D3B3]'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          )}

          {mode === 'forgot' && !forgotSent && (
            <div className="mb-7">
              <button onClick={() => setMode('login')} className="text-xs text-[#D4AF37] hover:text-[#C8A228] mb-4 flex items-center gap-1">
                ← Back to Sign In
              </button>
              <h2 className="font-display text-xl font-bold text-[#FFF8E7] mb-1">Reset Password</h2>
              <p className="text-sm text-[#E6D3B3]/60">Enter your email and we'll send a reset link.</p>
            </div>
          )}

          {forgotSent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="font-display text-xl font-bold text-[#FFF8E7] mb-2">Check Your Email</h3>
              <p className="text-sm text-[#E6D3B3]/60 mb-5">A password reset link has been sent to <strong className="text-[#E6D3B3]">{email}</strong>.</p>
              <button onClick={() => { setMode('login'); setForgotSent(false); }} className="text-sm text-[#D4AF37] hover:text-[#C8A228] font-medium">Back to Sign In</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#E6D3B3] mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input type="text" placeholder="Aryan Sharma" value={name} onChange={e => setName(e.target.value)} className={inputCls('name')} />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#E6D3B3] mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputCls('email')} />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-[#E6D3B3] mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`${inputCls('password')} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F4E37]/60 hover:text-[#6F4E37]"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-[#E6D3B3]/60 cursor-pointer">
                    <input type="checkbox" className="accent-[#D4AF37] w-3.5 h-3.5" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => { setMode('forgot'); setErrors({}); }} className="text-[#D4AF37] hover:text-[#C8A228] font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-ripple w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] py-3.5 rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-[#D4AF37]/20 transition-all disabled:opacity-60 mt-2"
              >
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Please wait…</> : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-5 text-xs text-[#E6D3B3]/40">
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}