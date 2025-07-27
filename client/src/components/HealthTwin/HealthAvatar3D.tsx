/**
 * 3D Health Avatar Component
 * Interactive 3D visualization of patient health status
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { HealthTwin } from '../../types/healthTwin';

interface HealthAvatar3DProps {
  healthTwin: HealthTwin;
  healthSummary: {
    score: number;
    status: string;
  } | null;
}

// Human-like figure component
function HealthFigure({ healthTwin, healthSummary }: HealthAvatar3DProps) {
  const figureRef = useRef<THREE.Group>(null!);
  const heartRef = useRef<THREE.Mesh>(null!);
  
  // Get color based on health status
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Green - Good health
    if (score >= 60) return '#eab308'; // Yellow - Fair health
    if (score >= 40) return '#f97316'; // Orange - Poor health
    return '#ef4444'; // Red - Critical health
  };

  const healthScore = healthSummary?.score || 70;
  const healthColor = getHealthColor(healthScore);

  // Animate the heart based on health status
  useFrame((state) => {
    if (heartRef.current) {
      const heartbeat = Math.sin(state.clock.elapsedTime * (healthScore / 20)) * 0.1 + 1;
      heartRef.current.scale.setScalar(heartbeat);
    }
    
    if (figureRef.current) {
      figureRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={figureRef}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.5, 8]} />
        <meshStandardMaterial color={healthColor} opacity={0.8} transparent />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fdbcab" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#fdbcab" />
      </mesh>
      <mesh position={[0.6, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#fdbcab" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.2, -1.2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 1, 8]} />
        <meshStandardMaterial color="#fdbcab" />
      </mesh>
      <mesh position={[0.2, -1.2, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 1, 8]} />
        <meshStandardMaterial color="#fdbcab" />
      </mesh>
      
      {/* Heart (animated) */}
      <mesh ref={heartRef} position={[-0.1, 0.3, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Health status indicators around the figure */}
      {healthTwin.basicInfo.chronicConditions.map((_, index) => (
        <mesh 
          key={index} 
          position={[
            Math.cos((index / healthTwin.basicInfo.chronicConditions.length) * Math.PI * 2) * 1.2,
            0.5,
            Math.sin((index / healthTwin.basicInfo.chronicConditions.length) * Math.PI * 2) * 1.2
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
        </mesh>
      ))}
      
      {/* Risk indicators */}
      {Object.entries(healthTwin.riskProfile).map(([key, risk], index) => {
        if (key === 'overall') return null;
        const riskScore = typeof risk === 'object' && 'score' in risk ? risk.score : 0;
        const riskColor = riskScore > 0.7 ? '#ef4444' : riskScore > 0.4 ? '#f97316' : '#22c55e';
        
        return (
          <mesh 
            key={key}
            position={[
              Math.cos((index / 4) * Math.PI * 2) * 0.8,
              -0.5 + index * 0.2,
              Math.sin((index / 4) * Math.PI * 2) * 0.8
            ]}
          >
            <boxGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial color={riskColor} opacity={0.7} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

export const HealthAvatar3D: React.FC<HealthAvatar3DProps> = ({ healthTwin, healthSummary }) => {
  return (
    <div className="w-full h-64 relative">
      <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <HealthFigure healthTwin={healthTwin} healthSummary={healthSummary} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={5}
          minDistance={1}
        />
      </Canvas>
      
      {/* Health score overlay */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        Health Score: {healthSummary?.score || 'N/A'}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Health Issues</span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span>Risk Factors</span>
        </div>
      </div>
    </div>
  );
};
