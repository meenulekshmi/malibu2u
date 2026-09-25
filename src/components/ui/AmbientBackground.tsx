'use client';

import React from 'react';

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Dynamic Floating Soft Purple Light 1 */}
      <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full filter blur-[150px] opacity-70 animate-ambient-flow-1" />

      {/* Dynamic Floating Soft Violet/Indigo Light 2 */}
      <div className="absolute bottom-[15%] right-[15%] w-[550px] h-[550px] rounded-full filter blur-[160px] opacity-65 animate-ambient-flow-2" />

      {/* Soft Center Glow Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/15 rounded-full filter blur-[180px]" />
    </div>
  );
}
