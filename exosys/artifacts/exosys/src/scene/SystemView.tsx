import React from 'react';
import { useListCatalogPlanets } from '@workspace/api-client-react';
import { useExosys } from '../state/useExosys';
import { Planet } from './Planet';

export function SystemView() {
  const { data: planets } = useListCatalogPlanets();
  const { selectedPlanetId, setSelectedPlanetId, generatedPlanets } = useExosys();

  return (
    <group>
      {/* Catalog Planets */}
      {planets?.map((p) => (
        <Planet
          key={p.id}
          id={p.id}
          name={p.name}
          kind={p.kind}
          radius={p.radiusEarth}
          semiMajorAxis={p.semiMajorAxisAU}
          orbitalPeriod={p.orbitalPeriodDays}
          isSelected={selectedPlanetId === p.id}
          onClick={() => setSelectedPlanetId(p.id)}
        />
      ))}

      {/* Generated Planets */}
      {generatedPlanets.map((p) => (
        <Planet
          key={p.id}
          id={p.id}
          name={p.name ?? p.id}
          kind={p.kind}
          radius={p.radiusEarth}
          semiMajorAxis={p.semiMajorAxisAU}
          orbitalPeriod={p.orbitalPeriodDays}
          color={p.color}
          isSelected={selectedPlanetId === p.id}
          onClick={() => setSelectedPlanetId(p.id)}
        />
      ))}
    </group>
  );
}