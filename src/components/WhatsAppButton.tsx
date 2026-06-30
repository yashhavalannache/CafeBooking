import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/918951192623"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:shadow-[#25D366]/40 hover:scale-110 transition-all duration-300 animate-float"
      style={{ width: 52, height: 52 }}
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
    </a>
  );
}
