import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export function Starfield() {
  const starsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y -= 0.005 * delta;
    }
  });

  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
    </group>
  );
}