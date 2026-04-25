import React, { useState, useEffect } from 'react';
import { OverlayPanel, Label, Value } from './Overlay';
import { useGetDiscoveryTimeline } from '@workspace/api-client-react';
import { useExosys } from '../state/useExosys';
import { NARRATION_LINES } from '../ai/narrationLines';

export function Timeline() {
  const { data: timeline } = useGetDiscoveryTimeline();
  const { emitNarration } = useExosys();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!timeline || timeline.length === 0) return;
    if (!playing) return;
    
    if (currentIdx === 0) {
      emitNarration(NARRATION_LINES.timeline_play[0]);
    }

    const interval = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev >= timeline.length - 1) {
          setPlaying(false);
          return prev;
        }
        const next = prev + 1;
        if (timeline[next].notable) {
          emitNarration(NARRATION_LINES.timeline_notable(timeline[next].year, timeline[next].notable)[0]);
        }
        return next;
      });
    }, 1000); // 1s per year

    return () => clearInterval(interval);
  }, [timeline, playing, currentIdx, emitNarration]);

  if (!timeline) return null;

  const current = timeline[currentIdx];

  return (
    <OverlayPanel position="bottom">
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex justify-between items-end px-4">
          <div>
            <div className="font-mono text-4xl text-foreground font-light">{current?.year || '...'}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
              CUMULATIVE CATALOG: {current?.cumulative || 0}
            </div>
          </div>
          
          <button 
            onClick={() => setPlaying(!playing)}
            className="text-[10px] tracking-[0.2em] uppercase text-accent border border-accent/30 px-3 py-1 hover:bg-accent/10 transition-colors"
          >
            {playing ? 'PAUSE' : 'PLAY'}
          </button>
        </div>
        
        <div className="w-full relative h-8 px-4">
          <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/10 -translate-y-1/2" />
          <input
            type="range"
            min={0}
            max={timeline.length - 1}
            value={currentIdx}
            onChange={(e) => {
              setCurrentIdx(Number(e.target.value));
              setPlaying(false);
            }}
            className="w-full absolute top-1/2 left-0 -translate-y-1/2 opacity-0 cursor-pointer z-10"
          />
          
          {/* Tick marks */}
          {timeline.map((t, i) => {
            const isCurrent = i <= currentIdx;
            const isNotable = !!t.notable;
            return (
              <div 
                key={t.year}
                className={`absolute top-1/2 -translate-y-1/2 w-[1px] transition-all duration-300 ${isCurrent ? 'bg-accent h-3' : 'bg-white/20 h-1'} ${isNotable && isCurrent ? 'bg-white h-4' : ''}`}
                style={{ left: `calc(1rem + ${i / (timeline.length - 1) * 100}% - 2rem * ${i / (timeline.length - 1)})` }}
              />
            );
          })}
        </div>
        
        <div className="h-6 px-4 text-center">
          <div className="text-sm font-light text-foreground animate-in fade-in duration-500 key={current?.year}">
            {current?.notable || ''}
          </div>
        </div>
      </div>
    </OverlayPanel>
  );
}