import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Star } from './Star';
import { Starfield } from './Starfield';
import { SystemView } from './SystemView';
import { CameraRig } from './CameraRig';
import * as THREE from 'three';

export function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [30, 20, 30], fov: 40 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={['#04060d']} />

      {/* Subtle fill so the night side of planets is not pure black */}
      <ambientLight intensity={0.18} color="#6a7e9a" />
      {/* Cool rim from the galactic background */}
      <hemisphereLight args={['#5d7aa6', '#1a1f2c', 0.25]} />

      <CameraRig />
      <Starfield />
      <Star />
      <SystemView />

      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          intensity={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
