import React from 'react';
import { OverlayPanel, Label, Value, Divider, Button } from './Overlay';
import { useGeneratePlanet } from '@workspace/api-client-react';
import { useExosys } from '../state/useExosys';
import { NARRATION_LINES } from '../ai/narrationLines';

export function Generate() {
  const generate = useGeneratePlanet();
  const { emitNarration, addGeneratedPlanet, generatedPlanets } = useExosys();
  
  const latestPlanet = generatedPlanets[generatedPlanets.length - 1];

  const handleGenerate = () => {
    emitNarration(NARRATION_LINES.generate_start[Math.floor(Math.random() * NARRATION_LINES.generate_start.length)]);
    generate.mutate({ data: {} }, {
      onSuccess: (planet) => {
        addGeneratedPlanet(planet);
        emitNarration(NARRATION_LINES.generate_result(planet)[Math.floor(Math.random() * 3)]);
      }
    });
  };

  return (
    <OverlayPanel position="right">
      <div className="flex flex-col gap-6">
        <div>
          <Label>PROCEDURAL SYNTHESIS</Label>
          <Value>WORLD GENERATOR</Value>
        </div>
        
        <Button onClick={handleGenerate} primary disabled={generate.isPending}>
          {generate.isPending ? 'SYNTHESIZING...' : 'GENERATE NEW WORLD'}
        </Button>
        
        {latestPlanet && (
          <div className="mt-8 flex flex-col gap-6 animate-in fade-in duration-1000">
            <Divider />
            
            <div>
              <Label>DESIGNATION</Label>
              <Value large>{latestPlanet.name}</Value>
              <div className="text-xs text-accent mt-1 tracking-widest uppercase">{latestPlanet.kind}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>RADIUS (R⊕)</Label>
                <Value>{latestPlanet.radiusEarth.toFixed(2)}</Value>
              </div>
              <div>
                <Label>MASS (M⊕)</Label>
                <Value>{latestPlanet.massEarth.toFixed(2)}</Value>
              </div>
              <div>
                <Label>ORBIT (D)</Label>
                <Value>{latestPlanet.orbitalPeriodDays.toFixed(1)}</Value>
              </div>
              <div>
                <Label>EQ TEMP (K)</Label>
                <Value>{Math.round(latestPlanet.equilibriumTempK)}</Value>
              </div>
              <div className="col-span-2">
                <Label>ATMOSPHERE</Label>
                <Value>{latestPlanet.atmosphere}</Value>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              {latestPlanet.description}
            </p>
          </div>
        )}
      </div>
    </OverlayPanel>
  );
}