import React, { useState, useEffect } from 'react';

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

let _addToast: ((msg: string, type: Toast['type']) => void) | null = null;

export function toast(message: string, type: Toast['type'] = 'info') {
  _addToast?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    _addToast = (message, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
    return () => { _addToast = null; };
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-md border animate-slide-in ${
            t.type === 'success' ? 'bg-green-900/90 border-green-700 text-green-100' :
            t.type === 'error' ? 'bg-red-900/90 border-red-700 text-red-100' :
            'bg-[#2E1A12]/90 border-[#D4AF37]/40 text-[#FFF8E7]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
            t.type === 'success' ? 'bg-green-400' :
            t.type === 'error' ? 'bg-red-400' : 'bg-[#D4AF37]'
          }`} />
          {t.message}
        </div>
      ))}
    </div>
  );
}
