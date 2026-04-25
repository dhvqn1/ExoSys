import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExosys } from '../state/useExosys';

export function MissionAI() {
  const { narrationQueue, dismissNarration } = useExosys();
  const [currentMessage, setCurrentMessage] = useState<{id: string, message: string} | null>(null);

  useEffect(() => {
    if (!currentMessage && narrationQueue.length > 0) {
      setCurrentMessage(narrationQueue[0]);
    }
  }, [narrationQueue, currentMessage]);

  useEffect(() => {
    if (!currentMessage) return undefined;
    const timer = setTimeout(() => {
      dismissNarration(currentMessage.id);
      setCurrentMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentMessage, dismissNarration]);

  return (
    <div className="fixed top-8 right-8 w-80 pointer-events-none z-50">
      <AnimatePresence mode="wait">
        {currentMessage && (
          <motion.div
            key={currentMessage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-2"
          >
            <div className="text-[10px] tracking-widest text-accent uppercase flex items-center gap-2">
              <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              EXOSYS // MISSION AI
            </div>
            <div className="text-sm text-foreground leading-relaxed font-sans font-light">
              {currentMessage.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}