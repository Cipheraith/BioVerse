/**
 * Molecular-Level Health Visualization
 * 3D visualization of cellular and molecular health indicators
 */

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { HealthTwin } from '../../types/healthTwin';

interface MolecularHealthVizProps {
  healthTwin: HealthTwin;
  focusArea: 'blood' | 'immune' | 'cellular' | 'genetic';
}

interface Molecule {
  id: string;
  type: 'protein' | 'cell' | 'antibody' | 'virus' | 'nutrient';
  position: [number, number, number];
  velocity: [number, number, number];
  health: number; // 0-1 scale
  size: number;
  color: string;
}

function MolecularSystem({ healthTwin, focusArea }: MolecularHealthVizProps) {
  const systemRef = useRef<THREE.Group>(null!);
  const [selectedMolecule, setSelectedMolecule] = useState<string | null>(null);

  // Generate molecules based on health data
  const molecules = useMemo(() => {
    const mols: Molecule[] = [];
    const healthScore = calculateHealthScore(healthTwin);
    const riskLevel = healthTwin.riskProfile.overall;

    // Generate different molecules based on focus area
    switch (focusArea) {
      case 'blood':
        // Red blood cells
        for (let i = 0; i < 50; i++) {
          mols.push({
            id: `rbc_${i}`,
            type: 'cell',
            position: [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            ],
            velocity: [
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02
            ],
            health: healthScore / 100,
            size: 0.1,
            color: riskLevel === 'high' ? '#ff6b6b' : '#ff4757'
          });
        }
        
        // White blood cells
        for (let i = 0; i < 15; i++) {
          mols.push({
            id: `wbc_${i}`,
            type: 'cell',
            position: [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            ],
            velocity: [
              (Math.random() - 0.5) * 0.03,
              (Math.random() - 0.5) * 0.03,
              (Math.random() - 0.5) * 0.03
            ],
            health: healthScore / 100,
            size: 0.15,
            color: '#f1f2f6'
          });
        }

        // Platelets
        for (let i = 0; i < 30; i++) {
          mols.push({
            id: `platelet_${i}`,
            type: 'cell',
            position: [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            ],
            velocity: [
              (Math.random() - 0.5) * 0.025,
              (Math.random() - 0.5) * 0.025,
              (Math.random() - 0.5) * 0.025
            ],
            health: healthScore / 100,
            size: 0.05,
            color: '#ffa502'
          });
        }
        break;

      case 'immune':
        // T-cells
        for (let i = 0; i < 20; i++) {
          mols.push({
            id: `tcell_${i}`,
            type: 'cell',
            position: [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            ],
            velocity: [
              (Math.random() - 0.5) * 0.04,
              (Math.random() - 0.5) * 0.04,
              (Math.random() - 0.5) * 0.04
            ],
            health: healthScore / 100,
            size: 0.12,
            color: '#3742fa'
          });
        }

        // Antibodies
        for (let i = 0; i < 40; i++) {
          mols.push({
            id: `antibody_${i}`,
            type: 'antibody',
            position: [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            ],
            velocity: [
              (Math.random() - 0.5) * 0.06,
              (Math.random() - 0.5) * 0.06,
              (Math.random() - 0.5) * 0.06
            ],
            health: healthScore / 100,
            size: 0.08,
            color: '#2ed573'
          });
        }

        // Pathogens (if health is compromised)
        if (riskLevel === 'high' || riskLevel === 'critical') {
          for (let i = 0; i < 10; i++) {
            mols.push({
              id: `pathogen_${i}`,
              type: 'virus',
              position: [
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
              ],
              velocity: [
                (Math.random() - 0.5) * 0.08,
                (Math.random() - 0.5) * 0.08,
                (Math.random() - 0.5) * 0.08
              ],
              health: 0.2,
              size: 0.06,
              color: '#ff3838'
            });
          }
        }
        break;

      case 'cellular':
        // Healthy cells
        for (let i = 0; i < 25; i++) {
          mols.push({
            id: `cell_${i}`,
            type: 'cell',
            position: [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            ],
            velocity: [
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01,
              (Math.random() - 0.5) * 0.01
            ],
            health: healthScore / 100,
            size: 0.2,
            color: healthScore > 80 ? '#2ed573' : healthScore > 60 ? '#ffa502' : '#ff4757'
          });
        }

        // Nutrients
        for (let i = 0; i < 35; i++) {
          mols.push({
            id: `nutrient_${i}`,
            type: 'nutrient',
            position: [
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8
            ],
            velocity: [
              (Math.random() - 0.5) * 0.03,
              (Math.random() - 0.5) * 0.03,
              (Math.random() - 0.5) * 0.03
            ],
            health: 1.0,
            size: 0.04,
            color: '#70a1ff'
          });
        }
        break;

      case 'genetic':
        // DNA strands
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          mols.push({
            id: `dna_${i}`,
            type: 'protein',
            position: [
              Math.cos(angle) * 2,
              (i - 4) * 0.5,
              Math.sin(angle) * 2
            ],
            velocity: [0, 0, 0],
            health: healthScore / 100,
            size: 0.1,
            color: '#5352ed'
          });
        }

        // Proteins
        for (let i = 0; i < 20; i++) {
          mols.push({
            id: `protein_${i}`,
            type: 'protein',
            position: [
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 6
            ],
            velocity: [
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02,
              (Math.random() - 0.5) * 0.02
            ],
            health: healthScore / 100,
            size: 0.08,
            color: '#ff6348'
          });
        }
        break;
    }

    return mols;
  }, [healthTwin, focusArea]);

  useFrame((state) => {
    if (systemRef.current) {
      // Animate molecules
      systemRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && molecules[index]) {
          const molecule = molecules[index];
          
          // Update position based on velocity
          child.position.x += molecule.velocity[0];
          child.position.y += molecule.velocity[1];
          child.position.z += molecule.velocity[2];

          // Boundary conditions
          if (Math.abs(child.position.x) > 4) molecule.velocity[0] *= -1;
          if (Math.abs(child.position.y) > 4) molecule.velocity[1] *= -1;
          if (Math.abs(child.position.z) > 4) molecule.velocity[2] *= -1;

          // Pulsing effect based on health
          const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.1 * molecule.health;
          child.scale.setScalar(pulse);
        }
      });

      // Rotate the entire system slowly
      systemRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={systemRef}>
      {molecules.map((molecule, index) => (
        <MoleculeComponent
          key={molecule.id}
          molecule={molecule}
          isSelected={selectedMolecule === molecule.id}
          onClick={() => setSelectedMolecule(molecule.id)}
        />
      ))}

      {/* DNA Double Helix for genetic focus */}
      {focusArea === 'genetic' && <DNAHelix />}

      {/* Blood vessel for blood focus */}
      {focusArea === 'blood' && <BloodVessel />}

      {/* Cell membrane for cellular focus */}
      {focusArea === 'cellular' && <CellMembrane />}
    </group>
  );
}

function MoleculeComponent({ 
  molecule, 
  isSelected, 
  onClick 
}: {
  molecule: Molecule;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const getGeometry = () => {
    switch (molecule.type) {
      case 'cell':
        return <sphereGeometry args={[molecule.size, 16, 16]} />;
      case 'protein':
        return <boxGeometry args={[molecule.size, molecule.size, molecule.size * 2]} />;
      case 'antibody':
        return <sphereGeometry args={[molecule.size, 8, 8]} />;
      case 'virus':
        return <sphereGeometry args={[molecule.size, 12, 12]} />;
      case 'nutrient':
        return <sphereGeometry args={[molecule.size, 6, 6]} />;
      default:
        return <sphereGeometry args={[molecule.size, 8, 8]} />;
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={molecule.position}
        onClick={onClick}
        onPointerEnter={() => document.body.style.cursor = 'pointer'}
        onPointerLeave={() => document.body.style.cursor = 'default'}
      >
        {getGeometry()}
        <meshStandardMaterial
          color={molecule.color}
          emissive={molecule.color}
          emissiveIntensity={isSelected ? 0.4 : 0.1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {isSelected && (
        <Html position={molecule.position}>
          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded text-xs">
            <div className="font-semibold capitalize">{molecule.type}</div>
            <div>Health: {(molecule.health * 100).toFixed(0)}%</div>
            <div>Size: {molecule.size.toFixed(2)}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function DNAHelix() {
  const helixRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={helixRef}>
      {Array.from({ length: 40 }).map((_, i) => {
        const angle1 = (i / 40) * Math.PI * 4;
        const angle2 = angle1 + Math.PI;
        const y = (i - 20) * 0.1;

        return (
          <group key={i}>
            {/* First strand */}
            <mesh position={[Math.cos(angle1) * 0.5, y, Math.sin(angle1) * 0.5]}>
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshStandardMaterial color="#ff6b6b" />
            </mesh>
            
            {/* Second strand */}
            <mesh position={[Math.cos(angle2) * 0.5, y, Math.sin(angle2) * 0.5]}>
              <sphereGeometry args={[0.02, 4, 4]} />
              <meshStandardMaterial color="#4834d4" />
            </mesh>
            
            {/* Base pairs */}
            {i % 4 === 0 && (
              <mesh position={[0, y, 0]} rotation={[0, angle1, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 1, 4]} />
                <meshStandardMaterial color="#ddd" opacity={0.6} transparent />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function BloodVessel() {
  return (
    <group>
      {/* Main vessel */}
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 8, 16]} />
        <meshStandardMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={0.1} 
          wireframe={true}
        />
      </mesh>
      
      {/* Vessel walls */}
      <mesh>
        <cylinderGeometry args={[1.6, 1.6, 8, 16]} />
        <meshStandardMaterial 
          color="#8b0000" 
          transparent 
          opacity={0.05}
        />
      </mesh>
    </group>
  );
}

function CellMembrane() {
  const membraneRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (membraneRef.current) {
      // Breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      membraneRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={membraneRef}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshStandardMaterial 
        color="#70a1ff" 
        transparent 
        opacity={0.1} 
        wireframe={true}
      />
    </mesh>
  );
}

function calculateHealthScore(healthTwin: HealthTwin): number {
  let score = 85;
  
  switch (healthTwin.riskProfile.overall) {
    case 'low': score += 10; break;
    case 'medium': score -= 5; break;
    case 'high': score -= 15; break;
    case 'critical': score -= 30; break;
  }
  
  score -= healthTwin.basicInfo.chronicConditions.length * 5;
  score -= healthTwin.healthHistory.symptoms.recent.length * 2;
  
  return Math.max(0, Math.min(100, score));
}

export const MolecularHealthViz: React.FC<MolecularHealthVizProps> = ({ 
  healthTwin, 
  focusArea 
}) => {
  const [selectedArea, setSelectedArea] = useState(focusArea);

  return (
    <div className="w-full h-96 relative bg-gradient-to-b from-indigo-900 to-black rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4f46e5" />
        
        <MolecularSystem healthTwin={healthTwin} focusArea={selectedArea} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={10}
          minDistance={2}
          autoRotate={false}
        />
      </Canvas>
      
      {/* Focus area selector */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Focus Area</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'blood', label: 'Blood', color: 'bg-red-500' },
            { key: 'immune', label: 'Immune', color: 'bg-blue-500' },
            { key: 'cellular', label: 'Cellular', color: 'bg-green-500' },
            { key: 'genetic', label: 'Genetic', color: 'bg-purple-500' }
          ].map((area) => (
            <button
              key={area.key}
              onClick={() => setSelectedArea(area.key as any)}
              className={`px-3 py-2 text-xs rounded flex items-center space-x-2 ${
                selectedArea === area.key 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${area.color}`}></div>
              <span>{area.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Molecular Legend</h3>
        <div className="space-y-1 text-xs">
          {selectedArea === 'blood' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Red Blood Cells</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>White Blood Cells</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Platelets</span>
              </div>
            </>
          )}
          {selectedArea === 'immune' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>T-Cells</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Antibodies</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Pathogens</span>
              </div>
            </>
          )}
          {selectedArea === 'cellular' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Healthy Cells</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Nutrients</span>
              </div>
            </>
          )}
          {selectedArea === 'genetic' && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>DNA Strands</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Proteins</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};