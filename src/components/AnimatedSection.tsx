import React from 'react';
import { useInView } from '../hooks/useScrollAnimation';

type Props = {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-in' | 'fade-in-left' | 'fade-in-right' | 'scale-in';
  delay?: number;
};

export default function AnimatedSection({ children, className = '', animation = 'fade-in', delay = 0 }: Props) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref as React.RefCallback<HTMLDivElement>}
      className={`transition-none ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'none'
          : animation === 'fade-in-left'
            ? 'translateX(-32px)'
            : animation === 'fade-in-right'
              ? 'translateX(32px)'
              : animation === 'scale-in'
                ? 'scale(0.92)'
                : 'translateY(24px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
