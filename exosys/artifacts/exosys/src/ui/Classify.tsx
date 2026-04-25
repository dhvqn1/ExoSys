import React, { useState } from 'react';
import { OverlayPanel, Label, Value, Divider, Button, Meter, Hairline } from './Overlay';
import { usePredictExoplanet, PredictRequest } from '@workspace/api-client-react';
import { useExosys } from '../state/useExosys';
import { NARRATION_LINES } from '../ai/narrationLines';

export function Classify() {
  const predict = usePredictExoplanet();
  const { emitNarration } = useExosys();
  
  const [params, setParams] = useState<PredictRequest>({
    orbitalPeriod: 3.5,
    planetRadius: 1.2,
    stellarTemperature: 5500,
    semiMajorAxis: 0.05,
    transitDepth: 1200
  });

  const handleAnalyze = () => {
    emitNarration(NARRATION_LINES.classify_start[Math.floor(Math.random() * NARRATION_LINES.classify_start.length)]);
    predict.mutate({ data: params }, {
      onSuccess: (res) => {
        emitNarration(NARRATION_LINES.classify_result(res.prediction, res.probability, res.interpretation)[Math.floor(Math.random() * 3)]);
      }
    });
  };

  const updateParam = (key: keyof PredictRequest, val: number) => {
    setParams(p => ({ ...p, [key]: val }));
  };

  return (
    <OverlayPanel position="bottom">
      <div className="bg-background/80 backdrop-blur-md border border-white/10 p-6 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <Label>ML CLASSIFIER</Label>
            <Value>TRANSIT SIGNAL ANALYSIS</Value>
          </div>
          <Button onClick={handleAnalyze} primary disabled={predict.isPending}>
            {predict.isPending ? 'ANALYZING...' : 'ANALYZE SIGNAL'}
          </Button>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {[
            { k: 'orbitalPeriod', l: 'ORBITAL PERIOD (D)', min: 0.1, max: 100 },
            { k: 'planetRadius', l: 'RADIUS (R⊕)', min: 0.1, max: 20 },
            { k: 'stellarTemperature', l: 'STELLAR TEMP (K)', min: 2000, max: 10000 },
            { k: 'semiMajorAxis', l: 'SEMI-MAJOR AXIS (AU)', min: 0.01, max: 5 },
            { k: 'transitDepth', l: 'TRANSIT DEPTH (PPM)', min: 10, max: 50000 }
          ].map(({ k, l, min, max }) => (
            <div key={k} className="flex flex-col gap-2">
              <Label>{l}</Label>
              <input 
                type="number" 
                value={params[k as keyof PredictRequest]} 
                onChange={(e) => updateParam(k as keyof PredictRequest, Number(e.target.value))}
                className="bg-transparent border border-white/20 text-foreground font-mono text-xs p-2 focus:border-accent outline-none"
              />
              <input 
                type="range" 
                min={min} max={max} step={(max-min)/100}
                value={params[k as keyof PredictRequest]}
                onChange={(e) => updateParam(k as keyof PredictRequest, Number(e.target.value))}
                className="w-full accent-accent h-1 bg-white/10 appearance-none"
              />
            </div>
          ))}
        </div>

        {predict.data && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex justify-between items-end">
              <div>
                <Label>VERDICT</Label>
                <div className={`font-mono text-xl ${predict.data.prediction === 1 ? 'text-accent' : 'text-muted-foreground'}`}>
                  {predict.data.prediction === 1 ? 'CONFIRMED CANDIDATE' : 'FALSE POSITIVE'}
                </div>
              </div>
              <div className="w-1/3">
                <Meter value={predict.data.probability} max={1} label="PROBABILITY" />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground font-light">{predict.data.interpretation}</p>
            
            <div>
              <Label>FEATURE CONTRIBUTIONS</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {predict.data.featureContributions.map(fc => (
                  <div key={fc.feature} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono truncate mr-2">{fc.feature}</span>
                    <div className="w-24 h-1 bg-white/10 relative">
                      <div className="absolute top-0 left-0 h-full bg-white/40" style={{ width: `${Math.abs(fc.contribution) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </OverlayPanel>
  );
}