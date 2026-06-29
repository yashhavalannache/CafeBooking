import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, CalendarCheck, Users, MessageSquare,
  TrendingUp, Plus, Edit2, Trash2, Check, X, Search, RefreshCw,
  CheckCircle, XCircle, Clock, ChevronDown, Eye, Coffee, LogOut, Lock, Calendar
} from 'lucide-react';
import { supabase, type MenuItem, type Reservation, type Category, type ContactMessage } from '../lib/supabase';
import { toast } from '../components/Toast';

// ==========================================
// 📧 EMAIL SERVICE CONFIGURATION
// Configured with your verified EmailJS credentials
// ==========================================
const EMAILJS_SERVICE_ID = 'service_2zrmd2n';
const EMAILJS_TEMPLATE_ID = 'template_xk775r9';
const EMAILJS_PUBLIC_KEY = 'n8TXcpouQGNM-ptW6';

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
  const [resDateFilter, setResDateFilter] = useState('upcoming'); // 'upcoming' | '1month' | '3months' | 'all'
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

  // Internal routine to handle sending confirmation emails via REST API
  const sendConfirmationEmail = async (reservation: Reservation) => {
    if (!reservation.customer_email) return;

    const bookingId = reservation.booking_id || `B&B-${reservation.id.slice(0, 6).toUpperCase()}`;
    const formattedDate = new Date(reservation.reservation_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: reservation.customer_email,
            customer_name: reservation.customer_name,
            booking_id: bookingId,
            reservation_date: formattedDate,
            reservation_time: reservation.reservation_time,
            guests: reservation.guests,
            seating_type: reservation.seating_type || 'Standard',
            name: reservation.customer_name,
            email: reservation.customer_email
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Email service returned an error status.');
      }
      console.log('Confirmation email dispatched successfully.');
    } catch (emailErr) {
      console.error('Email dispatch failure:', emailErr);
      toast('Reservation confirmed, but notification email failed to send.', 'error');
    }
  };

  const updateReservationStatus = async (id: string, status: 'Confirmed' | 'Rejected' | 'Cancelled') => {
    const targetReservation = reservations.find(r => r.id === id);

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

    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    if (error) { 
      console.error('Supabase error:', error);
      toast('Update failed on server. Reverting...', 'error'); 
      await loadAll();
      return; 
    }
    
    if (status === 'Rejected' || status === 'Cancelled') {
      toast(`Reservation marked as ${status}.`, 'error');
    } else {
      toast(`Reservation marked as ${status}.`, 'success');
      
      if (status === 'Confirmed' && targetReservation) {
        await sendConfirmationEmail(targetReservation);
      }
    }
    
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
    const { error } = op;
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

  // Helper logic to evaluate if a reservation falls within the targeted date window
  const applyDateFiltering = (r: Reservation) => {
    if (resDateFilter === 'all') return true;

    // Convert string timestamps safely into equivalent local date midnight configurations
    const reservationDate = new Date(r.reservation_date);
    reservationDate.setHours(0, 0, 0, 0);

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    if (resDateFilter === 'upcoming') {
      return reservationDate >= todayMidnight;
    }

    const comparativeLimit = new Date();
    comparativeLimit.setHours(0, 0, 0, 0);

    if (resDateFilter === '1month') {
      comparativeLimit.setMonth(comparativeLimit.getMonth() - 1);
    } else if (resDateFilter === '3months') {
      comparativeLimit.setMonth(comparativeLimit.getMonth() - 3);
    }

    return reservationDate >= comparativeLimit;
  };

  const filteredReservations = reservations.filter(r => {
    const generatedId = r.booking_id || `B&B-${r.id.slice(0, 6).toUpperCase()}`;
    const matchSearch = !resSearch || 
      r.customer_name?.toLowerCase().includes(resSearch.toLowerCase()) || 
      generatedId.toLowerCase().includes(resSearch.toLowerCase()) || 
      r.customer_email?.toLowerCase().includes(resSearch.toLowerCase());
    
    const matchFilter = resFilter === 'all' || r.status?.toLowerCase() === resFilter.toLowerCase();
    const matchDateWindow = applyDateFiltering(r);

    return matchSearch && matchFilter && matchDateWindow;
  });

  // Specifically for the Dashboard tab view list context
  const dashboardFilteredReservations = reservations.filter(applyDateFiltering);

  const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-[#E6D3B3] rounded-xl text-[#2E1A12] text-sm placeholder-[#6F4E37]/40 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all';

  const navItems: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed, badge: stats.totalMenuItems },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck, badge: stats.pendingReservations },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: stats.unreadMessages },
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

        {/* Main Content Component Window */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20 md:pb-8">

          {/* DASHBOARD TAB VIEW */}
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

              {/* Recent Reservations Table Frame */}
              <div className="bg-white rounded-2xl border border-[#E6D3B3] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E6D3B3] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="font-semibold text-[#2E1A12]">Recent Bookings</h2>
                    <p className="text-[11px] text-[#6F4E37]/60 mt-0.5">Showing relevant timeframe entries</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto">
                    <select
                      value={resDateFilter}
                      onChange={e => setResDateFilter(e.target.value)}
                      className="px-3 py-1.5 bg-[#FAF3E8] border border-[#E6D3B3] rounded-xl text-xs text-[#4E342E] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      <option value="upcoming">Active & Upcoming</option>
                      <option value="1month">Last 1 Month</option>
                      <option value="3months">Last 3 Months</option>
                      <option value="all">All Time History</option>
                    </select>
                    <button onClick={() => setTab('reservations')} className="text-xs text-[#D4AF37] hover:text-[#C8A228] font-medium whitespace-nowrap">View all</button>
                  </div>
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
                      {dashboardFilteredReservations.slice(0, 6).map(r => (
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
                      {dashboardFilteredReservations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-sm text-[#6F4E37]/50">No reservations found matching this timeframe context.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MENU MANAGEMENT TAB VIEW */}
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

              {/* Menu Items Table Matrix */}
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

          {/* RESERVATIONS HUB DESK */}
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
                
                {/* 📅 New Timeframe Context Filter */}
                <select
                  value={resDateFilter}
                  onChange={e => setResDateFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-[#E6D3B3] rounded-xl text-sm text-[#4E342E] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="upcoming">Active & Upcoming</option>
                  <option value="1month">Last 1 Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="all">All History</option>
                </select>

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
                  <div className="text-center py-16 text-[#6F4E37]/50 bg-white rounded-2xl border border-[#E6D3B3]">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#6F4E37]" />
                    <p className="text-sm font-medium">No reservations match the selected search, status, or timeframe constraints.</p>
                  </div>
                ) : (
                  filteredReservations.map(r => {
                    const generatedId = r.booking_id || `B&B-${r.id.slice(0, 6).toUpperCase()}`;
                    return (
                      <div key={r.id} className="bg-white border border-[#E6D3B3] rounded-2xl p-5 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF3E8] flex items-center justify-center text-[#D4AF37] flex-shrink-0 mt-0.5">
                              <CalendarCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#D4AF37] tracking-wider uppercase">{generatedId}</span>
                                <StatusBadge status={r.status} />
                              </div>
                              <h3 className="font-display font-bold text-[#2E1A12] mt-1 text-base">{r.customer_name}</h3>
                              <p className="text-xs text-[#6F4E37]/70 mt-0.5">{r.customer_email} · {r.customer_phone || 'No Phone'}</p>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-[#4E342E]/80 font-medium">
                                <span className="flex items-center gap-1.5 bg-[#FAF3E8] px-2.5 py-1 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-[#6F4E37]/70" />
                                  {new Date(r.reservation_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} @ {r.reservation_time}
                                </span>
                                <span className="flex items-center gap-1.5 bg-[#FAF3E8] px-2.5 py-1 rounded-lg">
                                  <Users className="w-3.5 h-3.5 text-[#6F4E37]/70" />
                                  {r.guests} Guests ({r.seating_type || 'Standard'})
                                </span>
                              </div>
                              {r.special_requests && (
                                <div className="mt-2.5 p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-[#6F4E37] italic">
                                  &ldquo;{r.special_requests}&rdquo;
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 justify-end sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#FAF3E8]">
                            {r.status?.toLowerCase() === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateReservationStatus(r.id, 'Confirmed')}
                                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" /> Confirm
                                </button>
                                <button
                                  onClick={() => updateReservationStatus(r.id, 'Rejected')}
                                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {r.status?.toLowerCase() === 'confirmed' && (
                              <button
                                onClick={() => updateReservationStatus(r.id, 'Cancelled')}
                                className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-white border border-[#E6D3B3] text-[#6F4E37]/70 px-4 py-2 rounded-xl text-xs font-semibold hover:text-red-600 hover:border-red-200 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* MESSAGES INBOX VIEW */}
          {tab === 'messages' && (
            <div>
              <h1 className="font-display text-3xl font-bold text-[#2E1A12] mb-6">Inbox Messages</h1>
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`bg-white border rounded-2xl p-5 transition-all ${!m.is_read ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/20 shadow-sm' : 'border-[#E6D3B3]'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-[#2E1A12] text-base">{m.name}</h3>
                          {!m.is_read && <span className="bg-[#D4AF37]/15 text-[#6F4E37] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>}
                        </div>
                        <p className="text-xs text-[#6F4E37]/70 mt-0.5">{m.email} · {m.subject || 'General Inquiry'}</p>
                        <p className="text-sm text-[#4E342E] mt-3 whitespace-pre-wrap bg-[#FAF3E8]/40 p-3 rounded-xl border border-[#E6D3B3]/40">{m.message}</p>
                        <p className="text-[10px] text-[#6F4E37]/40 mt-2">{new Date(m.created_at).toLocaleString('en-IN')}</p>
                      </div>
                      {!m.is_read && (
                        <button onClick={() => markRead(m.id)} className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-[#C8A228] font-bold bg-[#FAF3E8] px-3 py-1.5 rounded-xl border border-[#E6D3B3]">
                          <Check className="w-3.5 h-3.5" /> Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-16 text-[#6F4E37]/50 bg-white rounded-2xl border border-[#E6D3B3]">No contact history submissions found.</div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}