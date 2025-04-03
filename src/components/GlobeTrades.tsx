import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

// Generate random coordinates on the globe
const generateLocation = () => {
  const lat = (Math.random() * 180 - 90) * Math.PI / 180;
  const lng = (Math.random() * 360 - 180) * Math.PI / 180;
  const radius = 1;
  
  const x = radius * Math.cos(lat) * Math.cos(lng);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.sin(lng);
  
  return new THREE.Vector3(x, y, z);
};

// Generate random trade data
const generateTrades = (count: number) => {
  return Array.from({ length: count }, () => {
    const start = generateLocation();
    const end = generateLocation();
    return {
      start,
      end,
      progress: 0,
      duration: 2 + Math.random() * 3, // Animation duration between 2-5 seconds
      color: new THREE.Color(
        0.3 + Math.random() * 0.2,
        0.7 + Math.random() * 0.3,
        0.8 + Math.random() * 0.2
      ),
      size: 0.01 + Math.random() * 0.01,
      completed: false,
      startTime: Math.random() * 5, // Stagger start times
    };
  });
};

// Component for a single trade animation
const Trade = ({ start, end, progress, color, size }: any) => {
  // Create curved path between points
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  midPoint.normalize().multiplyScalar(1 + distance * 0.5);
  
  // Create curve
  const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
  
  // Create points along curve for the line
  const points = curve.getPoints(50);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(
    points.slice(0, Math.floor(points.length * progress))
  );
  
  // Calculate current position for the moving dot
  const currentPos = curve.getPointAt(Math.min(progress, 1));
  
  return (
    <>
      {/* Line - using primitive instead of line */}
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: color }))} />
      
      {/* Moving dot */}
      <mesh position={currentPos}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Impact "ripple" effect when trade completes */}
      {progress >= 0.99 && (
        <mesh position={end}>
          <ringGeometry args={[0.02, 0.03, 32]} />
          <meshBasicMaterial color={color} transparent opacity={1 - (progress - 0.99) * 100} />
        </mesh>
      )}
    </>
  );
};

// Manage all trades and their animations
const Trades = () => {
  const [trades, setTrades] = useState(() => generateTrades(15));
  const clock = useRef(new THREE.Clock());
  
  useFrame(() => {
    const elapsedTime = clock.current.getElapsedTime();
    
    setTrades(prevTrades => 
      prevTrades.map(trade => {
        // Check if it's time to start this trade animation
        if (elapsedTime < trade.startTime) {
          return trade;
        }
        
        const elapsed = elapsedTime - trade.startTime;
        const newProgress = Math.min(elapsed / trade.duration, 1);
        
        // If the trade animation has completed, create a new random trade
        if (newProgress >= 1 && !trade.completed) {
          return {
            start: generateLocation(),
            end: generateLocation(),
            progress: 0,
            duration: 2 + Math.random() * 3,
            color: new THREE.Color(
              0.3 + Math.random() * 0.2,
              0.7 + Math.random() * 0.3,
              0.8 + Math.random() * 0.2
            ),
            size: 0.01 + Math.random() * 0.01,
            completed: false,
            startTime: elapsedTime + Math.random() * 2,
          };
        }
        
        return {
          ...trade,
          progress: newProgress,
          completed: newProgress >= 1
        };
      })
    );
  });
  
  return (
    <>
      {trades.map((trade, index) => (
        <Trade key={index} {...trade} />
      ))}
    </>
  );
};

// Earth component with texture
const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005;
    }
  });
  
  return (
    <Sphere ref={earthRef} args={[1, 64, 64]}>
      <meshPhongMaterial 
        color="#2266aa" 
        emissive="#112244" 
        specular="#111111"
        shininess={10}
        opacity={0.8}
        transparent
        wireframe
      />
    </Sphere>
  );
};

// Main component
const GlobeTrades: React.FC = () => {
  return (
    <div className="h-[300px] md:h-[400px] lg:h-[500px] w-full rounded-xl overflow-hidden glass">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Earth />
        <Trades />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={4}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default GlobeTrades;
