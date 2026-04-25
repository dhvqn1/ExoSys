import { create } from 'zustand';
import type { CatalogPlanet, GeneratedPlanet } from '@workspace/api-client-react';

export type AppMode = 'SYSTEM' | 'PLANET_DETAIL' | 'CLASSIFY' | 'GENERATE' | 'HABITABILITY' | 'TIMELINE';

interface ExosysState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  
  selectedPlanetId: string | null;
  setSelectedPlanetId: (id: string | null) => void;
  
  generatedPlanets: GeneratedPlanet[];
  addGeneratedPlanet: (planet: GeneratedPlanet) => void;
  
  narrationQueue: { id: string; message: string }[];
  emitNarration: (message: string) => void;
  dismissNarration: (id: string) => void;
}

export const useExosys = create<ExosysState>((set) => ({
  mode: 'SYSTEM',
  setMode: (mode) => set({ mode, selectedPlanetId: mode === 'SYSTEM' || mode === 'TIMELINE' ? null : null }),
  
  selectedPlanetId: null,
  setSelectedPlanetId: (id) => set((state) => {
    if (id) {
      return { selectedPlanetId: id, mode: 'PLANET_DETAIL' };
    }
    return { selectedPlanetId: null, mode: 'SYSTEM' };
  }),
  
  generatedPlanets: [],
  addGeneratedPlanet: (planet) => set((state) => ({ generatedPlanets: [...state.generatedPlanets, planet] })),
  
  narrationQueue: [],
  emitNarration: (message) => set((state) => ({
    narrationQueue: [...state.narrationQueue, { id: Math.random().toString(36).substring(7), message }]
  })),
  dismissNarration: (id) => set((state) => ({
    narrationQueue: state.narrationQueue.filter((n) => n.id !== id)
  }))
}));