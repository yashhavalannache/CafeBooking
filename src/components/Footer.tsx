import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a0e08] text-[#E6D3B3] relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#6F4E37] flex items-center justify-center shadow-lg">
                <Coffee className="w-5 h-5 text-[#2E1A12]" />
              </div>
              <div>
                <p className="font-display font-bold text-[#FFF8E7] text-xl">Brewed & Bliss</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]">Premium Café</p>
              </div>
            </div>
            <p className="text-sm text-[#E6D3B3]/70 leading-relaxed mb-6">
              A sanctuary for coffee lovers. Every cup is crafted with passion, every moment is made memorable.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-[#D4AF37]/25 flex items-center justify-center text-[#E6D3B3]/60 hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-[#FFF8E7] text-lg mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'Our Menu', to: '/menu' },
                { label: 'Reserve a Table', to: '/reservations' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Admin Panel', to: '/admin' },
              ].map(l => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-[#E6D3B3]/70 hover:text-[#D4AF37] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/40 group-hover:bg-[#D4AF37] transition-colors" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-[#FFF8E7] text-lg mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#E6D3B3]/70 leading-relaxed">42 Coffee Lane, Indiranagar<br />Bengaluru, Karnataka 560038</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <a href="tel:+9189 5119 2623" className="text-sm text-[#E6D3B3]/70 hover:text-[#D4AF37] transition-colors">+91 89 5119 2623</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <a href="mailto:thunderbolt1899@gmail.com" className="text-sm text-[#E6D3B3]/70 hover:text-[#D4AF37] transition-colors">thunderbolt1899@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-display font-semibold text-[#FFF8E7] text-lg mb-5">Opening Hours</h3>
            <ul className="space-y-3">
              {[
                { day: 'Monday – Friday', time: '5:00 PM – 10:00 PM' },
                { day: 'Saturday', time: '3:00 PM – 11:00 PM' },
                { day: 'Sunday', time: '9:00 AM – 11:00 PM' },
              ].map(h => (
                <li key={h.day} className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#E6D3B3]/70">{h.day}</p>
                    <p className="text-sm text-[#FFF8E7] font-medium">{h.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-[#D4AF37]/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#E6D3B3]/40">© 2025 Brewed & Bliss. All rights reserved.</p>
          <p className="text-xs text-[#E6D3B3]/40">Crafted with <span className="text-[#D4AF37]">♥</span> for coffee lovers</p>
        </div>
      </div>
    </footer>
  );
}
