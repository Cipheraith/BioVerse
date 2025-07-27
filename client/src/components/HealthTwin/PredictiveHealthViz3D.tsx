/**
 * AI-Powered Predictive Health Visualization
 * 3D visualization of health predictions and risk trajectories
 */

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { HealthTwin } from '../../types/healthTwin';

interface PredictiveHealthViz3DProps {
  healthTwin: HealthTwin;
  predictionTimeframe: '1m' | '3m' | '6m' | '1y' | '5y';
}

interface HealthPrediction {
  timepoint: number; // months from now
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  factors: string[];
  interventions: string[];
}

interface RiskFactor {
  name: string;
  currentImpact: number;
  projectedImpact: number;
  trajectory: 'improving' | 'stable' | 'worsening';
  position: [number, number, number];
  color: string;
}

function PredictiveSystem({ healthTwin, predictionTimeframe }: PredictiveHealthViz3DProps) {
  const systemRef = useRef<THREE.Group>(null!);
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(null);

  // Generate health predictions based on current health twin data
  const predictions = useMemo(() => {
    const timeframes = {
      '1m': 1, '3m': 3, '6m': 6, '1y': 12, '5y': 60
    };

    const maxMonths = timeframes[predictionTimeframe];
    const currentScore = calculateCurrentHealthScore(healthTwin);
    const riskTrend = getRiskTrend(healthTwin);

    const preds: HealthPrediction[] = [];

    for (let i = 0; i <= maxMonths; i += Math.max(1, Math.floor(maxMonths / 20))) {
      const timeDecay = i / maxMonths;
      const confidence = Math.max(0.3, 1 - timeDecay * 0.7);

      // Calculate predicted health score with trend
      let predictedScore = currentScore;
      if (riskTrend === 'improving') {
        predictedScore += timeDecay * 15 * (1 - timeDecay);
      } else if (riskTrend === 'worsening') {
        predictedScore -= timeDecay * 20 * (1 + timeDecay * 0.5);
      } else {
        predictedScore += (Math.random() - 0.5) * 10 * timeDecay;
      }

      predictedScore = Math.max(0, Math.min(100, predictedScore));

      const riskLevel = predictedScore > 80 ? 'low' :
        predictedScore > 60 ? 'medium' :
          predictedScore > 40 ? 'high' : 'critical';

      preds.push({
        timepoint: i,
        healthScore: predictedScore,
        riskLevel,
        confidence,
        factors: generateRiskFactors(healthTwin, i),
        interventions: generateInterventions(healthTwin, predictedScore)
      });
    }

    return preds;
  }, [healthTwin, predictionTimeframe]);

  // Generate risk factors visualization
  const riskFactors = useMemo(() => {
    const factors: RiskFactor[] = [];
    const baseFactors = [
      'Age', 'Lifestyle', 'Genetics', 'Environment', 'Chronic Conditions'
    ];

    baseFactors.forEach((factor, index) => {
      const angle = (index / baseFactors.length) * Math.PI * 2;
      const radius = 2;

      factors.push({
        name: factor,
        currentImpact: Math.random() * 0.8 + 0.2,
        projectedImpact: Math.random() * 0.8 + 0.2,
        trajectory: ['improving', 'stable', 'worsening'][Math.floor(Math.random() * 3)] as any,
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        color: getFactorColor(factor)
      });
    });

    return factors;
  }, [healthTwin]);

  useFrame((state) => {
    if (systemRef.current) {
      systemRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={systemRef}>
      {/* Health trajectory path */}
      <HealthTrajectoryPath predictions={predictions} />

      {/* Risk factors constellation */}
      <RiskFactorsConstellation
        factors={riskFactors}
        healthTwin={healthTwin}
      />

      {/* Prediction timeline */}
      <PredictionTimeline
        predictions={predictions}
        selectedPrediction={selectedPrediction}
        onSelectPrediction={setSelectedPrediction}
      />

      {/* AI confidence visualization */}
      <AIConfidenceVisualization predictions={predictions} />

      {/* Intervention recommendations */}
      <InterventionRecommendations
        predictions={predictions}
        healthTwin={healthTwin}
      />
    </group>
  );
}

function HealthTrajectoryPath({ predictions }: { predictions: HealthPrediction[] }) {
  const pathRef = useRef<THREE.Group>(null!);

  // Create path points
  const pathPoints = predictions.map((pred, index) => {
    const x = (index / predictions.length) * 8 - 4;
    const y = (pred.healthScore / 100) * 4 - 2;
    const z = 0;
    return new THREE.Vector3(x, y, z);
  });

  useFrame((state) => {
    if (pathRef.current) {
      // Animate path visibility
      pathRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const wave = Math.sin(state.clock.elapsedTime * 2 - index * 0.1);
          child.scale.y = 1 + wave * 0.2;
        }
      });
    }
  });

  return (
    <group ref={pathRef}>
      {/* Main trajectory line */}
      <Line
        points={pathPoints}
        color="#4f46e5"
        lineWidth={3}
        transparent
        opacity={0.8}
      />

      {/* Prediction points */}
      {predictions.map((pred, index) => {
        const x = (index / predictions.length) * 8 - 4;
        const y = (pred.healthScore / 100) * 4 - 2;
        const color = getRiskColor(pred.riskLevel);

        return (
          <mesh key={index} position={[x, y, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
              transparent
              opacity={pred.confidence}
            />
          </mesh>
        );
      })}

      {/* Confidence envelope */}
      <ConfidenceEnvelope predictions={predictions} />
    </group>
  );
}

function ConfidenceEnvelope({ predictions }: { predictions: HealthPrediction[] }) {
  const envelopeRef = useRef<THREE.Mesh>(null!);

  const upperPoints = predictions.map((pred, index) => {
    const x = (index / predictions.length) * 8 - 4;
    const y = (pred.healthScore / 100) * 4 - 2 + (1 - pred.confidence) * 2;
    return new THREE.Vector3(x, y, 0.1);
  });

  const lowerPoints = predictions.map((pred, index) => {
    const x = (index / predictions.length) * 8 - 4;
    const y = (pred.healthScore / 100) * 4 - 2 - (1 - pred.confidence) * 2;
    return new THREE.Vector3(x, y, 0.1);
  });

  return (
    <group>
      <Line
        points={upperPoints}
        color="#4f46e5"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
      <Line
        points={lowerPoints}
        color="#4f46e5"
        lineWidth={1}
        transparent
        opacity={0.3}
      />
    </group>
  );
}

function RiskFactorsConstellation({
  factors,
  healthTwin
}: {
  factors: RiskFactor[];
  healthTwin: HealthTwin;
}) {
  const constellationRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (constellationRef.current) {
      constellationRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={constellationRef} position={[0, 2, 0]}>
      {factors.map((factor, index) => (
        <RiskFactorNode
          key={factor.name}
          factor={factor}
          index={index}
        />
      ))}

      {/* Connections between factors */}
      {factors.map((factor, index) => (
        factors.slice(index + 1).map((otherFactor, otherIndex) => (
          <Line
            key={`${index}-${otherIndex}`}
            points={[
              new THREE.Vector3(...factor.position),
              new THREE.Vector3(...otherFactor.position)
            ]}
            color="#666666"
            lineWidth={0.5}
            transparent
            opacity={0.2}
          />
        ))
      ))}
    </group>
  );
}

function RiskFactorNode({ factor, index }: { factor: RiskFactor; index: number }) {
  const nodeRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      nodeRef.current.scale.setScalar(pulse * (hovered ? 1.2 : 1));
    }
  });

  const size = 0.1 + factor.currentImpact * 0.1;

  return (
    <group position={factor.position}>
      <mesh
        ref={nodeRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial
          color={factor.color}
          emissive={factor.color}
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
      </mesh>

      {/* Trajectory indicator */}
      <TrajectoryIndicator
        trajectory={factor.trajectory}
        position={[0, size + 0.1, 0]}
      />

      {hovered && (
        <Html>
          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded text-xs">
            <div className="font-semibold">{factor.name}</div>
            <div>Current Impact: {(factor.currentImpact * 100).toFixed(0)}%</div>
            <div>Projected: {(factor.projectedImpact * 100).toFixed(0)}%</div>
            <div>Trend: {factor.trajectory}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function TrajectoryIndicator({
  trajectory,
  position
}: {
  trajectory: string;
  position: [number, number, number]
}) {
  const getArrowRotation = (): [number, number, number] => {
    switch (trajectory) {
      case 'improving': return [0, 0, -Math.PI / 4];
      case 'worsening': return [0, 0, Math.PI / 4];
      default: return [0, 0, 0];
    }
  };

  const getArrowColor = () => {
    switch (trajectory) {
      case 'improving': return '#22c55e';
      case 'worsening': return '#ef4444';
      default: return '#eab308';
    }
  };

  return (
    <mesh position={position} rotation={getArrowRotation()}>
      <coneGeometry args={[0.02, 0.08, 6]} />
      <meshStandardMaterial color={getArrowColor()} />
    </mesh>
  );
}

function PredictionTimeline({
  predictions,
  selectedPrediction,
  onSelectPrediction
}: {
  predictions: HealthPrediction[];
  selectedPrediction: number | null;
  onSelectPrediction: (index: number | null) => void;
}) {
  return (
    <group position={[0, -3, 0]}>
      {predictions.map((pred, index) => {
        const x = (index / predictions.length) * 8 - 4;
        const isSelected = selectedPrediction === index;

        return (
          <group key={index} position={[x, 0, 0]}>
            <mesh
              onClick={() => onSelectPrediction(index)}
              onPointerEnter={() => document.body.style.cursor = 'pointer'}
              onPointerLeave={() => document.body.style.cursor = 'default'}
            >
              <cylinderGeometry args={[0.05, 0.05, pred.confidence * 2, 8]} />
              <meshStandardMaterial
                color={getRiskColor(pred.riskLevel)}
                emissive={getRiskColor(pred.riskLevel)}
                emissiveIntensity={isSelected ? 0.4 : 0.1}
              />
            </mesh>

            {isSelected && (
              <Html position={[0, 1.5, 0]}>
                <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded text-xs">
                  <div className="font-semibold">
                    {pred.timepoint === 0 ? 'Current' : `+${pred.timepoint} months`}
                  </div>
                  <div>Health Score: {pred.healthScore.toFixed(0)}</div>
                  <div>Risk Level: {pred.riskLevel}</div>
                  <div>Confidence: {(pred.confidence * 100).toFixed(0)}%</div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function AIConfidenceVisualization({ predictions }: { predictions: HealthPrediction[] }) {
  const confidenceRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (confidenceRef.current) {
      confidenceRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const wave = Math.sin(state.clock.elapsedTime + index * 0.2);
          child.material.opacity = predictions[index]?.confidence * (0.5 + wave * 0.2);
        }
      });
    }
  });

  return (
    <group ref={confidenceRef} position={[4, 0, 0]}>
      <Text
        position={[0, 2, 0]}
        fontSize={0.2}
        color="#4f46e5"
        anchorX="center"
        anchorY="middle"
      >
        AI Confidence
      </Text>

      {/* Confidence visualization as neural network */}
      <NeuralNetworkVisualization predictions={predictions} />
    </group>
  );
}

function NeuralNetworkVisualization({ predictions }: { predictions: HealthPrediction[] }) {
  const networkRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (networkRef.current) {
      networkRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  const avgConfidence = predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length;

  return (
    <group ref={networkRef}>
      {/* Neural nodes */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.8;
        const confidence = avgConfidence + (Math.random() - 0.5) * 0.3;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0
            ]}
          >
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial
              color="#4f46e5"
              emissive="#4f46e5"
              emissiveIntensity={confidence * 0.5}
            />
          </mesh>
        );
      })}

      {/* Central processing node */}
      <mesh>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={avgConfidence * 0.6}
        />
      </mesh>
    </group>
  );
}

function InterventionRecommendations({
  predictions,
  healthTwin
}: {
  predictions: HealthPrediction[];
  healthTwin: HealthTwin;
}) {
  const interventions = [
    { name: 'Exercise', impact: 0.8, urgency: 'medium', position: [-4, 1, 2] },
    { name: 'Diet', impact: 0.7, urgency: 'high', position: [-4, 0, 2] },
    { name: 'Medication', impact: 0.9, urgency: 'high', position: [-4, -1, 2] },
    { name: 'Monitoring', impact: 0.6, urgency: 'low', position: [-4, -2, 2] }
  ];

  return (
    <group>
      {interventions.map((intervention, index) => (
        <InterventionNode
          key={intervention.name}
          intervention={intervention}
          index={index}
        />
      ))}
    </group>
  );
}

function InterventionNode({
  intervention,
  index
}: {
  intervention: any;
  index: number
}) {
  const nodeRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (nodeRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.1;
      nodeRef.current.scale.setScalar(pulse);
    }
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <group position={intervention.position}>
      <mesh
        ref={nodeRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial
          color={getUrgencyColor(intervention.urgency)}
          emissive={getUrgencyColor(intervention.urgency)}
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
      </mesh>

      {hovered && (
        <Html>
          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded text-xs">
            <div className="font-semibold">{intervention.name}</div>
            <div>Impact: {(intervention.impact * 100).toFixed(0)}%</div>
            <div>Urgency: {intervention.urgency}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Helper functions
function calculateCurrentHealthScore(healthTwin: HealthTwin): number {
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

function getRiskTrend(healthTwin: HealthTwin): 'improving' | 'stable' | 'worsening' {
  // Analyze recent trends in health data
  const recentSymptoms = healthTwin.healthHistory.symptoms.recent.length;
  const riskLevel = healthTwin.riskProfile.overall;

  if (riskLevel === 'low' && recentSymptoms === 0) return 'stable';
  if (riskLevel === 'critical' || recentSymptoms > 5) return 'worsening';
  if (riskLevel === 'medium' && recentSymptoms < 2) return 'improving';

  return 'stable';
}

function generateRiskFactors(healthTwin: HealthTwin, timepoint: number): string[] {
  const baseFactors = ['Age progression', 'Lifestyle factors', 'Environmental exposure'];

  if (timepoint > 12) {
    baseFactors.push('Long-term health decline');
  }

  if (healthTwin.basicInfo.chronicConditions.length > 0) {
    baseFactors.push('Chronic condition progression');
  }

  return baseFactors;
}

function generateInterventions(healthTwin: HealthTwin, predictedScore: number): string[] {
  const interventions = [];

  if (predictedScore < 70) {
    interventions.push('Immediate medical consultation');
    interventions.push('Lifestyle modification program');
  }

  if (predictedScore < 50) {
    interventions.push('Intensive monitoring');
    interventions.push('Medication adjustment');
  }

  interventions.push('Regular health screenings');
  interventions.push('Preventive care measures');

  return interventions;
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'low': return '#22c55e';
    case 'medium': return '#eab308';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#6b7280';
  }
}

function getFactorColor(factor: string): string {
  const colors = {
    'Age': '#8b5cf6',
    'Lifestyle': '#06d6a0',
    'Genetics': '#f72585',
    'Environment': '#4cc9f0',
    'Chronic Conditions': '#f77f00'
  };
  return colors[factor as keyof typeof colors] || '#6b7280';
}

export const PredictiveHealthViz3D: React.FC<PredictiveHealthViz3DProps> = ({
  healthTwin,
  predictionTimeframe
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(predictionTimeframe);

  return (
    <div className="w-full h-96 relative bg-gradient-to-b from-purple-900 to-black rounded-lg overflow-hidden">
      <Canvas camera={{ position: [6, 4, 6], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />

        <PredictiveSystem
          healthTwin={healthTwin}
          predictionTimeframe={selectedTimeframe}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          maxDistance={12}
          minDistance={3}
          autoRotate={false}
        />
      </Canvas>

      {/* Timeframe selector */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Prediction Timeframe</h3>
        <div className="flex space-x-2">
          {[
            { key: '1m', label: '1 Month' },
            { key: '3m', label: '3 Months' },
            { key: '6m', label: '6 Months' },
            { key: '1y', label: '1 Year' },
            { key: '5y', label: '5 Years' }
          ].map((timeframe) => (
            <button
              key={timeframe.key}
              onClick={() => setSelectedTimeframe(timeframe.key as any)}
              className={`px-2 py-1 text-xs rounded ${selectedTimeframe === timeframe.key
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI insights panel */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">AI Insights</h3>
        <div className="space-y-1 text-xs">
          <div>🧠 Neural network confidence: 87%</div>
          <div>📈 Health trajectory: Stable</div>
          <div>⚠️ Key risk factors: 3 identified</div>
          <div>💡 Interventions: 4 recommended</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Visualization Guide</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-blue-500"></div>
            <span>Health Trajectory</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Risk Factors</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Interventions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>AI Confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
};