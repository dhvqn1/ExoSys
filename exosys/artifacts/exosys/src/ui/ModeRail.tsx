import React from 'react';
import { useExosys, AppMode } from '../state/useExosys';
import { motion } from 'framer-motion';

const MODES: AppMode[] = ['SYSTEM', 'CLASSIFY', 'GENERATE', 'TIMELINE'];

export function ModeRail() {
  const { mode, setMode } = useExosys();

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-40">
      {MODES.map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          className={`relative text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 py-2 origin-left text-left ${mode === m ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
        >
          {m}
          {mode === m && (
            <motion.div
              layoutId="rail-indicator"
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-1 bg-accent rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}