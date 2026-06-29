import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-[#FFF8E7] rounded-2xl overflow-hidden shadow-sm">
      <div className="skeleton h-52 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-2/3 rounded-lg" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-5 w-16 rounded-lg" />
          <div className="skeleton h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
