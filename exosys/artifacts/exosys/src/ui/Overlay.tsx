import React from 'react';
import { motion } from 'framer-motion';

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const DURATION = 0.8;

export function OverlayPanel({ children, className = '', position = 'right' }: { children: React.ReactNode, className?: string, position?: 'right' | 'left' | 'bottom' | 'center' }) {
  const getInitial = () => {
    switch (position) {
      case 'right': return { x: 40, opacity: 0 };
      case 'left': return { x: -40, opacity: 0 };
      case 'bottom': return { y: 40, opacity: 0 };
      case 'center': return { y: 20, opacity: 0 };
    }
  };
  
  const getPositionClasses = () => {
    switch (position) {
      case 'right': return 'right-12 top-24 bottom-24 w-[360px] justify-center';
      case 'left': return 'left-24 top-24 bottom-24 w-[360px] justify-center';
      case 'bottom': return 'bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md';
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={getInitial()}
      transition={{ duration: DURATION, ease: EASE }}
      className={`fixed ${getPositionClasses()} flex flex-col pointer-events-auto z-40 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] tracking-widest text-muted-foreground uppercase">{children}</div>;
}

export function Value({ children, large = false }: { children: React.ReactNode, large?: boolean }) {
  return <div className={`font-mono text-foreground ${large ? 'text-3xl font-light' : 'text-sm'}`}>{children}</div>;
}

export function Divider() {
  return <div className="w-full h-[1px] bg-white/10 my-4" />;
}

export function Hairline() {
  return <div className="w-full h-[1px] bg-white/5 my-2" />;
}

export function Meter({ value, max = 1, label }: { value: number, max?: number, label?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <Label>{label}</Label>}
      <div className="h-[2px] w-full bg-white/10 overflow-hidden">
        <motion.div 
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </div>
    </div>
  );
}

export function Button({ children, onClick, primary = false, disabled = false }: { children: React.ReactNode, onClick: () => void, primary?: boolean, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-xs tracking-widest uppercase transition-colors duration-300 ${primary ? 'bg-foreground text-background hover:bg-accent' : 'border border-white/20 text-foreground hover:bg-white/5'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}