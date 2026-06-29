import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coffee, Menu, X, ChevronRight } from 'lucide-react';
import { useScrollY } from '../hooks/useScrollAnimation';

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/reservations', label: 'Reserve' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const scrollY = useScrollY();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const scrolled = scrollY > 60;
  const solid = !isHome || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solid
          ? 'bg-[#2E1A12]/95 backdrop-blur-md shadow-2xl border-b border-[#D4AF37]/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#6F4E37] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Coffee className="w-5 h-5 text-[#2E1A12]" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-bold text-[#FFF8E7] text-lg tracking-tight">Brewed & Bliss</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] font-medium -mt-0.5">Premium Café</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  location.pathname === l.to
                    ? 'text-[#D4AF37]'
                    : 'text-[#E6D3B3] hover:text-[#FFF8E7]'
                }`}
              >
                {l.label}
                <span className={`absolute bottom-1 left-4 right-4 h-[2px] rounded-full bg-[#D4AF37] transition-transform duration-300 ${
                  location.pathname === l.to ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin"
              className="text-xs text-[#E6D3B3]/60 hover:text-[#D4AF37] transition-colors font-medium"
            >
              Admin
            </Link>
            <Link
              to="/reservations"
              className="btn-ripple flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-[#D4AF37]/25 transition-all duration-300 hover:scale-105"
            >
              Book a Table
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-[#FFF8E7] p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-[#2E1A12]/98 backdrop-blur-lg border-t border-[#D4AF37]/10 px-4 py-4 flex flex-col gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                  : 'text-[#E6D3B3] hover:bg-white/5 hover:text-[#FFF8E7]'
              }`}
            >
              {l.label}
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          ))}
          <div className="border-t border-[#D4AF37]/10 mt-2 pt-3 flex flex-col gap-2">
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium text-[#E6D3B3]/60 hover:text-[#D4AF37] transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link
              to="/reservations"
              onClick={() => setOpen(false)}
              className="btn-ripple text-center bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] px-5 py-3 rounded-xl text-sm font-semibold"
            >
              Book a Table
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
