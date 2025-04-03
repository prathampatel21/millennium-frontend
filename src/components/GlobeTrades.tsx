
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Earth component with texture
const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  // Use try-catch to handle texture loading errors
  const [textures, setTextures] = useState({
    earth: null,
    bump: null,
    clouds: null
  });
  
  useEffect(() => {
    // Preload textures to handle errors
    const textureLoader = new THREE.TextureLoader();
    
    const loadTexture = (url, fallbackColor) => {
      return new Promise((resolve) => {
        textureLoader.load(
          url,
          (texture) => resolve(texture),
          undefined,
          () => {
            // On error, create a colored material instead
            console.error(`Failed to load texture: ${url}`);
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = fallbackColor;
              ctx.fillRect(0, 0, 64, 64);
            }
            const fallbackTexture = new THREE.CanvasTexture(canvas);
            resolve(fallbackTexture);
          }
        );
      });
    };
    
    // Load all textures
    Promise.all([
      loadTexture('/earth-texture.jpg', '#1E40AF'), // Blue for earth
      loadTexture('/earth-bump.jpg', '#1E3A8A'),    // Dark blue for bump
      loadTexture('/earth-clouds.png', '#F3F4F6')   // Light gray for clouds
    ]).then(([earthTexture, bumpTexture, cloudsTexture]) => {
      setTextures({
        earth: earthTexture,
        bump: bumpTexture,
        clouds: cloudsTexture
      });
    });
    
    return () => {
      // Cleanup textures
      Object.values(textures).forEach(texture => {
        if (texture) {
          texture.dispose();
        }
      });
    };
  }, []);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
  });
  
  // Don't render until textures are loaded
  if (!textures.earth || !textures.bump || !textures.clouds) {
    return null;
  }
  
  return (
    <>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial 
          map={textures.earth}
          bumpMap={textures.bump}
          bumpScale={0.05}
          specularMap={textures.bump}
          specular={new THREE.Color('#111111')}
          shininess={5}
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh>
        <sphereGeometry args={[1.01, 32, 32]} />
        <meshPhongMaterial 
          map={textures.clouds}
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

// Loading fallback
const LoadingEarth = () => (
  <mesh>
    <sphereGeometry args={[1, 16, 16]} />
    <meshBasicMaterial color="#1E40AF" wireframe />
  </mesh>
);

// Main component
const GlobeTrades = () => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={<LoadingEarth />}>
          <Earth />
        </Suspense>
        
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
