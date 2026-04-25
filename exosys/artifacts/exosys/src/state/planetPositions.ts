import * as THREE from 'three';

const positions = new Map<string, THREE.Vector3>();

export function registerPlanetPosition(id: string): THREE.Vector3 {
  let v = positions.get(id);
  if (!v) {
    v = new THREE.Vector3();
    positions.set(id, v);
  }
  return v;
}

export function unregisterPlanetPosition(id: string): void {
  positions.delete(id);
}

export function getPlanetPosition(id: string): THREE.Vector3 | undefined {
  return positions.get(id);
}
