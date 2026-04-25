export const NARRATION_LINES = {
  welcome: [
    "EXOSYS online. Awaiting telemetry.",
    "System nominal. Catalog loaded.",
    "Observatory systems engaged. Monitoring deep space."
  ],
  planet_select: [
    "Focusing optics on target.",
    "Target locked. Retrieving planetary telemetry.",
    "Isolating target signature."
  ],
  planet_detail: (planet: { name: string, kind: string, temp: number }) => [
    `Target ${planet.name}. Classified as ${planet.kind}. Equilibrium temperature at ${Math.round(planet.temp)}K.`,
    `Atmospheric analysis for ${planet.name} underway. Composition suggests a ${planet.kind} world.`,
    `Spectroscopy indicates ${planet.kind} characteristics. Temperature profile: ${Math.round(planet.temp)}K.`
  ],
  classify_start: [
    "Initiating gradient boosted classifier.",
    "Analyzing transit light curve data.",
    "Processing orbital parameters through neural model."
  ],
  classify_result: (prediction: number, prob: number, interpretation: string) => [
    `${prediction === 1 ? 'Confirmed candidate.' : 'False positive.'} Confidence: ${(prob * 100).toFixed(1)}%. ${interpretation}`,
    `Analysis complete. ${prediction === 1 ? 'Signal matches planetary transit profile.' : 'Signal likely stellar noise or eclipsing binary.'} ${interpretation}`,
    `Model verdict: ${prediction === 1 ? 'Positive' : 'Negative'} at ${(prob * 100).toFixed(1)}%. ${interpretation}`
  ],
  generate_start: [
    "Seeding procedural generation matrix.",
    "Simulating planetary formation parameters.",
    "Computing orbital mechanics for new entity."
  ],
  generate_result: (planet: { name: string, kind: string }) => [
    `Synthesis complete. Designation: ${planet.name}. A ${planet.kind} world.`,
    `Generated entity ${planet.name} stabilized in orbit. Classified as ${planet.kind}.`,
    `Procedural manifestation successful. ${planet.name} (${planet.kind}) added to local system.`
  ],
  habitability_change: (zone: string, temp: number) => [
    `Orbit adjusted. Current thermal profile places entity in the ${zone} zone at ${Math.round(temp)}K.`,
    `Recalculating equilibrium... Temperature stabilized at ${Math.round(temp)}K. Zone: ${zone}.`,
    `Atmospheric retention updated. Surface reads ${Math.round(temp)}K. Classification: ${zone}.`
  ],
  timeline_play: [
    "Accessing historical discovery archives.",
    "Initiating chronological sequence of catalogued exoplanets.",
    "Replaying temporal discovery data."
  ],
  timeline_notable: (year: number, note: string) => [
    `Archive ${year}: ${note}`,
    `Milestone recorded in ${year}. ${note}`,
    `Notable discovery (${year}): ${note}`
  ]
};