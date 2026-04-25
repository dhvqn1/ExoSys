import React from 'react';
import { useExosys } from '../state/useExosys';
import { OverlayPanel, Label, Value, Divider, Button } from './Overlay';
import { useListCatalogPlanets } from '@workspace/api-client-react';

export function PlanetDetail() {
  const { selectedPlanetId, setMode } = useExosys();
  const { data: planets } = useListCatalogPlanets();
  
  const planet = planets?.find(p => p.id === selectedPlanetId);
  
  if (!planet) return null;

  return (
    <OverlayPanel position="right">
      <div className="flex flex-col gap-6">
        <div>
          <Label>TARGET DESIGNATION</Label>
          <Value large>{planet.name}</Value>
          <div className="text-xs text-accent mt-1 tracking-widest uppercase">{planet.kind}</div>
        </div>
        
        <Divider />
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>MASS (EARTH = 1)</Label>
            <Value>{planet.massEarth.toFixed(2)}</Value>
          </div>
          <div>
            <Label>RADIUS (EARTH = 1)</Label>
            <Value>{planet.radiusEarth.toFixed(2)}</Value>
          </div>
          <div>
            <Label>ORBITAL PERIOD</Label>
            <Value>{planet.orbitalPeriodDays.toFixed(1)} DAYS</Value>
          </div>
          <div>
            <Label>EQUILIBRIUM TEMP</Label>
            <Value>{Math.round(planet.equilibriumTempK)} K</Value>
          </div>
        </div>
        
        <Divider />
        
        <div>
          <Label>HOST STAR</Label>
          <Value>{planet.hostStar.name} <span className="text-muted-foreground text-xs">({planet.hostStar.spectralType})</span></Value>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round(planet.hostStar.temperatureK)}K • {planet.hostStar.massSun.toFixed(2)} M☉
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <Button onClick={() => setMode('SYSTEM')}>RETURN TO SYSTEM</Button>
          <Button onClick={() => setMode('HABITABILITY')} primary>SIMULATE HABITABILITY</Button>
        </div>
      </div>
    </OverlayPanel>
  );
}