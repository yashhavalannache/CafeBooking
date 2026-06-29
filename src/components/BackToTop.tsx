import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useScrollY } from '../hooks/useScrollAnimation';

export default function BackToTop() {
  const scrollY = useScrollY();
  const visible = scrollY > 400;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-24 right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C8A228] text-[#2E1A12] flex items-center justify-center shadow-xl hover:shadow-[#D4AF37]/30 hover:scale-110 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4 font-bold" />
    </button>
  );
}
