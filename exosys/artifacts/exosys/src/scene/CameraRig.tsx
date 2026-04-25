import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useExosys } from '../state/useExosys';
import { useListCatalogPlanets } from '@workspace/api-client-react';
import { getPlanetPosition } from '../state/planetPositions';

const POSITION_LERP = 0.045;
const TARGET_LERP = 0.08;

export function CameraRig() {
  const { selectedPlanetId, mode, generatedPlanets } = useExosys();
  const { data: planets } = useListCatalogPlanets();

  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  // Scratch vectors so we don't allocate every frame.
  const desiredPos = useMemo(() => new THREE.Vector3(30, 20, 30), []);
  const desiredLook = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const offsetDir = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!controlsRef.current) return;

    if (mode === 'TIMELINE') {
      // Top-down god's-eye view.
      desiredPos.set(0, 60, 0.001);
      desiredLook.set(0, 0, 0);
    } else if (selectedPlanetId && mode !== 'SYSTEM') {
      // Track the live world position of the selected planet.
      const live = getPlanetPosition(selectedPlanetId);
      const planet =
        planets?.find((p) => p.id === selectedPlanetId) ??
        generatedPlanets.find((p) => p.id === selectedPlanetId);

      if (live && (live.x !== 0 || live.z !== 0)) {
        desiredLook.copy(live);

        // Place the camera at planet + (offset along current view direction).
        // We keep the user's current azimuth but stand off at a sensible radius
        // proportional to the planet's visual radius.
        const planetVisualRadius = planet
          ? THREE.MathUtils.clamp(Math.cbrt(planet.radiusEarth) * 0.45, 0.35, 2.4)
          : 0.6;
        const standOff = Math.max(2.5, planetVisualRadius * 6);

        // Direction from current camera target → camera (preserves user rotation).
        offsetDir
          .copy(camera.position)
          .sub(controlsRef.current.target)
          .normalize();

        // If we're coming from the system overview the offsetDir might be
        // wildly off-axis; bias slightly upward for a cinematic 3/4 angle.
        offsetDir.y = Math.max(offsetDir.y, 0.25);
        offsetDir.normalize();

        desiredPos.copy(live).add(tmp.copy(offsetDir).multiplyScalar(standOff));
      } else if (planet) {
        // Fallback before the first frame has published a position.
        const r = planet.semiMajorAxisAU * 20;
        desiredLook.set(r, 0, 0);
        desiredPos.set(r + 4, 1.5, 4);
      }
    } else {
      desiredPos.set(30, 20, 30);
      desiredLook.set(0, 0, 0);
    }

    camera.position.lerp(desiredPos, POSITION_LERP);
    controlsRef.current.target.lerp(desiredLook, TARGET_LERP);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.35}
      zoomSpeed={0.6}
      maxDistance={120}
      minDistance={1.5}
    />
  );
}
