
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Earth component with texture
const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const earthTexture = useLoader(THREE.TextureLoader, '/earth-texture.jpg');
  const bumpTexture = useLoader(THREE.TextureLoader, '/earth-bump.jpg');
  const cloudsTexture = useLoader(THREE.TextureLoader, '/earth-clouds.png');
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
  });
  
  return (
    <>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial 
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.05}
          specularMap={bumpTexture}
          specular={new THREE.Color('#111111')}
          shininess={5}
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh>
        <sphereGeometry args={[1.01, 32, 32]} />
        <meshPhongMaterial 
          map={cloudsTexture}
          transparent={true}
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.015, 32, 32]} />
        <meshPhongMaterial 
          color="#0EA5E9"
          transparent={true}
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

// Main component
const GlobeTrades = () => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Earth />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={4}
          autoRotate
          autoRotateSpeed={0.5}
          enableRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};

export default GlobeTrades;
