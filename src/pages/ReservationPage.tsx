import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, MapPin, Star, ChevronRight, 
  CheckCircle, X, RefreshCw, User, Download, FileText, 
  Home, Coffee, CupSoda, Utensils 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import QRCode from 'react-qr-code';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, type Reservation } from '../lib/supabase';
import { toast } from '../components/Toast';

// Simulated routing hooks safely isolated to prevent runtime crashes if context is missing
const useNavigateMock = () => {
  try {
    const { useNavigate } = require('react-router-dom');
    return useNavigate();
  } catch {
    return (path: string) => { window.location.href = path; };
  }
};

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM',
];

type TableStatus = 'available' | 'booked' | 'selected';

type TableData = {
  id: number;
  capacity: number;
  zone: string;
};

const TABLES: TableData[] = [
  { id: 1, capacity: 2, zone: 'Window' },
  { id: 2, capacity: 4, zone: 'Window' },
  { id: 3, capacity: 2, zone: 'Center' },
  { id: 4, capacity: 6, zone: 'Center' },
  { id: 5, capacity: 4, zone: 'Center' },
  { id: 6, capacity: 2, zone: 'Corner' },
  { id: 7, capacity: 8, zone: 'Private' },
  { id: 8, capacity: 4, zone: 'Corner' },
  { id: 9, capacity: 2, zone: 'Bar' },
  { id: 10, capacity: 4, zone: 'Bar' },
  { id: 11, capacity: 2, zone: 'Outdoor' },
  { id: 12, capacity: 6, zone: 'Outdoor' },
];

type FormData = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  seating_type: string;
  ac_preference: string;
  occasion: string;
  special_requests: string;
};

const defaultForm: FormData = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  reservation_date: '',
  reservation_time: '',
  guests: 2,
  seating_type: 'indoor',
  ac_preference: 'ac',
  occasion: 'none',
  special_requests: '',
};

// GLOBAL COMPONENT INJECTION TO FIX SINGLE-CHARACTER FOCUS BUG
const Field = ({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-[#4E342E] mb-1.5">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

function ConfirmationModal({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) {
  const navigate = useNavigateMock();
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownloadReceipt = () => {
    toast('Generating PDF Receipt Asset...', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-md">
      <Confetti width={windowDimensions.width} height={windowDimensions.height} recycle={false} numberOfPieces={400} />
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.18)] z-10 my-8 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-[#6F4E37]/60 hover:text-[#4E342E] transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center mx-auto mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-[#2E1A12] mb-1">Reservation Confirmed</h2>
          <p className="text-[#6F4E37]/80 text-sm font-medium">Your presentation space at the café is locked in.</p>
        </div>

        <div className="rounded-2xl bg-[#2E1A12] p-6 text-center mb-6 shadow-lg border border-white/10">
          <p className="text-[#D4AF37] uppercase tracking-[0.25em] text-xs font-semibold">Booking ID</p>
          <h1 className="text-white text-3xl sm:text-4xl font-bold mt-2 tracking-wider font-mono">
            {reservation.booking_id || "BK-9A3X72"}
          </h1>
        </div>

        <hr className="border-[#E6D3B3] my-4" />

        <div className="space-y-4 my-6 text-sm text-[#4E342E]">
          {[
            { icon: <User className="w-4 h-4 text-[#D4AF37]" />, label: 'Guest Name', value: reservation.customer_name },
            { 
              icon: <Calendar className="w-4 h-4 text-[#D4AF37]" />, 
              label: 'Date Specified', 
              value: new Date(reservation.reservation_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) 
            },
            { icon: <Clock className="w-4 h-4 text-[#D4AF37]" />, label: 'Requested Time', value: reservation.reservation_time },
            { icon: <Users className="w-4 h-4 text-[#D4AF37]" />, label: 'Party Volume', value: `${reservation.guests} ${reservation.guests === 1 ? 'Guest' : 'Guests'}` },
            { icon: <Utensils className="w-4 h-4 text-[#D4AF37]" />, label: 'Assigned Spot', value: reservation.table_number ? `Table #${reservation.table_number}` : 'To be assigned' },
            { 
              icon: <MapPin className="w-4 h-4 text-[#D4AF37]" />, 
              label: 'Zone Location', 
              value: `${reservation.seating_type === 'indoor' ? 'Indoor' : 'Outdoor'} · ${reservation.ac_preference === 'ac' ? 'AC' : 'Non-AC'}` 
            },
          ].map((row, index) => (
            <div key={index} className="flex justify-between items-center bg-white/40 px-4 py-2.5 rounded-xl border border-white/20">
              <div className="flex items-center gap-2.5">
                {row.icon}
                <span className="text-[#6F4E37]/70 font-medium">{row.label}</span>
              </div>
              <strong className="text-[#2E1A12] font-semibold text-right">{row.value}</strong>
            </div>
          ))}
        </div>

        <hr className="border-[#E6D3B3] my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-6 bg-[#FAF3E8]/60 p-4 rounded-2xl border border-[#E6D3B3]/50">
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Pending Confirmation
            </span>
            <p className="text-xs text-[#6F4E37]/80 mt-2 leading-relaxed">
              Scan this dynamic passport entry layout key configuration directly at our reception check-in.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-xl border border-[#E6D3B3] shadow-sm">
              <QRCode value={reservation.booking_id || "BK-9A3X72"} size={110} />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleDownloadReceipt}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#FAF3E8] text-[#4E342E] py-3 rounded-xl font-semibold text-sm border border-[#E6D3B3] transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { onClose(); navigate('/menu'); }}
              className="flex items-center justify-center gap-2 bg-[#4E342E] hover:bg-[#2E1A12] text-white py-3 rounded-xl font-medium text-sm transition-all"
            >
              <FileText className="w-4 h-4" /> View Menu
            </button>
            <button
              onClick={() => { onClose(); navigate('/'); }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] py-3 rounded-xl font-bold text-sm hover:shadow-md transition-all"
            >
              <Home className="w-4 h-4" /> Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ReservationPage() {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [bookedTables, setBookedTables] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (!form.reservation_date || !form.reservation_time) return;
    supabase
      .rpc('get_booked_tables', {
        res_date: form.reservation_date,
        res_time: form.reservation_time,
      })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching booked tables:', error);
          return;
        }
        setBookedTables((data || []).map((r: any) => r.table_number).filter(Boolean));
        setSelectedTable(null);
      });
  }, [form.reservation_date, form.reservation_time]);

  const getTableStatus = (tableId: number): TableStatus => {
    if (selectedTable === tableId) return 'selected';
    if (bookedTables.includes(tableId)) return 'booked';
    return 'available';
  };

  const isTableSuitable = (table: TableData) => table.capacity >= form.guests;

  const validate = () => {
    const errs: Partial<FormData> = {};
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required';
    if (!form.customer_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) errs.customer_email = 'Valid email required';
    if (!form.customer_phone.trim() || !/^\d{10}$/.test(form.customer_phone.replace(/\D/g, ''))) errs.customer_phone = 'Valid 10-digit phone required';
    if (!form.reservation_date) errs.reservation_date = 'Date is required';
    if (!form.reservation_time) errs.reservation_time = 'Time is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast('Please fix the errors above.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([
          {
            customer_name: form.customer_name,
            customer_email: form.customer_email,
            customer_phone: form.customer_phone,
            reservation_date: form.reservation_date,
            reservation_time: form.reservation_time,
            guests: form.guests,
            seating_type: form.seating_type,
            ac_preference: form.ac_preference,
            occasion: form.occasion,
            special_requests: form.special_requests,
            table_number: selectedTable,
            status: 'pending',
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase DB Insert Error Details:', error);
        toast(`Error: ${error.message}`, 'error');
        return;
      }

      setConfirmation(data as Reservation);
      setForm(defaultForm);
      setSelectedTable(null);
    } catch (err) {
      console.error('Unexpected runtime code error:', err);
      toast('An unexpected processing error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const inputCls = (field: keyof FormData) =>
    `w-full px-4 py-3 bg-white border rounded-xl text-[#2E1A12] text-sm placeholder-[#6F4E37]/40 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
        : 'border-[#E6D3B3] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20'
    }`;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FFF8E7, #FAF3E8, #F8E8C8)" }}
    >
      <Coffee className="absolute top-20 left-10 lg:left-25 opacity-[0.06] w-36 h-36 pointer-events-none text-[#2E1A12]" />
      <CupSoda className="absolute bottom-20 right-10 lg:right-25 opacity-[0.06] w-40 h-40 pointer-events-none text-[#2E1A12]" />
      <Coffee className="absolute bottom-1/3 left-[-40px] opacity-[0.03] w-48 h-48 rotate-45 pointer-events-none text-[#2E1A12]" />

      <AnimatePresence>
        {confirmation && (
          <ConfirmationModal
            reservation={confirmation}
            onClose={() => setConfirmation(null)}
          />
        )}
      </AnimatePresence>

      <div className="bg-[#2E1A12] pt-32 pb-16 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Reservations</p>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-[#FFF8E7] mb-4">
              Reserve Your <span className="text-gold-gradient italic">Table</span>
            </h1>
            <p className="text-[#E6D3B3]/70 max-w-xl mx-auto">
              Secure your spot and let us prepare a special experience just for you.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Date, Time, Guests */}
          <AnimatedSection>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#E6D3B3] p-6 shadow-sm">
              <h2 className="font-display font-semibold text-[#2E1A12] text-xl mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#4E342E] text-[#FFF8E7] flex items-center justify-center text-sm font-bold">1</span>
                Select Date & Time
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Date" id="date" error={errors.reservation_date}>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F4E37]/50" />
                    <input
                      id="date"
                      type="date"
                      min={today}
                      value={form.reservation_date}
                      onChange={e => setForm(f => ({ ...f, reservation_date: e.target.value }))}
                      className={`${inputCls('reservation_date')} pl-11`}
                    />
                  </div>
                </Field>

                <Field label="Number of Guests" id="guests" error={undefined}>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F4E37]/50" />
                    <select
                      id="guests"
                      value={form.guests}
                      onChange={e => setForm(f => ({ ...f, guests: +e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-[#E6D3B3] rounded-xl text-[#2E1A12] text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 cursor-pointer"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </Field>

                <Field label="Occasion" id="occasion" error={undefined}>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F4E37]/50" />
                    <select
                      id="occasion"
                      value={form.occasion}
                      onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-[#E6D3B3] rounded-xl text-[#2E1A12] text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 cursor-pointer"
                    >
                      <option value="none">No special occasion</option>
                      <option value="birthday">🎂 Birthday</option>
                      <option value="anniversary">💑 Anniversary</option>
                      <option value="date">💕 Date Night</option>
                      <option value="business">💼 Business Lunch</option>
                      <option value="other">✨ Other</option>
                    </select>
                  </div>
                </Field>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-[#4E342E] mb-3">
                  Select Time {errors.reservation_time && <span className="text-red-600 font-normal ml-1">(required)</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, reservation_time: t }))}
                      className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        form.reservation_time === t
                          ? 'bg-[#4E342E] text-[#FFF8E7] shadow-md'
                          : 'bg-[#FFF8E7] border border-[#E6D3B3] text-[#4E342E] hover:border-[#D4AF37]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4E342E] mb-2">Seating Type</label>
                  <div className="flex gap-3">
                    {['indoor', 'outdoor'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, seating_type: type }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          form.seating_type === type
                            ? 'bg-[#4E342E] text-[#FFF8E7] border-[#4E342E]'
                            : 'bg-white border-[#E6D3B3] text-[#4E342E] hover:border-[#D4AF37]'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4E342E] mb-2">AC Preference</label>
                  <div className="flex gap-3">
                    {[{ value: 'ac', label: 'AC' }, { value: 'non-ac', label: 'Non-AC' }].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, ac_preference: opt.value }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          form.ac_preference === opt.value
                            ? 'bg-[#4E342E] text-[#FFF8E7] border-[#4E342E]'
                            : 'bg-white border-[#E6D3B3] text-[#4E342E] hover:border-[#D4AF37]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Step 2: Table Selection */}
          <AnimatedSection delay={100}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#E6D3B3] p-6 shadow-sm">
              <h2 className="font-display font-semibold text-[#2E1A12] text-xl mb-2 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#4E342E] text-[#FFF8E7] flex items-center justify-center text-sm font-bold">2</span>
                Choose Your Table
              </h2>
              {(!form.reservation_date || !form.reservation_time) && (
                <p className="text-sm text-[#6F4E37]/60 mb-4">Select a date and time above to see availability.</p>
              )}

              <div className="flex items-center gap-6 text-xs mb-5">
                {[
                  { color: 'bg-green-500', label: 'Available' },
                  { color: 'bg-red-400', label: 'Booked' },
                  { color: 'bg-[#D4AF37]', label: 'Selected' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-sm ${l.color}`} />
                    <span className="text-[#6F4E37]/70 font-medium">{l.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#FAF3E8] rounded-xl p-5 border border-[#E6D3B3]">
                <div className="relative">
                  <p className="text-center text-xs text-[#6F4E37]/50 font-medium uppercase tracking-widest mb-4">— Entrance —</p>
                  <div className="space-y-4">
                    {['Window', 'Center', 'Corner', 'Bar', 'Private', 'Outdoor'].map(zone => {
                      const zoneTables = TABLES.filter(t => t.zone === zone);
                      return (
                        <div key={zone}>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[#6F4E37]/50 font-semibold mb-2">{zone} Zone</p>
                          <div className="flex flex-wrap gap-3">
                            {zoneTables.map(table => {
                              const status = getTableStatus(table.id);
                              const suitable = isTableSuitable(table);
                              const isDisabled = status === 'booked' || !suitable;
                              return (
                                <button
                                  key={table.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => setSelectedTable(table.id)}
                                  title={!suitable ? `Needs capacity for ${form.guests} guests` : status === 'booked' ? 'Already booked' : `Table ${table.id} · ${table.capacity} seats`}
                                  className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl border-2 text-xs font-bold transition-all duration-200 ${
                                    status === 'selected'
                                      ? 'bg-[#D4AF37] border-[#C8A228] text-[#2E1A12] shadow-lg scale-105'
                                      : status === 'booked'
                                        ? 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed'
                                        : !suitable
                                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                          : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:scale-105 cursor-pointer'
                                  }`}
                                >
                                  <span>T{table.id}</span>
                                  <span className="text-[9px] font-normal opacity-70">{table.capacity} seats</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {selectedTable && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4" />
                  Table #{selectedTable} selected · {TABLES.find(t => t.id === selectedTable)?.capacity} seats · {TABLES.find(t => t.id === selectedTable)?.zone} Zone
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Step 3: Customer Details */}
          <AnimatedSection delay={200}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#E6D3B3] p-6 shadow-sm">
              <h2 className="font-display font-semibold text-[#2E1A12] text-xl mb-6 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#4E342E] text-[#FFF8E7] flex items-center justify-center text-sm font-bold">3</span>
                Your Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" id="name" error={errors.customer_name}>
                  <input
                    id="name"
                    type="text"
                    placeholder="Aryan Sharma"
                    value={form.customer_name}
                    onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    className={inputCls('customer_name')}
                  />
                </Field>

                <Field label="Email Address" id="email" error={errors.customer_email}>
                  <input
                    id="email"
                    type="email"
                    placeholder="aryan@example.com"
                    value={form.customer_email}
                    onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                    className={inputCls('customer_email')}
                  />
                </Field>

                <Field label="Phone Number" id="phone" error={errors.customer_phone}>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={form.customer_phone}
                    onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                    className={inputCls('customer_phone')}
                  />
                </Field>

                <Field label="Special Requests" id="requests" error={undefined}>
                  <textarea
                    id="requests"
                    placeholder="Any dietary requirements, allergies, or special arrangements?"
                    value={form.special_requests}
                    onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-[#E6D3B3] rounded-xl text-[#2E1A12] text-sm placeholder-[#6F4E37]/40 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none"
                  />
                </Field>
              </div>
            </div>
          </AnimatedSection>

          {/* Submit Action Button */}
          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                type="submit"
                disabled={submitting}
                className="btn-ripple w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] px-10 py-4 rounded-full font-semibold text-base hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Confirming…</>
                ) : (
                  <>Confirm Reservation <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-xs text-[#6F4E37]/60 text-center">
                By booking, you agree to our cancellation policy. Free cancellation up to 2 hours before.
              </p>
            </div>
          </AnimatedSection>
        </form>
      </div>
    </div>
  );
}