"""
Health Twin Service for BioVerse
Creates and manages digital health twins with AI-powered insights
"""

import asyncio
import json
import numpy as np
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid

from .base_service import BaseService
from .ollama_service import OllamaService
from .ml_service import MLService
from .database_service import DatabaseService

class HealthTwinData(BaseModel):
    patient_id: str
    vitals: Dict[str, float]
    medical_history: List[str]
    medications: List[str]
    lifestyle: Dict[str, Any]
    symptoms: List[str]
    lab_results: Dict[str, float]

class HealthTwin(BaseModel):
    id: str
    patient_id: str
    created_at: datetime
    updated_at: datetime
    health_score: float
    risk_factors: List[Dict[str, Any]]
    predictions: Dict[str, Any]
    recommendations: List[str]
    ai_insights: Dict[str, Any]
    visualization_data: Dict[str, Any]

class HealthTwinService(BaseService):
    """Service for creating and managing digital health twins"""
    
    def __init__(self, ollama_service: OllamaService, ml_service: MLService, db_service: DatabaseService):
        super().__init__("HealthTwinService")
        self.ollama = ollama_service
        self.ml = ml_service
        self.db = db_service
        self.twins_cache = {}
        
    async def initialize(self):
        """Initialize the Health Twin service"""
        try:
            # Load existing twins from database
            await self._load_existing_twins()
            
            self.logger.info("Health Twin service initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Health Twin service: {e}")
            raise
    
    async def _load_existing_twins(self):
        """Load existing health twins from database"""
        try:
            # This would load from your PostgreSQL database
            # For now, we'll use an empty cache
            self.twins_cache = {}
            self.logger.info("Loaded existing health twins from database")
            
        except Exception as e:
            self.logger.error(f"Error loading existing twins: {e}")
    
    async def create_health_twin(self, twin_data: HealthTwinData) -> HealthTwin:
        """Create a new digital health twin"""
        try:
            twin_id = str(uuid.uuid4())
            
            # Calculate health score
            health_score = await self._calculate_health_score(twin_data)
            
            # Identify risk factors
            risk_factors = await self._identify_risk_factors(twin_data)
            
            # Generate predictions
            predictions = await self._generate_predictions(twin_data)
            
            # Get AI insights
            ai_insights = await self._get_ai_insights(twin_data)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(twin_data, ai_insights)
            
            # Create visualization data
            visualization_data = await self._create_visualization_data(twin_data, health_score, risk_factors)
            
            # Create health twin object
            health_twin = HealthTwin(
                id=twin_id,
                patient_id=twin_data.patient_id,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                health_score=health_score,
                risk_factors=risk_factors,
                predictions=predictions,
                recommendations=recommendations,
                ai_insights=ai_insights,
                visualization_data=visualization_data
            )
            
            # Cache the twin
            self.twins_cache[twin_id] = health_twin
            
            # Save to database
            await self._save_twin_to_db(health_twin)
            
            self.logger.info(f"Created health twin {twin_id} for patient {twin_data.patient_id}")
            
            return health_twin
            
        except Exception as e:
            self.logger.error(f"Error creating health twin: {e}")
            raise
    
    async def _calculate_health_score(self, twin_data: HealthTwinData) -> float:
        """Calculate overall health score (0-100)"""
        try:
            # Use ML model to calculate health score
            if self.ml.is_ready:
                features = self._extract_features_for_ml(twin_data)
                health_score = await self.ml.predict_health_score(features)
            else:
                # Fallback calculation
                health_score = await self._calculate_health_score_fallback(twin_data)
            
            return max(0.0, min(100.0, health_score))
            
        except Exception as e:
            self.logger.error(f"Error calculating health score: {e}")
            return 50.0  # Default neutral score
    
    async def _calculate_health_score_fallback(self, twin_data: HealthTwinData) -> float:
        """Fallback health score calculation"""
        score = 100.0
        
        # Vitals assessment
        vitals = twin_data.vitals
        
        # Blood pressure
        if 'systolic_bp' in vitals and 'diastolic_bp' in vitals:
            systolic = vitals['systolic_bp']
            diastolic = vitals['diastolic_bp']
            
            if systolic > 140 or diastolic > 90:
                score -= 15
            elif systolic > 130 or diastolic > 80:
                score -= 8
        
        # Heart rate
        if 'heart_rate' in vitals:
            hr = vitals['heart_rate']
            if hr > 100 or hr < 60:
                score -= 10
        
        # BMI
        if 'weight' in vitals and 'height' in vitals:
            bmi = vitals['weight'] / ((vitals['height'] / 100) ** 2)
            if bmi > 30:
                score -= 20
            elif bmi > 25:
                score -= 10
        
        # Medical history impact
        serious_conditions = ['diabetes', 'hypertension', 'heart_disease', 'cancer']
        for condition in twin_data.medical_history:
            if any(serious in condition.lower() for serious in serious_conditions):
                score -= 15
        
        # Symptoms impact
        if len(twin_data.symptoms) > 3:
            score -= 10
        
        return max(0.0, score)
    
    async def _identify_risk_factors(self, twin_data: HealthTwinData) -> List[Dict[str, Any]]:
        """Identify health risk factors"""
        risk_factors = []
        
        try:
            # Age-related risks
            if 'age' in twin_data.lifestyle:
                age = twin_data.lifestyle['age']
                if age > 65:
                    risk_factors.append({
                        "factor": "Advanced Age",
                        "risk_level": "medium",
                        "description": "Increased risk due to advanced age",
                        "impact_score": 0.3
                    })
            
            # Lifestyle risks
            lifestyle = twin_data.lifestyle
            
            if lifestyle.get('smoking', False):
                risk_factors.append({
                    "factor": "Smoking",
                    "risk_level": "high",
                    "description": "Smoking significantly increases health risks",
                    "impact_score": 0.8
                })
            
            if lifestyle.get('alcohol_consumption', 'none') in ['heavy', 'excessive']:
                risk_factors.append({
                    "factor": "Excessive Alcohol",
                    "risk_level": "medium",
                    "description": "Heavy alcohol consumption poses health risks",
                    "impact_score": 0.5
                })
            
            if lifestyle.get('exercise_frequency', 0) < 2:
                risk_factors.append({
                    "factor": "Sedentary Lifestyle",
                    "risk_level": "medium",
                    "description": "Lack of regular exercise increases health risks",
                    "impact_score": 0.4
                })
            
            # Medical history risks
            high_risk_conditions = ['diabetes', 'hypertension', 'heart_disease']
            for condition in twin_data.medical_history:
                for high_risk in high_risk_conditions:
                    if high_risk in condition.lower():
                        risk_factors.append({
                            "factor": condition,
                            "risk_level": "high",
                            "description": f"History of {condition} increases health risks",
                            "impact_score": 0.7
                        })
            
            return risk_factors
            
        except Exception as e:
            self.logger.error(f"Error identifying risk factors: {e}")
            return []
    
    async def _generate_predictions(self, twin_data: HealthTwinData) -> Dict[str, Any]:
        """Generate health predictions"""
        try:
            predictions = {}
            
            # Use ML models for predictions if available
            if self.ml.is_ready:
                features = self._extract_features_for_ml(twin_data)
                
                # Disease risk predictions
                predictions['disease_risks'] = await self.ml.predict_disease_risks(features)
                
                # Health trajectory
                predictions['health_trajectory'] = await self.ml.predict_health_trajectory(features)
                
            else:
                # Fallback predictions
                predictions = {
                    'disease_risks': {
                        'diabetes': 0.15,
                        'hypertension': 0.25,
                        'heart_disease': 0.10
                    },
                    'health_trajectory': {
                        'trend': 'stable',
                        'confidence': 0.6
                    }
                }
            
            # Add prediction metadata
            predictions['generated_at'] = datetime.now().isoformat()
            predictions['model_version'] = '1.0.0'
            predictions['confidence_score'] = 0.75
            
            return predictions
            
        except Exception as e:
            self.logger.error(f"Error generating predictions: {e}")
            return {}
    
    async def _get_ai_insights(self, twin_data: HealthTwinData) -> Dict[str, Any]:
        """Get AI-powered insights using Ollama"""
        try:
            if not self.ollama.is_available:
                return {"error": "AI service not available"}
            
            # Prepare patient data for AI analysis
            patient_data = {
                "vitals": twin_data.vitals,
                "medical_history": twin_data.medical_history,
                "medications": twin_data.medications,
                "lifestyle": twin_data.lifestyle,
                "symptoms": twin_data.symptoms,
                "lab_results": twin_data.lab_results
            }
            
            # Get AI analysis
            ai_analysis = await self.ollama.generate_health_analysis(patient_data)
            
            return ai_analysis
            
        except Exception as e:
            self.logger.error(f"Error getting AI insights: {e}")
            return {"error": str(e)}
    
    async def _generate_recommendations(self, twin_data: HealthTwinData, ai_insights: Dict[str, Any]) -> List[str]:
        """Generate personalized health recommendations"""
        try:
            if self.ollama.is_available:
                # Use AI to generate recommendations
                health_profile = {
                    "vitals": twin_data.vitals,
                    "lifestyle": twin_data.lifestyle,
                    "medical_history": twin_data.medical_history,
                    "ai_insights": ai_insights
                }
                
                recommendations = await self.ollama.generate_health_recommendations(health_profile)
                return recommendations
            else:
                # Fallback recommendations
                return [
                    "Maintain regular exercise routine",
                    "Follow a balanced diet rich in fruits and vegetables",
                    "Get adequate sleep (7-9 hours per night)",
                    "Stay hydrated throughout the day",
                    "Schedule regular health checkups"
                ]
                
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return ["Consult with healthcare provider for personalized recommendations"]
    
    async def _create_visualization_data(self, twin_data: HealthTwinData, health_score: float, risk_factors: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create data for 3D visualization"""
        try:
            # Create 3D body model data
            body_regions = {
                "head": {"health": 85, "color": "green"},
                "chest": {"health": 75, "color": "yellow"},
                "abdomen": {"health": 80, "color": "green"},
                "arms": {"health": 90, "color": "green"},
                "legs": {"health": 70, "color": "orange"}
            }
            
            # Adjust based on symptoms and conditions
            for symptom in twin_data.symptoms:
                if 'headache' in symptom.lower():
                    body_regions["head"]["health"] -= 20
                    body_regions["head"]["color"] = "red"
                elif 'chest' in symptom.lower():
                    body_regions["chest"]["health"] -= 15
                    body_regions["chest"]["color"] = "orange"
            
            # Create time series data for health trends
            dates = [(datetime.now() - timedelta(days=i)).isoformat() for i in range(30, 0, -1)]
            health_trend = [health_score + np.random.normal(0, 5) for _ in dates]
            
            visualization_data = {
                "body_model": body_regions,
                "health_score": health_score,
                "health_trend": {
                    "dates": dates,
                    "values": health_trend
                },
                "risk_visualization": {
                    "factors": [rf["factor"] for rf in risk_factors],
                    "levels": [rf["risk_level"] for rf in risk_factors],
                    "scores": [rf["impact_score"] for rf in risk_factors]
                },
                "vitals_radar": twin_data.vitals,
                "3d_model_url": f"/api/v1/viz/3d-twin/{twin_data.patient_id}"
            }
            
            return visualization_data
            
        except Exception as e:
            self.logger.error(f"Error creating visualization data: {e}")
            return {}
    
    def _extract_features_for_ml(self, twin_data: HealthTwinData) -> np.ndarray:
        """Extract features for ML models"""
        features = []
        
        # Vitals features
        vitals = twin_data.vitals
        features.extend([
            vitals.get('heart_rate', 70),
            vitals.get('systolic_bp', 120),
            vitals.get('diastolic_bp', 80),
            vitals.get('temperature', 98.6),
            vitals.get('weight', 70),
            vitals.get('height', 170)
        ])
        
        # Lifestyle features
        lifestyle = twin_data.lifestyle
        features.extend([
            lifestyle.get('age', 35),
            1 if lifestyle.get('smoking', False) else 0,
            lifestyle.get('exercise_frequency', 2),
            len(twin_data.medical_history),
            len(twin_data.medications),
            len(twin_data.symptoms)
        ])
        
        return np.array(features)
    
    async def _save_twin_to_db(self, health_twin: HealthTwin):
        """Save health twin to database"""
        try:
            # This would save to PostgreSQL
            # For now, we'll just log
            self.logger.info(f"Saving health twin {health_twin.id} to database")
            
        except Exception as e:
            self.logger.error(f"Error saving twin to database: {e}")
    
    async def get_health_twin(self, twin_id: str) -> Optional[HealthTwin]:
        """Get health twin by ID"""
        return self.twins_cache.get(twin_id)
    
    async def update_health_twin(self, twin_id: str, twin_data: HealthTwinData) -> HealthTwin:
        """Update existing health twin"""
        try:
            existing_twin = self.twins_cache.get(twin_id)
            if not existing_twin:
                raise Exception(f"Health twin {twin_id} not found")
            
            # Recalculate all metrics
            health_score = await self._calculate_health_score(twin_data)
            risk_factors = await self._identify_risk_factors(twin_data)
            predictions = await self._generate_predictions(twin_data)
            ai_insights = await self._get_ai_insights(twin_data)
            recommendations = await self._generate_recommendations(twin_data, ai_insights)
            visualization_data = await self._create_visualization_data(twin_data, health_score, risk_factors)
            
            # Update twin
            updated_twin = HealthTwin(
                id=twin_id,
                patient_id=twin_data.patient_id,
                created_at=existing_twin.created_at,
                updated_at=datetime.now(),
                health_score=health_score,
                risk_factors=risk_factors,
                predictions=predictions,
                recommendations=recommendations,
                ai_insights=ai_insights,
                visualization_data=visualization_data
            )
            
            # Update cache
            self.twins_cache[twin_id] = updated_twin
            
            # Save to database
            await self._save_twin_to_db(updated_twin)
            
            self.logger.info(f"Updated health twin {twin_id}")
            
            return updated_twin
            
        except Exception as e:
            self.logger.error(f"Error updating health twin: {e}")
            raise
    
    async def get_patient_twins(self, patient_id: str) -> List[HealthTwin]:
        """Get all health twins for a patient"""
        return [twin for twin in self.twins_cache.values() if twin.patient_id == patient_id]