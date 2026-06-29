import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, CalendarCheck, Users, MessageSquare,
  TrendingUp, Plus, Edit2, Trash2, Check, X, Search, RefreshCw,
  CheckCircle, XCircle, Clock, ChevronDown, Eye, Coffee, LogOut, Lock
} from 'lucide-react';
import { supabase, type MenuItem, type Reservation, type Category, type ContactMessage } from '../lib/supabase';
import { toast } from '../components/Toast';

type Tab = 'dashboard' | 'menu' | 'reservations' | 'messages';

type Stats = {
  totalReservations: number;
  todayReservations: number;
  pendingReservations: number;
  totalMenuItems: number;
  totalMessages: number;
  unreadMessages: number;
};

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6D3B3] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {sub && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">{sub}</span>}
      </div>
      <p className="font-display text-3xl font-bold text-[#2E1A12]">{value.toLocaleString()}</p>
      <p className="text-xs text-[#6F4E37]/70 mt-1 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  // Lowercase the status matching lookup map safely
  const normalStatus = status?.toLowerCase() || 'pending';
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${map[normalStatus] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

type MenuFormData = {
  name: string;
  description: string;
  ingredients: string;
  price: string;
  image_url: string;
  prep_time: string;
  rating: string;
  category_id: string;
  is_vegetarian: boolean;
  is_bestseller: boolean;
  is_todays_special: boolean;
  is_available: boolean;
};

const emptyMenuForm: MenuFormData = {
  name: '', description: '', ingredients: '', price: '',
  image_url: '', prep_time: '5', rating: '4.5', category_id: '',
  is_vegetarian: false, is_bestseller: false, is_todays_special: false, is_available: true,
};

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats>({ totalReservations: 0, todayReservations: 0, pendingReservations: 0, totalMenuItems: 0, totalMessages: 0, unreadMessages: 0 });
  const [menuItems, setMenuItems] = useState<(MenuItem & { categories?: Category })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuForm, setMenuForm] = useState<MenuFormData>(emptyMenuForm);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [resSearch, setResSearch] = useState('');
  const [resFilter, setResFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadAll = async () => {
    setLoading(true);
    try {
      const [res, items, msgs, cats] = await Promise.all([
        supabase.from('reservations').select('*').order('reservation_date', { ascending: false }).order('reservation_time', { ascending: false }),
        supabase.from('menu_items').select('*, categories(*)').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
      ]);

      const resData: Reservation[] = res.data || [];
      const msgData: ContactMessage[] = msgs.data || [];

      setReservations(resData);
      setMenuItems(items.data || []);
      setMessages(msgData);
      setCategories(cats.data || []);
      setStats({
        totalReservations: resData.length,
        todayReservations: resData.filter(r => r.reservation_date === today).length,
        pendingReservations: resData.filter(r => r.status?.toLowerCase() === 'pending').length,
        totalMenuItems: items.data?.length || 0,
        totalMessages: msgData.length,
        unreadMessages: msgData.filter(m => !m.is_read).length,
      });
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
      toast('Failed to update live administration tables.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const updateReservationStatus = async (id: string, status: 'Confirmed' | 'Rejected' | 'Cancelled') => {
    // 1. Optimistic UI update using exact capitalized labels
    setReservations(prevReservations => {
      const updated = prevReservations.map(r => r.id === id ? { ...r, status } : r);
      
      setStats(prevStats => ({
        ...prevStats,
        pendingReservations: updated.filter(r => r.status?.toLowerCase() === 'pending').length,
        todayReservations: updated.filter(r => r.reservation_date === today).length,
        totalReservations: updated.length
      }));
      
      return updated;
    });

    // 2. Perform database synchronization matching exact Postgres casing conditions
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    if (error) { 
      console.error('Supabase error:', error);
      toast('Update failed on server. Reverting...', 'error'); 
      await loadAll(); // Revert state from database truth if something goes wrong
      return; 
    }
    
    if (status === 'Rejected' || status === 'Cancelled') {
      toast(`Reservation marked as ${status}.`, 'error');
    } else {
      toast(`Reservation marked as ${status}.`, 'success');
    }
    
    // 3. Final round-trip reconciliation update
    await loadAll();
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) { toast('Delete failed.', 'error'); return; }
    toast('Item deleted.', 'success');
    setDeleteConfirm(null);
    loadAll();
  };

  const saveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price) { toast('Name and price are required.', 'error'); return; }
    const payload = {
      ...menuForm,
      price: parseFloat(menuForm.price),
      prep_time: parseInt(menuForm.prep_time),
      rating: parseFloat(menuForm.rating),
      category_id: menuForm.category_id || null,
    };
    const op = editingItemId
      ? supabase.from('menu_items').update(payload).eq('id', editingItemId)
      : supabase.from('menu_items').insert(payload);
    const { error } = await op;
    if (error) { toast('Save failed.', 'error'); return; }
    toast(editingItemId ? 'Item updated.' : 'Item added.', 'success');
    setMenuForm(emptyMenuForm);
    setEditingItemId(null);
    setShowMenuForm(false);
    loadAll();
  };

  const startEdit = (item: MenuItem) => {
    setMenuForm({
      name: item.name,
      description: item.description || '',
      ingredients: item.ingredients || '',
      price: String(item.price),
      image_url: item.image_url || '',
      prep_time: String(item.prep_time),
      rating: String(item.rating),
      category_id: item.category_id || '',
      is_vegetarian: item.is_vegetarian,
      is_bestseller: item.is_bestseller,
      is_todays_special: item.is_todays_special,
      is_available: item.is_available,
    });
    setEditingItemId(item.id);
    setShowMenuForm(true);
  };

  const markRead = async (id: string) => {
    const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    if (error) { toast('Could not update message.', 'error'); return; }
    loadAll();
  };

  const filteredReservations = reservations.filter(r => {
    const generatedId = r.booking_id || `B&B-${r.id.slice(0, 6).toUpperCase()}`;
    const matchSearch = !resSearch || 
      r.customer_name?.toLowerCase().includes(resSearch.toLowerCase()) || 
      generatedId.toLowerCase().includes(resSearch.toLowerCase()) || 
      r.customer_email?.toLowerCase().includes(resSearch.toLowerCase());
    
    const matchFilter = resFilter === 'all' || r.status?.toLowerCase() === resFilter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-[#E6D3B3] rounded-xl text-[#2E1A12] text-sm placeholder-[#6F4E37]/40 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all';

  const navItems: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed, badge: stats.totalMenuItems },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck, badge: stats.pendingReservations },
    { id: 'messages', label: 'Messages', icon: stats.unreadMessages ? MessageSquare : MessageSquare, badge: stats.unreadMessages },
  ];

  return (
    <div className="min-h-screen bg-[#FAF3E8] flex flex-col selection:bg-[#D4AF37]/20">
      {/* Top Bar */}
      <div className="bg-[#2E1A12] px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#D4AF37]/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#6F4E37] flex items-center justify-center">
            <Coffee className="w-4 h-4 text-[#2E1A12]" />
          </div>
          <div>
            <p className="font-display font-bold text-[#FFF8E7] text-sm">Admin Panel</p>
            <p className="text-[9px] text-[#D4AF37] uppercase tracking-wider">Brewed & Bliss</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={loadAll} disabled={loading} className="text-[#E6D3B3]/50 hover:text-[#D4AF37] transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a href="/" className="text-xs text-[#E6D3B3]/50 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> Exit
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-[#E6D3B3] hidden md:flex flex-col py-6">
          <nav className="space-y-1 px-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${tab === item.id
                    ? 'bg-[#4E342E] text-[#FFF8E7] shadow-sm'
                    : 'text-[#6F4E37] hover:bg-[#FFF8E7] hover:text-[#4E342E]'
                  }`}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
                {!!item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === item.id ? 'bg-white/20 text-[#FFF8E7]' : 'bg-[#D4AF37]/15 text-[#6F4E37]'
                    }`}>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6D3B3] flex">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors relative ${tab === item.id ? 'text-[#4E342E]' : 'text-[#6F4E37]/60'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label.split(' ')[0]}
              {!!item.badge && <span className="absolute top-2 right-[calc(50%-10px)] w-4 h-4 bg-[#D4AF37] rounded-full text-[8px] text-[#2E1A12] font-bold flex items-center justify-center">{item.badge}</span>}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20 md:pb-8">

          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div>
              <h1 className="font-display text-3xl font-bold text-[#2E1A12] mb-8">Dashboard Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <StatCard icon={CalendarCheck} label="Total Reservations" value={stats.totalReservations} color="bg-blue-100 text-blue-600" />
                <StatCard icon={Clock} label="Today's Reservations" value={stats.todayReservations} sub="Today" color="bg-amber-100 text-amber-600" />
                <StatCard icon={RefreshCw} label="Pending" value={stats.pendingReservations} color="bg-yellow-100 text-yellow-700" />
                <StatCard icon={UtensilsCrossed} label="Menu Items" value={stats.totalMenuItems} color="bg-[#D4AF37]/15 text-[#6F4E37]" />
                <StatCard icon={MessageSquare} label="Messages" value={stats.totalMessages} color="bg-purple-100 text-purple-600" />
                <StatCard icon={Eye} label="Unread Messages" value={stats.unreadMessages} color="bg-red-100 text-red-500" />
              </div>

              {/* Recent Reservations Table */}
              <div className="bg-white rounded-2xl border border-[#E6D3B3] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E6D3B3] flex justify-between items-center">
                  <h2 className="font-semibold text-[#2E1A12]">Recent Bookings</h2>
                  <button onClick={() => setTab('reservations')} className="text-xs text-[#D4AF37] hover:text-[#C8A228] font-medium">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FAF3E8]">
                        {['Booking ID', 'Customer', 'Date', 'Guests', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6F4E37] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6D3B3]">
                      {reservations.slice(0, 6).map(r => (
                        <tr key={r.id} className="hover:bg-[#FAF3E8] transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-[#D4AF37]">
                            {r.booking_id || `B&B-${r.id.slice(0, 6).toUpperCase()}`}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#2E1A12]">{r.customer_name}</td>
                          <td className="px-4 py-3 text-[#4E342E]/70">
                            {new Date(r.reservation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {r.reservation_time}
                          </td>
                          <td className="px-4 py-3 text-[#4E342E]/70">{r.guests}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                      {reservations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-sm text-[#6F4E37]/50">No recent reservations found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MENU MANAGEMENT */}
          {tab === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-3xl font-bold text-[#2E1A12]">Menu Items</h1>
                <button
                  onClick={() => { setShowMenuForm(true); setEditingItemId(null); setMenuForm(emptyMenuForm); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              {showMenuForm && (
                <div className="bg-white rounded-2xl border border-[#E6D3B3] p-6 mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-[#2E1A12]">{editingItemId ? 'Edit Item' : 'Add New Item'}</h2>
                    <button onClick={() => { setShowMenuForm(false); setEditingItemId(null); setMenuForm(emptyMenuForm); }} className="text-[#6F4E37]/60 hover:text-[#4E342E]"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={saveMenuItem} className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4E342E] mb-1.5 uppercase tracking-wide">Name *</label>
                      <input placeholder="Item name" value={menuForm.name} onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))} className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4E342E] mb-1.5 uppercase tracking-wide">Price (₹) *</label>
                      <input type="number" step="0.01" placeholder="0.00" value={menuForm.price} onChange={e => setMenuForm(f => ({ ...f, price: e.target.value }))} className={inputCls} required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#4E342E] mb-1.5 uppercase tracking-wide">Description</label>
                      <textarea rows={2} placeholder="Short description" value={menuForm.description} onChange={e => setMenuForm(f => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#4E342E] mb-1.5 uppercase tracking-wide">Ingredients</label>
                      <input placeholder="Comma-separated ingredients" value={menuForm.ingredients} onChange={e => setMenuForm(f => ({ ...f, ingredients: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4E342E] mb-1.5 uppercase tracking-wide">Image URL</label>
                      <input type="url" placeholder="https://…" value={menuForm.image_url} onChange={e => setMenuForm(f => ({ ...f, image_url: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4E342E] mb-1.5 uppercase tracking-wide">Category</label>
                      <select value={menuForm.category_id} onChange={e => setMenuForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls}>
                        <option value="">— Select Category —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4E342E] mb-1.5 uppercase tracking-wide">Prep Time (min)</label>
                      <input type="number" value={menuForm.prep_time} onChange={e => setMenuForm(f => ({ ...f, prep_time: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4E342E] mb-1.5 uppercase tracking-wide">Rating</label>
                      <input type="number" step="0.1" min="1" max="5" value={menuForm.rating} onChange={e => setMenuForm(f => ({ ...f, rating: e.target.value }))} className={inputCls} />
                    </div>
                    <div className="sm:col-span-2 flex flex-wrap gap-4">
                      {([
                        { key: 'is_vegetarian', label: 'Vegetarian' },
                        { key: 'is_bestseller', label: 'Bestseller' },
                        { key: 'is_todays_special', label: "Today's Special" },
                        { key: 'is_available', label: 'Available' },
                      ] as const).map(f => (
                        <label key={f.key} className="flex items-center gap-2 text-sm text-[#4E342E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={menuForm[f.key]}
                            onChange={e => setMenuForm(prev => ({ ...prev, [f.key]: e.target.checked }))}
                            className="w-4 h-4 accent-[#D4AF37] rounded"
                          />
                          {f.label}
                        </label>
                      ))}
                    </div>
                    <div className="sm:col-span-2 flex gap-3 justify-end">
                      <button type="button" onClick={() => { setShowMenuForm(false); setEditingItemId(null); }} className="px-5 py-2.5 border border-[#E6D3B3] rounded-xl text-sm text-[#6F4E37] hover:bg-[#FFF8E7]">Cancel</button>
                      <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] rounded-xl text-sm font-semibold">
                        {editingItemId ? 'Save Changes' : 'Add Item'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                  <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
                    <h3 className="font-display font-bold text-[#2E1A12] text-lg mb-2">Delete Item?</h3>
                    <p className="text-sm text-[#6F4E37]/70 mb-5">This cannot be undone.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-[#E6D3B3] rounded-xl text-sm text-[#6F4E37]">Cancel</button>
                      <button onClick={() => deleteMenuItem(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items Table */}
              <div className="bg-white rounded-2xl border border-[#E6D3B3] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FAF3E8]">
                        {['Item', 'Category', 'Price', 'Rating', 'Badges', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6F4E37] uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6D3B3]">
                      {menuItems.map(item => (
                        <tr key={item.id} className="hover:bg-[#FAF3E8] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={item.image_url || ''} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                              <div>
                                <p className="font-medium text-[#2E1A12]">{item.name}</p>
                                <p className="text-xs text-[#6F4E37]/60 line-clamp-1">{item.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#4E342E]/70 text-xs">{item.categories?.name || '—'}</td>
                          <td className="px-4 py-3 font-bold text-[#2E1A12]">₹{item.price}</td>
                          <td className="px-4 py-3 text-[#4E342E]/70">{Number(item.rating).toFixed(1)} ⭐</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {item.is_bestseller && <span className="text-[9px] bg-[#D4AF37]/15 text-[#6F4E37] px-1.5 py-0.5 rounded font-bold">Best</span>}
                              {item.is_vegetarian && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Veg</span>}
                              {item.is_todays_special && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Special</span>}
                              {!item.is_available && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Unavail</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => startEdit(item)} className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteConfirm(item.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* RESERVATIONS HUB */}
          {tab === 'reservations' && (
            <div>
              <h1 className="font-display text-3xl font-bold text-[#2E1A12] mb-6">Reservations Desk</h1>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F4E37]/50" />
                  <input
                    type="text"
                    placeholder="Search by name, email or booking ID…"
                    value={resSearch}
                    onChange={e => setResSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E6D3B3] rounded-xl text-sm text-[#2E1A12] placeholder-[#6F4E37]/40 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </div>
                <select
                  value={resFilter}
                  onChange={e => setResFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-[#E6D3B3] rounded-xl text-sm text-[#4E342E] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredReservations.length === 0 ? (
                  <div className="text-center py-16 text-[#6F4E37]/50">
                    <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No active seating reservations found</p>
                  </div>
                ) : filteredReservations.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-[#E6D3B3] p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-mono text-xs text-[#D4AF37] font-bold bg-[#D4AF37]/10 px-2 py-0.5 rounded-lg">
                            {r.booking_id || `B&B-${r.id.slice(0, 6).toUpperCase()}`}
                          </span>
                          <StatusBadge status={r.status} />
                        </div>
                        <p className="font-semibold text-[#2E1A12]">{r.customer_name}</p>
                        <p className="text-xs text-[#6F4E37]/70 mt-0.5">{r.customer_email} · {r.customer_phone}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#4E342E]/70">
                          <span>📅 {new Date(r.reservation_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          <span>🕐 {r.reservation_time}</span>
                          <span>👥 {r.guests} guests</span>
                          {r.table_number && <span>🪑 Table #{r.table_number}</span>}
                          <span>{r.seating_type === 'indoor' ? 'Indoor' : 'Outdoor'} · {r.ac_preference === 'ac' ? 'AC' : 'Non-AC'}</span>
                          {r.occasion !== 'none' && r.occasion && <span>🎉 {r.occasion}</span>}
                        </div>
                        {r.special_requests && (
                          <p className="text-xs text-[#6F4E37]/60 mt-2 italic">"{r.special_requests}"</p>
                        )}
                      </div>

                      {r.status?.toLowerCase() === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => updateReservationStatus(r.id, 'Confirmed')}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Confirm
                          </button>
                          <button
                            onClick={() => updateReservationStatus(r.id, 'Rejected')}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div>
              <h1 className="font-display text-3xl font-bold text-[#2E1A12] mb-6">Customer Messages</h1>
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-[#6F4E37]/50">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No contact messages found</p>
                  </div>
                ) : messages.map(m => (
                  <div key={m.id} className={`bg-white rounded-2xl border border-[#E6D3B3] p-5 relative transition-all ${!m.is_read ? 'ring-2 ring-[#D4AF37]/30 border-[#D4AF37]' : ''}`}>
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <p className="font-semibold text-[#2E1A12]">{m.name}</p>
                        <p className="text-xs text-[#6F4E37]/60">{m.email} · {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-sm text-[#4E342E] mt-3 bg-[#FAF3E8]/40 p-3 rounded-xl border border-[#E6D3B3]/40 font-serif leading-relaxed">"{m.message}"</p>
                      </div>
                      {!m.is_read && (
                        <button
                          onClick={() => markRead(m.id)}
                          className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1.5 rounded-xl hover:bg-[#D4AF37]/20 transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}