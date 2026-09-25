'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if IntersectionObserver is available
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{
        transitionDelay: delayMs ? `${delayMs}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}
