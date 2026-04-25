import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { generatePlanetTextures } from './utils/proceduralTexture';
import {
  registerPlanetPosition,
  unregisterPlanetPosition,
} from '../state/planetPositions';

interface PlanetProps {
  id: string;
  name: string;
  kind: string;
  radius: number;
  semiMajorAxis: number;
  orbitalPeriod: number;
  color?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const KIND_LABEL: Record<string, string> = {
  rocky: 'Rocky',
  'super-earth': 'Super-Earth',
  ocean: 'Ocean World',
  'gas-giant': 'Gas Giant',
  'ice-giant': 'Ice Giant',
  lava: 'Lava World',
  desert: 'Desert',
};

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 10000;
}

export function Planet({
  id,
  name,
  kind,
  radius,
  semiMajorAxis,
  orbitalPeriod,
  color,
  isSelected,
  onClick,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const planetGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const visualOrbitRadius = Math.max(4, semiMajorAxis * 20);
  const visualPlanetRadius = THREE.MathUtils.clamp(
    Math.cbrt(radius) * 0.45,
    0.35,
    2.4,
  );

  const textures = useMemo(
    () => generatePlanetTextures(kind, hashSeed(id)),
    [kind, id],
  );

  useEffect(() => {
    return () => {
      textures.map.dispose();
      textures.normalMap.dispose();
      textures.roughnessMap.dispose();
    };
  }, [textures]);

  // Register so the camera rig can track this planet's world position.
  useEffect(() => {
    registerPlanetPosition(id);
    return () => {
      unregisterPlanetPosition(id);
    };
  }, [id]);

  const phase = useMemo(() => (hashSeed(id) / 10000) * Math.PI * 2, [id]);
  useEffect(() => {
    if (groupRef.current) groupRef.current.rotation.y = phase;
  }, [phase]);

  useFrame((_state, delta) => {
    if (groupRef.current && orbitalPeriod > 0) {
      const speed = 0.04 / Math.log10(orbitalPeriod + 10);
      groupRef.current.rotation.y += speed * delta;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.05 * delta;
    }
    // Publish world position so CameraRig can chase the planet.
    if (planetGroupRef.current) {
      const v = registerPlanetPosition(id);
      planetGroupRef.current.getWorldPosition(v);
    }
  });

  const tint = color ? new THREE.Color(color) : new THREE.Color(0xffffff);
  const showLabel = hovered || isSelected;

  return (
    <group ref={groupRef}>
      <group ref={planetGroupRef} position={[visualOrbitRadius, 0, 0]}>
        <Sphere
          ref={meshRef}
          args={[visualPlanetRadius, 96, 96]}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={textures.map}
            normalMap={textures.normalMap}
            normalScale={new THREE.Vector2(0.6, 0.6)}
            roughnessMap={textures.roughnessMap}
            color={tint}
            roughness={1.0}
            metalness={0.0}
          />
        </Sphere>

        <mesh scale={1.06}>
          <sphereGeometry args={[visualPlanetRadius, 48, 48]} />
          <meshBasicMaterial
            color={
              kind === 'ocean' || kind === 'super-earth'
                ? '#7cb6e8'
                : kind === 'ice-giant'
                  ? '#bde6ff'
                  : kind === 'lava'
                    ? '#ff8a4a'
                    : '#a8c0e0'
            }
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={1.14}>
          <sphereGeometry args={[visualPlanetRadius, 32, 32]} />
          <meshBasicMaterial
            color="#6f8fb8"
            transparent
            opacity={0.04}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[visualPlanetRadius * 1.6, visualPlanetRadius * 1.62, 64]}
            />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        )}

        {showLabel && (
          <Html
            position={[0, visualPlanetRadius + 0.6, 0]}
            center
            distanceFactor={10}
            style={{ pointerEvents: 'none' }}
          >
            <div className="flex flex-col items-center gap-0.5 select-none">
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/90 whitespace-nowrap font-light">
                {name}
              </div>
              <div className="text-[8px] tracking-[0.25em] uppercase text-white/45 whitespace-nowrap">
                {KIND_LABEL[kind] ?? kind}
              </div>
            </div>
          </Html>
        )}
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[visualOrbitRadius - 0.015, visualOrbitRadius + 0.015, 256]}
        />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={isSelected || hovered ? 0.18 : 0.05}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
