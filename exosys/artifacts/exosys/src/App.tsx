import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Scene } from "./scene/Scene";
import { ModeRail } from "./ui/ModeRail";
import { PlanetDetail } from "./ui/PlanetDetail";
import { Classify } from "./ui/Classify";
import { Generate } from "./ui/Generate";
import { Habitability } from "./ui/Habitability";
import { Timeline } from "./ui/Timeline";
import { MissionAI } from "./ai/MissionAI";
import { useExosys } from "./state/useExosys";
import { useHealthCheck, useGetCatalogSummary } from "@workspace/api-client-react";
import { AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import { NARRATION_LINES } from "./ai/narrationLines";

const queryClient = new QueryClient();

function AppContent() {
  const { mode, emitNarration } = useExosys();
  const { data: health } = useHealthCheck();
  const { data: summary } = useGetCatalogSummary();

  useEffect(() => {
    // Initial welcome narration
    emitNarration(NARRATION_LINES.welcome[Math.floor(Math.random() * NARRATION_LINES.welcome.length)]);
  }, [emitNarration]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#04060d]">
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      <ModeRail />
      
      <AnimatePresence mode="wait">
        {mode === 'PLANET_DETAIL' && <PlanetDetail key="detail" />}
        {mode === 'CLASSIFY' && <Classify key="classify" />}
        {mode === 'GENERATE' && <Generate key="generate" />}
        {mode === 'HABITABILITY' && <Habitability key="habitability" />}
        {mode === 'TIMELINE' && <Timeline key="timeline" />}
      </AnimatePresence>

      <MissionAI />

      {/* Ambient System Readout */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end text-right pointer-events-none">
        <div className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center gap-2 mb-2">
          {health?.status === 'ok' ? (
            <><span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> LINK ACTIVE</>
          ) : (
            <><span className="w-1.5 h-1.5 bg-destructive rounded-full" /> OFFLINE</>
          )}
        </div>
        {summary && (
          <div className="font-mono text-xs text-foreground/50">
            <div>CATALOG: {summary.total}</div>
            <div>HABITABLE: {summary.habitableZone}</div>
            <div>MEAN RADIUS: {summary.meanRadius.toFixed(2)} R⊕</div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;