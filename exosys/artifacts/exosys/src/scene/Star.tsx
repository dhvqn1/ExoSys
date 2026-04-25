import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function Star() {
  return (
    <group>
      {/* Star core - emissive so it stays bright regardless of lighting */}
      <Sphere args={[2, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#ffe2b8" toneMapped={false} />
      </Sphere>

      {/* Soft halo */}
      <Sphere args={[2.4, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ffb066"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </Sphere>
      <Sphere args={[3.2, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ff8a3b"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </Sphere>

      {/* The actual sun light. High intensity + low decay so distant planets are lit. */}
      <pointLight
        position={[0, 0, 0]}
        color="#ffd9a8"
        intensity={400}
        distance={0}
        decay={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
    </group>
  );
}
