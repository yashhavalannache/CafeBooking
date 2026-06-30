import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, CalendarCheck, Users, MessageSquare,
  TrendingUp, Plus, Edit2, Trash2, Check, X, Search, RefreshCw,
  CheckCircle, XCircle, Clock, ChevronDown, Eye, Coffee, LogOut, Lock, Calendar, RotateCcw, AlertTriangle, Filter, SlidersHorizontal
} from 'lucide-react';
import { supabase, type MenuItem, type Reservation, type Category, type ContactMessage } from '../lib/supabase';
import { toast } from '../components/Toast';

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
    <div className="bg-white rounded-2xl p-6 border border-[#E6D3B3]/60 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {sub && <span className="text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-semibold border border-green-100">{sub}</span>}
      </div>
      <p className="font-display text-3xl font-bold text-[#2E1A12] tracking-tight">{value.toLocaleString()}</p>
      <p className="text-xs text-[#6F4E37]/70 mt-1.5 font-semibold uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalStatus = status?.toLowerCase() || 'pending';
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200/70 left-border border-l-4 border-l-amber-500',
    confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200/70 left-border border-l-4 border-l-emerald-500',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200/70 left-border border-l-4 border-l-rose-500',
    cancelled: 'bg-gray-50 text-gray-600 border-gray-200 left-border border-l-4 border-l-gray-400',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border shadow-sm ${map[normalStatus] || 'bg-gray-100 text-gray-600'}`}>
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
  const [tab, setTab] = useState<Tab>('menu'); 
  const [stats, setStats] = useState<Stats>({ totalReservations: 0, todayReservations: 0, pendingReservations: 0, totalMenuItems: 0, totalMessages: 0, unreadMessages: 0 });
  const [menuItems, setMenuItems] = useState<(MenuItem & { categories?: Category })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuForm, setMenuForm] = useState<MenuFormData>(emptyMenuForm);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  
  const [resSearch, setResSearch] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  
  const [resFilter, setResFilter] = useState('all');
  const [resDateFilter, setResDateFilter] = useState('all'); 
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [undoCountdown, setUndoCountdown] = useState(3);
  const [reservationsBackup, setReservationsBackup] = useState<Reservation[]>([]);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadAll = async () => {
    if (isDeletingAll) return;

    setLoading(true);
    try {
      const [res, items, msgs, cats] = await Promise.all([
        supabase.from('reservations').select('*').order('reservation_date', { ascending: false }).order('reservation_time', { ascending: true }),
        supabase.from('menu_items').select('*, categories(*)').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
      ]);

      const resData: Reservation[] = res.data || [];
      const msgData: any[] = msgs.data || [];

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
        unreadMessages: msgData.filter(m => m.is_read === false || m.is_read === null || m.is_read === undefined).length,
      });
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
      if (typeof toast === 'function') toast('Failed to update live administration tables.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const syncLocalStats = (currentReservationsArray: Reservation[]) => {
    setStats(prev => ({
      ...prev,
      totalReservations: currentReservationsArray.length,
      todayReservations: currentReservationsArray.filter(r => r.reservation_date === today).length,
      pendingReservations: currentReservationsArray.filter(r => r.status?.toLowerCase() === 'pending').length,
    }));
  };

  const handleDeleteAllReservations = () => {
    if (reservations.length === 0) {
      if (typeof toast === 'function') toast('No reservations to delete.', 'error');
      return;
    }

    const snapshot = [...reservations];
    setReservationsBackup(snapshot);
    setReservations([]);
    syncLocalStats([]);
    setIsDeletingAll(true);
    setUndoCountdown(3);

    countdownIntervalRef.current = setInterval(() => {
      setUndoCountdown(prev => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    undoTimerRef.current = setTimeout(async () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setIsDeletingAll(false);

      const { error } = await supabase
        .from('reservations')
        .delete()
        .gt('created_at', '1970-01-01T00:00:00.000Z'); 
      
      if (error) {
        console.error('Failed sweeping items from database:', error);
        if (typeof toast === 'function') toast(`Error: ${error.message || 'Check your DELETE RLS policy.'}`, 'error');
        setReservations(snapshot);
        syncLocalStats(snapshot);
      } else {
        if (typeof toast === 'function') toast('Reservations requested cleared permanently.', 'success');
        setReservationsBackup([]);
        await loadAll();
      }
    }, 3000);
  };

  const handleUndoDeleteAll = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    setReservations(reservationsBackup);
    syncLocalStats(reservationsBackup);
    
    setIsDeletingAll(false);
    setReservationsBackup([]);
    if (typeof toast === 'function') toast('Deletion cancelled. Data recovered.', 'success');
  };

  const sendConfirmationEmail = async (reservation: Reservation) => {
    if (!reservation.customer_email) return;
    const bookingId = reservation.booking_id || `B&B-${reservation.id.slice(0, 6).toUpperCase()}`;
    const formattedDate = new Date(reservation.reservation_date).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
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
            seating_type: reservation.seating_type || 'Standard'
          }
        }),
      });
    } catch (emailErr) {
      console.error('Email failure:', emailErr);
    }
  };

  const updateReservationStatus = async (id: string, status: 'Confirmed' | 'Rejected' | 'Cancelled') => {
    const targetReservation = reservations.find(r => r.id === id);
    if (!targetReservation) return;

    const updatedReservations = reservations.map(r => r.id === id ? { ...r, status } : r);
    setReservations(updatedReservations);
    syncLocalStats(updatedReservations);

    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    if (error) { 
      if (typeof toast === 'function') toast('Update failed on server.', 'error'); 
      await loadAll();
      return; 
    }
    
    if (typeof toast === 'function') toast(`Reservation marked as ${status}.`, status === 'Confirmed' ? 'success' : 'error');
    if (status === 'Confirmed') await sendConfirmationEmail(targetReservation);
    await loadAll();
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) { if (typeof toast === 'function') toast('Delete failed.', 'error'); return; }
    if (typeof toast === 'function') toast('Item deleted.', 'success');
    setDeleteConfirm(null);
    loadAll();
  };

  const saveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...menuForm,
      price: parseFloat(menuForm.price),
      prep_time: parseInt(menuForm.prep_time),
      rating: parseFloat(menuForm.rating),
      category_id: menuForm.category_id || null,
    };
    const op = editingItemId ? supabase.from('menu_items').update(payload).eq('id', editingItemId) : supabase.from('menu_items').insert(payload);
    const { error } = op;
    if (error) { if (typeof toast === 'function') toast('Save failed.', 'error'); return; }
    setMenuForm(emptyMenuForm);
    setEditingItemId(null);
    setShowMenuForm(false);
    loadAll();
  };

  const startEdit = (item: MenuItem) => {
    setMenuForm({
      name: item.name, description: item.description || '', ingredients: item.ingredients || '',
      price: String(item.price), image_url: item.image_url || '', prep_time: String(item.prep_time),
      rating: String(item.rating), category_id: item.category_id || '', is_vegetarian: item.is_vegetarian,
      is_bestseller: item.is_bestseller, is_todays_special: item.is_todays_special, is_available: item.is_available,
    });
    setEditingItemId(item.id);
    setShowMenuForm(true);
  };

  const markRead = async (id: string) => {
    const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    if (error) { if (typeof toast === 'function') toast('Could not update message.', 'error'); return; }
    loadAll();
  };

  const applyDateFiltering = (r: Reservation) => {
    if (resDateFilter === 'all') return true;
    const reservationDate = new Date(r.reservation_date);
    reservationDate.setHours(0, 0, 0, 0);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (resDateFilter === 'upcoming') return reservationDate >= todayMidnight;
    return true;
  };

  const filteredReservations = reservations.filter(r => {
    const generatedId = r.booking_id || `B&B-${r.id.slice(0, 6).toUpperCase()}`;
    const matchSearch = !resSearch || r.customer_name?.toLowerCase().includes(resSearch.toLowerCase()) || generatedId.toLowerCase().includes(resSearch.toLowerCase());
    const matchFilter = resFilter === 'all' || r.status?.toLowerCase() === resFilter.toLowerCase();
    return matchSearch && matchFilter && applyDateFiltering(r);
  });

  const filteredMenuItems = menuItems.filter(item => {
    if (!menuSearch) return true;
    const keyword = menuSearch.toLowerCase();
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword) ||
      item.ingredients?.toLowerCase().includes(keyword)
    );
  });

  const dashboardFilteredReservations = reservations.filter(applyDateFiltering);
  const inputCls = 'w-full px-4 py-3 bg-white border border-[#E6D3B3] rounded-xl text-[#2E1A12] text-sm focus:outline-none focus:border-[#4E342E] focus:ring-2 focus:ring-[#4E342E]/10 transition-all';
  const navItems: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed, badge: stats.totalMenuItems },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck, badge: stats.pendingReservations },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: stats.unreadMessages },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col selection:bg-[#4E342E]/10 font-sans">
      {/* Header Accent Line */}
      <div className="h-1 bg-gradient-to-r from-[#D4AF37] via-[#4E342E] to-[#6F4E37]" />

      <div className="bg-[#2E1A12] px-6 sm:px-10 py-4 flex items-center justify-between border-b border-[#D4AF37]/20 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6239] flex items-center justify-center shadow-inner group transition-transform hover:rotate-6">
            <Coffee className="w-5 h-5 text-[#2E1A12]" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-base tracking-wide">Brewed & Bliss</p>
            <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest opacity-90">The Artisanal Experience</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={loadAll} disabled={loading} className="p-2 text-[#E6D3B3]/70 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a href="/" className="text-xs font-semibold bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-[#E6D3B3] hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" /> Exit Portal
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-[#E6D3B3]/60 hidden md:flex flex-col py-8 px-4 justify-between shadow-sm">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-[#6F4E37]/50 uppercase tracking-wider px-3.5 mb-3">Main Control Console</p>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id} onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    tab === item.id 
                      ? 'bg-[#4E342E] text-white shadow-md shadow-[#4E342E]/10 translate-x-1' 
                      : 'text-[#6F4E37] hover:bg-[#FAF3E8] hover:text-[#4E342E]'
                  }`}
                >
                  <span className="flex items-center gap-3"><item.icon className="w-4 h-4" />{item.label}</span>
                  {!!item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      tab === item.id ? 'bg-white/20 text-white' : 'bg-[#4E342E]/5 text-[#4E342E]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <div className="bg-[#FAF3E8]/50 rounded-xl p-4 border border-[#E6D3B3]/40 text-center">
            <p className="text-[11px] font-bold text-[#6F4E37]">System Security Active</p>
            <p className="text-[10px] text-[#6F4E37]/60 mt-0.5">RLS Enforcement Protocol</p>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6D3B3] flex shadow-xl">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold ${tab === item.id ? 'text-[#4E342E] bg-[#FAF3E8]/30' : 'text-[#6F4E37]/60'}`}>
              <item.icon className="w-5 h-5" />{item.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 pb-24 md:pb-10">
          
          {tab === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="font-display text-3xl font-black text-[#2E1A12] tracking-tight mb-8">Dashboard Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
                <StatCard icon={CalendarCheck} label="Total Bookings" value={stats.totalReservations} color="bg-blue-50 text-blue-600 border border-blue-100" />
                <StatCard icon={Clock} label="Today's Seating" value={stats.todayReservations} sub="Live" color="bg-amber-50 text-amber-600 border border-amber-100" />
                <StatCard icon={RefreshCw} label="Pending Review" value={stats.pendingReservations} color="bg-yellow-50 text-yellow-700 border border-yellow-100" />
                <StatCard icon={UtensilsCrossed} label="Active Menu" value={stats.totalMenuItems} color="bg-[#FAF3E8] text-[#6F4E37] border border-[#E6D3B3]/40" />
                <StatCard icon={MessageSquare} label="Total Messages" value={stats.totalMessages} color="bg-purple-50 text-purple-600 border border-purple-100" />
                <StatCard icon={Eye} label="Unread Inbox" value={stats.unreadMessages} color="bg-rose-50 text-rose-500 border border-rose-100" />
              </div>

              <div className="bg-white rounded-2xl border border-[#E6D3B3]/60 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E6D3B3]/50 flex justify-between items-center bg-[#FAF6F0]/30">
                  <h2 className="font-bold text-[#2E1A12] tracking-wide flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#6F4E37]" /> Recent Guest Bookings
                  </h2>
                  <button onClick={() => setTab('reservations')} className="text-xs text-[#6F4E37] font-bold hover:underline bg-[#FAF3E8] px-3 py-1.5 rounded-lg border border-[#E6D3B3]/50 transition-all">View Desk</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FAF3E8]/60 text-left border-b border-[#E6D3B3]/40">
                        {['Booking ID', 'Customer Details', 'Schedule', 'Party Size', 'Status'].map(h => <th key={h} className="px-6 py-4 text-xs font-bold text-[#6F4E37] uppercase tracking-wider">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6D3B3]/40">
                      {dashboardFilteredReservations.slice(0, 6).map(r => (
                        <tr key={r.id} className="hover:bg-[#FAF3E8]/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-[#D4AF37]">{r.booking_id || `B&B-${r.id.slice(0, 6).toUpperCase()}`}</td>
                          <td className="px-6 py-4 font-semibold text-[#2E1A12]">{r.customer_name}</td>
                          <td className="px-6 py-4 text-[#4E342E]/80">
                            <span className="font-medium">{new Date(r.reservation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            <span className="text-[#6F4E37]/60 mx-1.5">·</span>
                            <span className="text-xs bg-[#FAF3E8] px-2 py-0.5 rounded border border-[#E6D3B3]/40 font-mono font-medium">{r.reservation_time}</span>
                          </td>
                          <td className="px-6 py-4 font-medium text-[#4E342E]/80">{r.guests} guests</td>
                          <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'menu' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="font-display text-3xl font-black text-[#2E1A12] tracking-tight">Menu Catalog</h1>
                  <p className="text-xs text-[#6F4E37]/70 mt-1 font-medium">Manage corporate active dishes, descriptions, and pricing lists.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial min-w-[240px]">
                    <Search className="w-4 h-4 text-[#6F4E37]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search items or keywords..." 
                      value={menuSearch} 
                      onChange={e => setMenuSearch(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#E6D3B3] rounded-xl focus:outline-none focus:border-[#4E342E] shadow-sm transition-all" 
                    />
                  </div>
                  <button onClick={() => { setShowMenuForm(true); setEditingItemId(null); setMenuForm(emptyMenuForm); }} className="flex items-center gap-2 bg-[#4E342E] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#3E2925] transition-all whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add New Dish
                  </button>
                </div>
              </div>

              {showMenuForm && (
                <div className="bg-white rounded-2xl border border-[#E6D3B3] p-6 mb-8 shadow-md">
                  <form onSubmit={saveMenuItem} className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#4E342E] uppercase tracking-wider mb-1.5">Item Name *</label>
                      <input value={menuForm.name} onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))} className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4E342E] uppercase tracking-wider mb-1.5">Price (₹) *</label>
                      <input type="number" step="0.01" value={menuForm.price} onChange={e => setMenuForm(f => ({ ...f, price: e.target.value }))} className={inputCls} required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#4E342E] uppercase tracking-wider mb-1.5">Culinary Description</label>
                      <textarea rows={2} value={menuForm.description} onChange={e => setMenuForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4E342E] uppercase tracking-wider mb-1.5">Assigned Category</label>
                      <select value={menuForm.category_id} onChange={e => setMenuForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls}>
                        <option value="">— Uncategorized —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex gap-3 justify-end border-t border-[#E6D3B3]/40 pt-4">
                      <button type="button" onClick={() => setShowMenuForm(false)} className="px-4 py-2 border border-[#E6D3B3] text-sm rounded-xl font-medium text-[#6F4E37]">Cancel</button>
                      <button type="submit" className="px-5 py-2 bg-[#4E342E] text-white text-sm rounded-xl font-bold">Commit Item</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Enhanced, Highly Sophisticated Row-List View */}
              {filteredMenuItems.length > 0 ? (
                <div className="space-y-3.5">
                  {filteredMenuItems.map(item => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl border border-[#E6D3B3]/60 p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-4">
                        {/* Assigned image frame beside item name on the left */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAF3E8] border border-[#E6D3B3]/60 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Graceful fallback if image fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Coffee className="w-6 h-6 text-[#8C6239]" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-[#2E1A12] text-base group-hover:text-[#4E342E] transition-colors">{item.name}</h3>
                          {item.description ? (
                            <p className="text-xs text-[#6F4E37]/70 mt-1 line-clamp-1 max-w-xl font-medium">{item.description}</p>
                          ) : (
                            <span className="text-[10px] text-[#6F4E37]/40 italic mt-1 block">No dynamic summary provided</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="font-mono font-black text-lg text-[#4E342E] bg-[#FAF3E8]/70 px-3 py-1 rounded-xl border border-[#E6D3B3]/40">
                          ₹{item.price}
                        </span>
                        
                        {/* Beautiful modern premium icon actions layout */}
                        <div className="flex items-center gap-1.5 border-l border-[#E6D3B3]/50 pl-4">
                          <button 
                            onClick={() => startEdit(item)} 
                            className="p-2.5 text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-100 rounded-xl transition-all shadow-sm"
                            title="Edit catalog details"
                          >
                            <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(item.id)} 
                            className="p-2.5 text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-100 rounded-xl transition-all shadow-sm"
                            title="Purge recipe log"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E6D3B3]/60 text-center py-16 px-4 shadow-sm">
                  <div className="w-12 h-12 bg-[#FAF3E8] border border-[#E6D3B3]/60 text-[#6F4E37]/60 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#2E1A12] text-sm">No dishes matched search</h3>
                  <p className="text-xs text-[#6F4E37]/60 mt-1 max-w-xs mx-auto">We couldn't find any menu catalog records matches for keyword "{menuSearch}".</p>
                </div>
              )}
            </div>
          )}

          {tab === 'reservations' && (
            <div className="animate-fade-in">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 mb-8">
                <div>
                  <h1 className="font-display text-3xl font-black text-[#2E1A12] tracking-tight">Reservations Desk</h1>
                  <p className="text-xs text-[#6F4E37]/70 mt-1 font-medium">Verify incoming restaurant seating logs and process confirmations.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  <div className="relative flex-1 sm:flex-initial min-w-[260px]">
                    <Search className="w-4 h-4 text-[#6F4E37]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search booking ID or customer..." 
                      value={resSearch} 
                      onChange={e => setResSearch(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#E6D3B3] rounded-xl focus:outline-none focus:border-[#4E342E] shadow-sm transition-all" 
                    />
                  </div>
                  
                  <button 
                    onClick={handleDeleteAllReservations} 
                    disabled={isDeletingAll || reservations.length === 0} 
                    className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100/70 disabled:opacity-30 transition-all shadow-sm ml-auto sm:ml-0"
                  >
                    Flush All Entries
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#E6D3B3]/60 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-[#6F4E37]/60 flex items-center gap-1 mr-2 px-1">
                    <Filter className="w-3.5 h-3.5" /> Status:
                  </span>
                  {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map(statusOption => (
                    <button
                      key={statusOption}
                      onClick={() => setResFilter(statusOption)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        resFilter === statusOption 
                          ? 'bg-[#4E342E] text-white shadow-sm' 
                          : 'bg-[#FAF6F0] text-[#6F4E37] border border-[#E6D3B3]/40 hover:bg-[#FAF3E8]'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-[#E6D3B3]/40 pt-3 md:pt-0">
                  <span className="text-xs font-bold text-[#6F4E37]/60 flex items-center gap-1 px-1 whitespace-nowrap">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Timeline:
                  </span>
                  <select
                    value={resDateFilter}
                    onChange={e => setResDateFilter(e.target.value)}
                    className="text-xs font-bold text-[#4E342E] bg-[#FAF6F0] border border-[#E6D3B3]/60 rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="all">All Dates History</option>
                    <option value="upcoming">Upcoming & Today</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E6D3B3]/60 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FAF3E8]/60 border-b border-[#E6D3B3]/50 text-left">
                        {['Booking ID', 'Customer Details', 'Date & Seating Time', 'Guests', 'Status Flag', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-4 text-xs font-bold text-[#6F4E37] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6D3B3]/40">
                      {filteredReservations.map(r => (
                        <tr key={r.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                          <td className="px-6 py-5 font-mono text-xs font-bold text-[#D4AF37] tracking-wide">
                            {r.booking_id || `B&B-${r.id.slice(0, 6).toUpperCase()}`}
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-[#2E1A12] text-sm">{r.customer_name}</p>
                            <p className="text-xs text-[#6F4E37]/70 font-medium mt-0.5">{r.customer_email}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-semibold text-[#4E342E]">
                              {new Date(r.reservation_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-[#6F4E37]/60 font-mono mt-0.5">{r.reservation_time}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="bg-[#FAF3E8] text-[#4E342E] px-2.5 py-1 rounded-lg border border-[#E6D3B3]/40 font-semibold text-xs">
                              {r.guests} Guests
                            </span>
                          </td>
                          <td className="px-6 py-5"><StatusBadge status={r.status} /></td>
                          <td className="px-6 py-5">
                            {r.status?.toLowerCase() === 'pending' ? (
                              <div className="flex gap-1.5">
                                <button 
                                  onClick={() => updateReservationStatus(r.id, 'Confirmed')} 
                                  className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all shadow-sm"
                                  title="Approve Reservation"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <button 
                                  onClick={() => updateReservationStatus(r.id, 'Rejected')} 
                                  className="p-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all shadow-sm"
                                  title="Reject Reservation"
                                >
                                  <X className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-[#6F4E37]/40 font-medium italic select-none bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {filteredReservations.length === 0 && (
                <div className="bg-white rounded-2xl border border-[#E6D3B3]/60 text-center py-16 px-4 shadow-sm mt-4">
                  <div className="w-12 h-12 bg-[#FAF3E8] border border-[#E6D3B3]/60 text-[#6F4E37]/60 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#2E1A12] text-sm">No reservations found</h3>
                  <p className="text-xs text-[#6F4E37]/60 mt-1 max-w-xs mx-auto">There are no logs matching your selected status filter criteria or keyword search queries.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'messages' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="font-display text-3xl font-black text-[#2E1A12] tracking-tight">Inbox Logs</h1>
                  <p className="text-xs text-[#6F4E37]/70 mt-1 font-medium">Review customer contact form submissions filtered via Supabase.</p>
                </div>
                <span className="text-xs bg-[#4E342E] text-[#FFF8E7] px-3 py-1.5 rounded-xl border border-[#D4AF37]/20 font-bold shadow-sm">
                  {messages.length} Records Tracked
                </span>
              </div>

              <div className="space-y-4">
                {messages.map(m => {
                  const customerName = m.name || m.customer_name || m.fullName || 'Anonymous Submitter';
                  const customerEmail = m.email || m.customer_email || m.emailAddress || 'No Email Registered';
                  const bodyMessage = m.message || m.body || m.text || m.comments || 'Empty message content submitted.';
                  const isReadFlag = m.is_read === true;
                  const logTime = m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Unknown time';

                  return (
                    <div key={m.id || Math.random()} className={`p-6 rounded-2xl border transition-all duration-300 ${isReadFlag ? 'bg-white/80 border-[#E6D3B3]/50 opacity-80' : 'bg-white border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]/10'}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                        <div>
                          <span className="font-bold text-[#2E1A12] text-sm">{customerName}</span>
                          <span className="text-xs text-[#6F4E37]/60 font-semibold sm:ml-2">({customerEmail})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono font-medium text-[#6F4E37]/50">{logTime}</span>
                          {!isReadFlag && m.id && (
                            <button onClick={() => markRead(m.id)} className="text-xs font-bold text-[#4E342E] bg-[#FAF3E8] border border-[#E6D3B3] px-2.5 py-1 rounded-lg hover:bg-[#4E342E] hover:text-white transition-all flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" /> Read
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-[#4E342E] bg-[#FAF6F0]/60 p-4 rounded-xl border border-[#E6D3B3]/40 whitespace-pre-wrap leading-relaxed font-medium">{bodyMessage}</p>
                    </div>
                  );
                })}

                {messages.length === 0 && (
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-[#E6D3B3]/60 text-center py-12 text-sm text-[#6F4E37]/50 shadow-sm">
                      Your communication inbox tray is completely empty.
                    </div>
                    <div className="bg-amber-50/60 border border-amber-200/80 backdrop-blur-sm rounded-2xl p-5 flex gap-3.5 shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Why isn't my message showing up here?</h4>
                        <p className="text-xs text-amber-800/90 mt-1 leading-relaxed font-medium">
                          If you submitted a test message from your website's contact form and this page remains empty, **Supabase is blocking the insert submission due to Row Level Security (RLS)**. 
                        </p>
                        <ol className="text-xs text-amber-900 font-bold list-decimal list-inside mt-3 space-y-2 opacity-95">
                          <li>Log into your <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline text-amber-700 hover:text-amber-800">Supabase Dashboard</a>.</li>
                          <li>Go to <strong>Database</strong> &rarr; <strong>Policies</strong> &rarr; find table <code>contact_messages</code>.</li>
                          <li>Ensure an <strong>INSERT</strong> policy exists allowing access for the public <code>anon</code> role.</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Elegant floating undo countdown popup */}
      {isDeletingAll && (
        <div className="fixed bottom-24 md:bottom-8 right-6 z-50 bg-[#2E1A12] text-white rounded-2xl p-5 shadow-2xl max-w-sm flex items-center justify-between gap-6 border border-[#D4AF37]/30 animate-slide-up">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Wiping reservations logs</span>
            <span className="text-sm font-semibold mt-0.5 text-white/90">Database commit execution in <span className="font-mono bg-white/10 text-white px-1.5 py-0.5 rounded font-bold">{undoCountdown}s</span></span>
          </div>
          <button onClick={handleUndoDeleteAll} className="flex items-center gap-1.5 bg-[#FAF3E8] text-[#2E1A12] px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-white transition-all">
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" /> Undo
          </button>
        </div>
      )}

    </div>
  );
}