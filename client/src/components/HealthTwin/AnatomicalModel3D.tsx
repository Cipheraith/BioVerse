/**
 * Advanced 3D Anatomical Model Component
 * Interactive anatomical visualization with organ-specific health data
 */

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Html, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { HealthTwin } from '../../types/healthTwin';

interface AnatomicalModel3DProps {
  healthTwin: HealthTwin;
  selectedOrgan?: string;
  onOrganSelect?: (organ: string) => void;
}

// Organ data with health indicators
interface OrganData {
  name: string;
  position: [number, number, number];
  color: string;
  healthStatus: 'healthy' | 'warning' | 'critical';
  metrics: Array<{ name: string; value: string; status: string }>;
}

function AnatomicalFigure({ healthTwin, selectedOrgan, onOrganSelect }: AnatomicalModel3DProps) {
  const figureRef = useRef<THREE.Group>(null!);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  // Define organs with health data
  const organs: OrganData[] = [
    {
      name: 'heart',
      position: [0, 0.3, 0.1],
      color: getOrganHealthColor('heart', healthTwin),
      healthStatus: getOrganHealthStatus('heart', healthTwin),
      metrics: [
        { name: 'Heart Rate', value: '72 BPM', status: 'normal' },
        { name: 'Blood Pressure', value: '120/80', status: 'normal' }
      ]
    },
    {
      name: 'lungs',
      position: [0, 0.4, -0.1],
      color: getOrganHealthColor('lungs', healthTwin),
      healthStatus: getOrganHealthStatus('lungs', healthTwin),
      metrics: [
        { name: 'Oxygen Saturation', value: '98%', status: 'normal' },
        { name: 'Respiratory Rate', value: '16/min', status: 'normal' }
      ]
    },
    {
      name: 'liver',
      position: [0.2, -0.1, 0.05],
      color: getOrganHealthColor('liver', healthTwin),
      healthStatus: getOrganHealthStatus('liver', healthTwin),
      metrics: [
        { name: 'ALT', value: '25 U/L', status: 'normal' },
        { name: 'AST', value: '22 U/L', status: 'normal' }
      ]
    },
    {
      name: 'kidneys',
      position: [-0.15, -0.2, -0.1],
      color: getOrganHealthColor('kidneys', healthTwin),
      healthStatus: getOrganHealthStatus('kidneys', healthTwin),
      metrics: [
        { name: 'Creatinine', value: '0.9 mg/dL', status: 'normal' },
        { name: 'BUN', value: '15 mg/dL', status: 'normal' }
      ]
    },
    {
      name: 'brain',
      position: [0, 1.2, 0],
      color: getOrganHealthColor('brain', healthTwin),
      healthStatus: getOrganHealthStatus('brain', healthTwin),
      metrics: [
        { name: 'Cognitive Score', value: '28/30', status: 'normal' },
        { name: 'Memory Test', value: 'Normal', status: 'normal' }
      ]
    }
  ];

  // Animate based on health data
  useFrame((state) => {
    if (figureRef.current) {
      // Subtle breathing animation
      figureRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={figureRef}>
      {/* Main body structure */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.5, 16]} />
        <meshStandardMaterial 
          color="#f0f0f0" 
          opacity={0.3} 
          transparent 
          wireframe={false}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fdbcab" opacity={0.8} transparent />
      </mesh>

      {/* Render organs */}
      {organs.map((organ) => (
        <OrganComponent
          key={organ.name}
          organ={organ}
          isSelected={selectedOrgan === organ.name}
          isHovered={hoveredOrgan === organ.name}
          onHover={setHoveredOrgan}
          onClick={onOrganSelect}
        />
      ))}

      {/* Neural network visualization for brain activity */}
      {selectedOrgan === 'brain' && (
        <NeuralNetworkVisualization position={[0, 1.2, 0]} />
      )}

      {/* Blood flow visualization */}
      <BloodFlowVisualization healthTwin={healthTwin} />
    </group>
  );
}

function OrganComponent({ 
  organ, 
  isSelected, 
  isHovered, 
  onHover, 
  onClick 
}: {
  organ: OrganData;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (organ: string | null) => void;
  onClick?: (organ: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation for selected/hovered organs
      const scale = isSelected || isHovered ? 
        1.1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 : 1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getOrganGeometry = (organName: string) => {
    switch (organName) {
      case 'heart':
        return <sphereGeometry args={[0.08, 8, 8]} />;
      case 'lungs':
        return <boxGeometry args={[0.15, 0.12, 0.08]} />;
      case 'liver':
        return <boxGeometry args={[0.12, 0.08, 0.06]} />;
      case 'kidneys':
        return <sphereGeometry args={[0.05, 8, 8]} />;
      case 'brain':
        return <sphereGeometry args={[0.25, 16, 16]} />;
      default:
        return <sphereGeometry args={[0.05, 8, 8]} />;
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={organ.position}
        onPointerEnter={() => onHover(organ.name)}
        onPointerLeave={() => onHover(null)}
        onClick={() => onClick?.(organ.name)}
      >
        {getOrganGeometry(organ.name)}
        <meshStandardMaterial 
          color={organ.color}
          emissive={organ.color}
          emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.2 : 0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Health status indicator */}
      <mesh position={[organ.position[0] + 0.1, organ.position[1] + 0.1, organ.position[2]]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial 
          color={getStatusColor(organ.healthStatus)}
          emissive={getStatusColor(organ.healthStatus)}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Organ label */}
      {(isSelected || isHovered) && (
        <Html position={[organ.position[0], organ.position[1] + 0.15, organ.position[2]]}>
          <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            <div className="font-semibold capitalize">{organ.name}</div>
            <div className="text-xs opacity-75">
              Status: {organ.healthStatus}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function NeuralNetworkVisualization({ position }: { position: [number, number, number] }) {
  const networkRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (networkRef.current) {
      networkRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={networkRef} position={position}>
      {/* Neural nodes */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 0.2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 0.5) * 0.1,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.01, 4, 4]} />
            <meshStandardMaterial 
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function BloodFlowVisualization({ healthTwin }: { healthTwin: HealthTwin }) {
  const flowRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (flowRef.current) {
      // Animate blood flow particles
      flowRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const time = state.clock.elapsedTime + index * 0.5;
          child.position.y = Math.sin(time * 2) * 0.5;
          child.material.opacity = (Math.sin(time * 3) + 1) * 0.3;
        }
      });
    }
  });

  return (
    <group ref={flowRef}>
      {/* Blood flow particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.1 - 0.5, 0.05]}>
          <sphereGeometry args={[0.01, 4, 4]} />
          <meshStandardMaterial 
            color="#ff0000"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// Helper functions
function getOrganHealthColor(organ: string, healthTwin: HealthTwin): string {
  // Analyze health twin data to determine organ health
  const riskLevel = healthTwin.riskProfile.overall;
  
  switch (riskLevel) {
    case 'low': return '#22c55e';
    case 'medium': return '#eab308';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#6b7280';
  }
}

function getOrganHealthStatus(organ: string, healthTwin: HealthTwin): 'healthy' | 'warning' | 'critical' {
  const riskLevel = healthTwin.riskProfile.overall;
  
  if (riskLevel === 'critical') return 'critical';
  if (riskLevel === 'high' || riskLevel === 'medium') return 'warning';
  return 'healthy';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'healthy': return '#22c55e';
    case 'warning': return '#eab308';
    case 'critical': return '#ef4444';
    default: return '#6b7280';
  }
}

export const AnatomicalModel3D: React.FC<AnatomicalModel3DProps> = ({ 
  healthTwin, 
  selectedOrgan, 
  onOrganSelect 
}) => {
  return (
    <div className="w-full h-96 relative bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [2, 1, 2], fov: 50 }}>
        <Environment preset="studio" />
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <AnatomicalFigure 
          healthTwin={healthTwin} 
          selectedOrgan={selectedOrgan}
          onOrganSelect={onOrganSelect}
        />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={5}
          minDistance={1}
          autoRotate={false}
        />
      </Canvas>
      
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Interactive Controls</h3>
        <div className="text-xs space-y-1">
          <div>• Click organs to select</div>
          <div>• Drag to rotate view</div>
          <div>• Scroll to zoom</div>
        </div>
      </div>

      {/* Health status legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Health Status</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Healthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};