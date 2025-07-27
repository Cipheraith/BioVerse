/**
 * Real-time 3D Health Data Visualization
 * Interactive 3D charts and data flows for health metrics
 */

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { HealthTwin } from '../../types/healthTwin';

interface HealthDataVisualization3DProps {
  healthTwin: HealthTwin;
  timeRange: '24h' | '7d' | '30d' | '1y';
}

interface DataPoint {
  timestamp: number;
  value: number;
  metric: string;
  color: string;
}

function HealthMetrics3D({ healthTwin, timeRange }: HealthDataVisualization3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Generate sample health data based on health twin
  const generateHealthData = (): DataPoint[] => {
    const metrics = [
      { name: 'Heart Rate', color: '#ef4444', baseValue: 72 },
      { name: 'Blood Pressure', color: '#3b82f6', baseValue: 120 },
      { name: 'Temperature', color: '#f59e0b', baseValue: 98.6 },
      { name: 'Oxygen Saturation', color: '#10b981', baseValue: 98 },
      { name: 'Blood Sugar', color: '#8b5cf6', baseValue: 100 }
    ];

    const dataPoints: DataPoint[] = [];
    const now = Date.now();
    const timeSpan = timeRange === '24h' ? 24 * 60 * 60 * 1000 : 
                   timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                   timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                   365 * 24 * 60 * 60 * 1000;

    metrics.forEach((metric, metricIndex) => {
      for (let i = 0; i < 50; i++) {
        const timestamp = now - (timeSpan * (1 - i / 50));
        const variation = (Math.random() - 0.5) * 0.2;
        const riskMultiplier = healthTwin.riskProfile.overall === 'high' ? 1.2 : 
                              healthTwin.riskProfile.overall === 'medium' ? 1.1 : 1.0;
        
        dataPoints.push({
          timestamp,
          value: metric.baseValue * (1 + variation) * riskMultiplier,
          metric: metric.name,
          color: metric.color
        });
      }
    });

    return dataPoints;
  };

  const healthData = generateHealthData();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      setAnimationProgress((state.clock.elapsedTime % 10) / 10);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Health Data Visualization */}
      <HealthChart3D data={healthData} animationProgress={animationProgress} />
      
      {/* Vital Signs Sphere */}
      <VitalSignsSphere healthTwin={healthTwin} />
      
      {/* Health Trend Arrows */}
      <HealthTrendIndicators healthTwin={healthTwin} />
    </group>
  );
}

function HealthChart3D({ data, animationProgress }: { data: DataPoint[], animationProgress: number }) {
  const chartRef = useRef<THREE.Group>(null!);

  // Group data by metric
  const metricGroups = data.reduce((acc, point) => {
    if (!acc[point.metric]) acc[point.metric] = [];
    acc[point.metric].push(point);
    return acc;
  }, {} as Record<string, DataPoint[]>);

  return (
    <group ref={chartRef} position={[0, 0, 0]}>
      {Object.entries(metricGroups).map(([metric, points], metricIndex) => (
        <group key={metric} position={[0, metricIndex * 0.5 - 1, 0]}>
          {/* Data points as 3D spheres */}
          {points.map((point, index) => {
            const x = (index / points.length) * 4 - 2;
            const y = (point.value / 150) * 2; // Normalize value
            const z = metricIndex * 0.2;
            
            const scale = 0.02 + (Math.sin(animationProgress * Math.PI * 2 + index * 0.1) * 0.01);
            
            return (
              <mesh key={index} position={[x, y, z]} scale={[scale, scale, scale]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial 
                  color={point.color}
                  emissive={point.color}
                  emissiveIntensity={0.3}
                />
              </mesh>
            );
          })}
          
          {/* Metric label */}
          <Text
            position={[-2.5, 0, 0]}
            fontSize={0.1}
            color={points[0]?.color || '#ffffff'}
            anchorX="left"
            anchorY="middle"
          >
            {metric}
          </Text>
          
          {/* Trend line */}
          <TrendLine points={points} color={points[0]?.color || '#ffffff'} />
        </group>
      ))}
      
      {/* Chart axes */}
      <ChartAxes />
    </group>
  );
}

function TrendLine({ points, color }: { points: DataPoint[], color: string }) {
  const linePoints = points.map((point, index) => {
    const x = (index / points.length) * 4 - 2;
    const y = (point.value / 150) * 2;
    const z = 0;
    return new THREE.Vector3(x, y, z);
  });

  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.7}
    />
  );
}

function ChartAxes() {
  return (
    <group>
      {/* X-axis (Time) */}
      <Line
        points={[new THREE.Vector3(-2, -1, 0), new THREE.Vector3(2, -1, 0)]}
        color="#666666"
        lineWidth={1}
      />
      
      {/* Y-axis (Values) */}
      <Line
        points={[new THREE.Vector3(-2, -1, 0), new THREE.Vector3(-2, 2, 0)]}
        color="#666666"
        lineWidth={1}
      />
      
      {/* Axis labels */}
      <Text
        position={[0, -1.3, 0]}
        fontSize={0.08}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        Time
      </Text>
      
      <Text
        position={[-2.3, 0.5, 0]}
        fontSize={0.08}
        color="#666666"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        Values
      </Text>
    </group>
  );
}

function VitalSignsSphere({ healthTwin }: { healthTwin: HealthTwin }) {
  const sphereRef = useRef<THREE.Mesh>(null!);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useFrame((state) => {
    if (sphereRef.current) {
      // Pulse based on health status
      const healthScore = calculateHealthScore(healthTwin);
      const pulseRate = healthScore > 80 ? 1 : healthScore > 60 ? 1.5 : 2;
      
      const pulse = Math.sin(state.clock.elapsedTime * pulseRate) * 0.1 + 1;
      sphereRef.current.scale.setScalar(pulse);
      
      setPulseIntensity((Math.sin(state.clock.elapsedTime * pulseRate) + 1) * 0.5);
    }
  });

  const healthColor = getHealthColor(calculateHealthScore(healthTwin));

  return (
    <group position={[3, 0, 0]}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={healthColor}
          emissive={healthColor}
          emissiveIntensity={pulseIntensity * 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Vital signs orbiting the sphere */}
      <VitalSignsOrbit healthTwin={healthTwin} />
      
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.08}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Health Score: {calculateHealthScore(healthTwin)}
      </Text>
    </group>
  );
}

function VitalSignsOrbit({ healthTwin }: { healthTwin: HealthTwin }) {
  const orbitRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const vitalSigns = [
    { name: 'HR', value: '72', color: '#ef4444', angle: 0 },
    { name: 'BP', value: '120/80', color: '#3b82f6', angle: Math.PI / 2 },
    { name: 'O2', value: '98%', color: '#10b981', angle: Math.PI },
    { name: 'TEMP', value: '98.6°F', color: '#f59e0b', angle: 3 * Math.PI / 2 }
  ];

  return (
    <group ref={orbitRef}>
      {vitalSigns.map((vital, index) => {
        const radius = 0.6;
        const x = Math.cos(vital.angle) * radius;
        const z = Math.sin(vital.angle) * radius;
        
        return (
          <group key={vital.name} position={[x, 0, z]}>
            <mesh>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial 
                color={vital.color}
                emissive={vital.color}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            <Html>
              <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                <div className="font-semibold">{vital.name}</div>
                <div>{vital.value}</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function HealthTrendIndicators({ healthTwin }: { healthTwin: HealthTwin }) {
  const trends = [
    { name: 'Overall Health', trend: 'stable', position: [-3, 1, 0] },
    { name: 'Risk Level', trend: 'improving', position: [-3, 0, 0] },
    { name: 'Symptoms', trend: 'declining', position: [-3, -1, 0] }
  ];

  return (
    <group>
      {trends.map((trend, index) => (
        <TrendArrow
          key={trend.name}
          name={trend.name}
          trend={trend.trend}
          position={trend.position as [number, number, number]}
        />
      ))}
    </group>
  );
}

function TrendArrow({ 
  name, 
  trend, 
  position 
}: { 
  name: string; 
  trend: string; 
  position: [number, number, number] 
}) {
  const arrowRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (arrowRef.current) {
      arrowRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#22c55e';
      case 'stable': return '#eab308';
      case 'declining': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTrendRotation = (trend: string): [number, number, number] => {
    switch (trend) {
      case 'improving': return [0, 0, -Math.PI / 4];
      case 'stable': return [0, 0, 0];
      case 'declining': return [0, 0, Math.PI / 4];
      default: return [0, 0, 0];
    }
  };

  return (
    <group ref={arrowRef} position={position}>
      <mesh rotation={getTrendRotation(trend)}>
        <coneGeometry args={[0.05, 0.2, 8]} />
        <meshStandardMaterial 
          color={getTrendColor(trend)}
          emissive={getTrendColor(trend)}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <Text
        position={[0.3, 0, 0]}
        fontSize={0.06}
        color={getTrendColor(trend)}
        anchorX="left"
        anchorY="middle"
      >
        {name}: {trend}
      </Text>
    </group>
  );
}

// Helper functions
function calculateHealthScore(healthTwin: HealthTwin): number {
  let score = 85;
  
  // Adjust based on risk level
  switch (healthTwin.riskProfile.overall) {
    case 'low': score += 10; break;
    case 'medium': score -= 5; break;
    case 'high': score -= 15; break;
    case 'critical': score -= 30; break;
  }
  
  // Adjust based on chronic conditions
  score -= healthTwin.basicInfo.chronicConditions.length * 5;
  
  // Adjust based on recent symptoms
  score -= healthTwin.healthHistory.symptoms.recent.length * 2;
  
  return Math.max(0, Math.min(100, score));
}

function getHealthColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export const HealthDataVisualization3D: React.FC<HealthDataVisualization3DProps> = ({ 
  healthTwin, 
  timeRange 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  return (
    <div className="w-full h-96 relative bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
      <Canvas camera={{ position: [4, 2, 4], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.7} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4f46e5" />
        
        <HealthMetrics3D healthTwin={healthTwin} timeRange={timeRange} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={8}
          minDistance={2}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Time range selector */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Time Range</h3>
        <div className="flex space-x-2">
          {['24h', '7d', '30d', '1y'].map((range) => (
            <button
              key={range}
              className={`px-2 py-1 text-xs rounded ${
                timeRange === range 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Health metrics legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Health Metrics</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Heart Rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Blood Pressure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Oxygen Saturation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Temperature</span>
          </div>
        </div>
      </div>
    </div>
  );
};