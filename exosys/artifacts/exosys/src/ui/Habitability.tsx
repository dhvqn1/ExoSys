import React, { useState, useEffect, useRef } from 'react';
import { OverlayPanel, Label, Value, Divider, Meter } from './Overlay';
import { useSimulateHabitability, HabitabilityRequest, useListCatalogPlanets } from '@workspace/api-client-react';
import { useExosys } from '../state/useExosys';
import { NARRATION_LINES } from '../ai/narrationLines';

export function Habitability() {
  const { selectedPlanetId, emitNarration } = useExosys();
  const { data: planets } = useListCatalogPlanets();
  const simulate = useSimulateHabitability();
  
  const planet = planets?.find(p => p.id === selectedPlanetId);
  const hostStar = planet?.hostStar || { temperatureK: 5778, radiusSun: 1.0, name: 'Sun', spectralType: 'G2V', massSun: 1.0 };
  
  const [params, setParams] = useState<HabitabilityRequest>({
    distanceAU: planet?.semiMajorAxisAU || 1.0,
    planetRadiusEarth: planet?.radiusEarth || 1.0,
    atmosphere: 'earth-like',
    stellarTemperatureK: hostStar.temperatureK,
    stellarRadiusSun: hostStar.radiusSun
  });

  const lastZone = useRef<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      simulate.mutate({ data: params }, {
        onSuccess: (res) => {
          if (lastZone.current && lastZone.current !== res.zone && res.zone === 'habitable') {
            emitNarration(NARRATION_LINES.habitability_change(res.zone, res.surfaceTempK)[0]);
          }
          lastZone.current = res.zone;
        }
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [params.distanceAU, params.planetRadiusEarth, params.atmosphere]);

  return (
    <OverlayPanel position="right">
      <div className="flex flex-col gap-6">
        <div>
          <Label>ENVIRONMENTAL SIMULATION</Label>
          <Value large>HABITABILITY</Value>
          <div className="text-xs text-muted-foreground mt-1">STAR: {hostStar.name} ({Math.round(hostStar.temperatureK)}K)</div>
        </div>
        
        <Divider />
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <Label>DISTANCE (AU)</Label>
              <span className="font-mono text-xs">{params.distanceAU.toFixed(2)}</span>
            </div>
            <input 
              type="range" min={0.05} max={5.0} step={0.01}
              value={params.distanceAU}
              onChange={(e) => setParams(p => ({ ...p, distanceAU: Number(e.target.value) }))}
              className="w-full accent-accent h-1 bg-white/10 appearance-none"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <Label>RADIUS (R⊕)</Label>
              <span className="font-mono text-xs">{params.planetRadiusEarth.toFixed(2)}</span>
            </div>
            <input 
              type="range" min={0.3} max={4.0} step={0.1}
              value={params.planetRadiusEarth}
              onChange={(e) => setParams(p => ({ ...p, planetRadiusEarth: Number(e.target.value) }))}
              className="w-full accent-accent h-1 bg-white/10 appearance-none"
            />
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <Label>ATMOSPHERE</Label>
            <div className="flex flex-wrap gap-2">
              {['none', 'thin', 'earth-like', 'thick', 'venus-like'].map(atm => (
                <button
                  key={atm}
                  onClick={() => setParams(p => ({ ...p, atmosphere: atm }))}
                  className={`px-2 py-1 text-[10px] tracking-widest uppercase border transition-colors ${params.atmosphere === atm ? 'border-accent text-accent' : 'border-white/10 text-muted-foreground hover:border-white/30'}`}
                >
                  {atm}
                </button>
              ))}
            </div>
          </div>
        </div>

        {simulate.data && (
          <div className="mt-4 pt-6 border-t border-white/10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <Label>SURFACE TEMP</Label>
                <div className="font-mono text-2xl">{Math.round(simulate.data.surfaceTempK)} K</div>
              </div>
              <div className="text-right">
                <Label>CLASSIFICATION</Label>
                <div className={`font-mono text-sm tracking-widest uppercase ${simulate.data.zone === 'habitable' ? 'text-accent' : 'text-muted-foreground'}`}>
                  {simulate.data.zone.replace('-', ' ')}
                </div>
              </div>
            </div>
            
            <Meter value={simulate.data.habitabilityIndex} max={1} label="EARTH SIMILARITY INDEX" />
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {simulate.data.interpretation}
            </p>
          </div>
        )}
      </div>
    </OverlayPanel>
  );
}