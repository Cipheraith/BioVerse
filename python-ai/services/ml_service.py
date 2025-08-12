"""
Machine Learning Service for BioVerse
Handles ML models for health predictions and analytics
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
import joblib
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio

from .base_service import BaseService

class MLService(BaseService):
    """Service for machine learning models and predictions"""
    
    def __init__(self):
        super().__init__("MLService")
        self.models = {}
        self.scalers = {}
        self.is_ready = False
        self.model_path = os.getenv("ML_MODEL_PATH", "./models")
        
        # Ensure model directory exists
        os.makedirs(self.model_path, exist_ok=True)
        
    async def initialize(self):
        """Initialize ML service and load/train models"""
        try:
            # Load or train models
            await self._load_or_train_models()
            
            self.is_ready = True
            self.logger.info("ML service initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize ML service: {e}")
            self.is_ready = False
            raise
    
    async def _load_or_train_models(self):
        """Load existing models or train new ones"""
        try:
            # Try to load existing models
            if await self._load_existing_models():
                self.logger.info("Loaded existing ML models")
            else:
                # Train new models with synthetic data
                self.logger.info("Training new ML models...")
                await self._train_models()
                await self._save_models()
                
        except Exception as e:
            self.logger.error(f"Error loading/training models: {e}")
            raise
    
    async def _load_existing_models(self) -> bool:
        """Load existing models from disk"""
        try:
            model_files = {
                'health_score': 'health_score_model.joblib',
                'disease_risk': 'disease_risk_model.joblib',
                'health_trajectory': 'health_trajectory_model.joblib'
            }
            
            scaler_files = {
                'health_score': 'health_score_scaler.joblib',
                'disease_risk': 'disease_risk_scaler.joblib',
                'health_trajectory': 'health_trajectory_scaler.joblib'
            }
            
            # Check if all model files exist
            for model_name, filename in model_files.items():
                model_path = os.path.join(self.model_path, filename)
                scaler_path = os.path.join(self.model_path, scaler_files[model_name])
                
                if not os.path.exists(model_path) or not os.path.exists(scaler_path):
                    return False
            
            # Load models and scalers
            for model_name, filename in model_files.items():
                model_path = os.path.join(self.model_path, filename)
                scaler_path = os.path.join(self.model_path, scaler_files[model_name])
                
                self.models[model_name] = joblib.load(model_path)
                self.scalers[model_name] = joblib.load(scaler_path)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error loading existing models: {e}")
            return False
    
    async def _train_models(self):
        """Train ML models with synthetic data"""
        try:
            # Generate synthetic training data
            training_data = await self._generate_synthetic_data(1000)
            
            # Train health score prediction model
            await self._train_health_score_model(training_data)
            
            # Train disease risk prediction model
            await self._train_disease_risk_model(training_data)
            
            # Train health trajectory model
            await self._train_health_trajectory_model(training_data)
            
            self.logger.info("Successfully trained all ML models")
            
        except Exception as e:
            self.logger.error(f"Error training models: {e}")
            raise
    
    async def _generate_synthetic_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic health data for training"""
        np.random.seed(42)  # For reproducibility
        
        data = {
            'age': np.random.normal(45, 15, n_samples),
            'heart_rate': np.random.normal(72, 12, n_samples),
            'systolic_bp': np.random.normal(120, 20, n_samples),
            'diastolic_bp': np.random.normal(80, 10, n_samples),
            'temperature': np.random.normal(98.6, 1, n_samples),
            'weight': np.random.normal(70, 15, n_samples),
            'height': np.random.normal(170, 10, n_samples),
            'smoking': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
            'exercise_frequency': np.random.poisson(3, n_samples),
            'medical_history_count': np.random.poisson(1, n_samples),
            'medication_count': np.random.poisson(2, n_samples),
            'symptom_count': np.random.poisson(1, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Calculate BMI
        df['bmi'] = df['weight'] / ((df['height'] / 100) ** 2)
        
        # Generate target variables
        # Health score (0-100)
        df['health_score'] = (
            100 
            - (df['age'] - 30) * 0.5
            - df['smoking'] * 20
            - np.maximum(0, df['bmi'] - 25) * 2
            - df['medical_history_count'] * 10
            - df['symptom_count'] * 5
            + df['exercise_frequency'] * 3
            + np.random.normal(0, 5, n_samples)
        )
        df['health_score'] = np.clip(df['health_score'], 0, 100)
        
        # Disease risks
        df['diabetes_risk'] = (
            (df['age'] > 45).astype(int) * 0.3 +
            (df['bmi'] > 30).astype(int) * 0.4 +
            df['smoking'] * 0.2 +
            np.random.normal(0, 0.1, n_samples)
        )
        df['diabetes_risk'] = np.clip(df['diabetes_risk'], 0, 1)
        
        df['hypertension_risk'] = (
            (df['systolic_bp'] > 130).astype(int) * 0.5 +
            (df['age'] > 50).astype(int) * 0.3 +
            df['smoking'] * 0.2 +
            np.random.normal(0, 0.1, n_samples)
        )
        df['hypertension_risk'] = np.clip(df['hypertension_risk'], 0, 1)
        
        # Health trajectory (improving=1, stable=0, declining=-1)
        df['health_trajectory'] = np.random.choice(
            [-1, 0, 1], 
            n_samples, 
            p=[0.2, 0.6, 0.2]
        )
        
        return df
    
    async def _train_health_score_model(self, data: pd.DataFrame):
        """Train health score prediction model"""
        features = [
            'age', 'heart_rate', 'systolic_bp', 'diastolic_bp', 
            'temperature', 'weight', 'height', 'bmi', 'smoking',
            'exercise_frequency', 'medical_history_count', 
            'medication_count', 'symptom_count'
        ]
        
        X = data[features]
        y = data['health_score']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        
        self.logger.info(f"Health score model MSE: {mse:.2f}")
        
        # Store model and scaler
        self.models['health_score'] = model
        self.scalers['health_score'] = scaler
    
    async def _train_disease_risk_model(self, data: pd.DataFrame):
        """Train disease risk prediction model"""
        features = [
            'age', 'heart_rate', 'systolic_bp', 'diastolic_bp',
            'bmi', 'smoking', 'exercise_frequency', 'medical_history_count'
        ]
        
        X = data[features]
        
        # Train separate models for different diseases
        diseases = ['diabetes_risk', 'hypertension_risk']
        
        for disease in diseases:
            y = data[disease]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            
            self.logger.info(f"{disease} model MSE: {mse:.4f}")
            
            # Store model and scaler
            self.models[f'disease_risk_{disease}'] = model
            self.scalers[f'disease_risk_{disease}'] = scaler
        
        # Store general disease risk model (using diabetes as example)
        self.models['disease_risk'] = self.models['disease_risk_diabetes_risk']
        self.scalers['disease_risk'] = self.scalers['disease_risk_diabetes_risk']
    
    async def _train_health_trajectory_model(self, data: pd.DataFrame):
        """Train health trajectory prediction model"""
        features = [
            'age', 'health_score', 'exercise_frequency', 'smoking',
            'medical_history_count', 'symptom_count'
        ]
        
        X = data[features]
        y = data['health_trajectory']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        self.logger.info(f"Health trajectory model accuracy: {accuracy:.2f}")
        
        # Store model and scaler
        self.models['health_trajectory'] = model
        self.scalers['health_trajectory'] = scaler
    
    async def _save_models(self):
        """Save trained models to disk"""
        try:
            for model_name, model in self.models.items():
                if model_name.startswith('disease_risk_'):
                    continue  # Skip individual disease models
                    
                model_path = os.path.join(self.model_path, f"{model_name}_model.joblib")
                scaler_path = os.path.join(self.model_path, f"{model_name}_scaler.joblib")
                
                joblib.dump(model, model_path)
                joblib.dump(self.scalers[model_name], scaler_path)
            
            self.logger.info("Successfully saved all models")
            
        except Exception as e:
            self.logger.error(f"Error saving models: {e}")
    
    async def predict_health_score(self, features: np.ndarray) -> float:
        """Predict health score from features"""
        try:
            if 'health_score' not in self.models:
                raise Exception("Health score model not available")
            
            # Ensure features have correct shape
            if len(features) != 13:  # Expected number of features
                raise Exception(f"Expected 13 features, got {len(features)}")
            
            # Scale features
            features_scaled = self.scalers['health_score'].transform([features])
            
            # Predict
            prediction = self.models['health_score'].predict(features_scaled)[0]
            
            return float(np.clip(prediction, 0, 100))
            
        except Exception as e:
            self.logger.error(f"Error predicting health score: {e}")
            return 50.0  # Default neutral score
    
    async def predict_disease_risks(self, features: np.ndarray) -> Dict[str, float]:
        """Predict disease risks"""
        try:
            risks = {}
            
            # Use subset of features for disease risk prediction
            disease_features = features[:8]  # First 8 features
            
            # Predict diabetes risk
            if 'disease_risk_diabetes_risk' in self.models:
                features_scaled = self.scalers['disease_risk_diabetes_risk'].transform([disease_features])
                diabetes_risk = self.models['disease_risk_diabetes_risk'].predict(features_scaled)[0]
                risks['diabetes'] = float(np.clip(diabetes_risk, 0, 1))
            
            # Predict hypertension risk
            if 'disease_risk_hypertension_risk' in self.models:
                features_scaled = self.scalers['disease_risk_hypertension_risk'].transform([disease_features])
                hypertension_risk = self.models['disease_risk_hypertension_risk'].predict(features_scaled)[0]
                risks['hypertension'] = float(np.clip(hypertension_risk, 0, 1))
            
            # Add other disease risks (placeholder)
            risks.update({
                'heart_disease': min(0.8, (risks.get('diabetes', 0) + risks.get('hypertension', 0)) / 2),
                'stroke': min(0.7, risks.get('hypertension', 0) * 0.8),
                'obesity': 0.3 if len(features) > 5 and features[5] > 80 else 0.1  # Based on weight
            })
            
            return risks
            
        except Exception as e:
            self.logger.error(f"Error predicting disease risks: {e}")
            return {
                'diabetes': 0.2,
                'hypertension': 0.3,
                'heart_disease': 0.15,
                'stroke': 0.1,
                'obesity': 0.25
            }
    
    async def predict_health_trajectory(self, features: np.ndarray) -> Dict[str, Any]:
        """Predict health trajectory"""
        try:
            if 'health_trajectory' not in self.models:
                return {
                    'trend': 'stable',
                    'confidence': 0.5,
                    'prediction': 0
                }
            
            # Use subset of features for trajectory prediction
            trajectory_features = [features[0], 50.0, features[6], features[7], features[9], features[11]]  # age, health_score, exercise, smoking, medical_history, symptoms
            
            # Scale features
            features_scaled = self.scalers['health_trajectory'].transform([trajectory_features])
            
            # Predict
            prediction = self.models['health_trajectory'].predict(features_scaled)[0]
            probabilities = self.models['health_trajectory'].predict_proba(features_scaled)[0]
            
            # Map prediction to trend
            trend_map = {-1: 'declining', 0: 'stable', 1: 'improving'}
            trend = trend_map.get(prediction, 'stable')
            
            # Get confidence (max probability)
            confidence = float(np.max(probabilities))
            
            return {
                'trend': trend,
                'confidence': confidence,
                'prediction': int(prediction),
                'probabilities': {
                    'declining': float(probabilities[0]),
                    'stable': float(probabilities[1]),
                    'improving': float(probabilities[2])
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error predicting health trajectory: {e}")
            return {
                'trend': 'stable',
                'confidence': 0.5,
                'prediction': 0
            }
    
    async def analyze_health_patterns(self, patient_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze health patterns from historical data"""
        try:
            if not patient_data:
                return {"error": "No data provided"}
            
            # Convert to DataFrame
            df = pd.DataFrame(patient_data)
            
            # Basic statistical analysis
            analysis = {
                'data_points': len(df),
                'date_range': {
                    'start': df['date'].min() if 'date' in df else None,
                    'end': df['date'].max() if 'date' in df else None
                },
                'trends': {},
                'anomalies': [],
                'insights': []
            }
            
            # Analyze trends for numeric columns
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            
            for column in numeric_columns:
                if column in df and len(df[column].dropna()) > 1:
                    values = df[column].dropna()
                    
                    # Calculate trend
                    if len(values) >= 2:
                        slope = np.polyfit(range(len(values)), values, 1)[0]
                        trend = 'increasing' if slope > 0.1 else 'decreasing' if slope < -0.1 else 'stable'
                    else:
                        trend = 'stable'
                    
                    analysis['trends'][column] = {
                        'trend': trend,
                        'slope': float(slope) if len(values) >= 2 else 0,
                        'mean': float(values.mean()),
                        'std': float(values.std()),
                        'min': float(values.min()),
                        'max': float(values.max())
                    }
                    
                    # Detect anomalies (values beyond 2 standard deviations)
                    if values.std() > 0:
                        z_scores = np.abs((values - values.mean()) / values.std())
                        anomaly_indices = np.where(z_scores > 2)[0]
                        
                        for idx in anomaly_indices:
                            analysis['anomalies'].append({
                                'column': column,
                                'value': float(values.iloc[idx]),
                                'z_score': float(z_scores[idx]),
                                'index': int(idx)
                            })
            
            # Generate insights
            if analysis['trends']:
                improving_metrics = [k for k, v in analysis['trends'].items() if v['trend'] == 'increasing']
                declining_metrics = [k for k, v in analysis['trends'].items() if v['trend'] == 'decreasing']
                
                if improving_metrics:
                    analysis['insights'].append(f"Improving trends in: {', '.join(improving_metrics)}")
                
                if declining_metrics:
                    analysis['insights'].append(f"Declining trends in: {', '.join(declining_metrics)}")
                
                if len(analysis['anomalies']) > 0:
                    analysis['insights'].append(f"Detected {len(analysis['anomalies'])} anomalous readings")
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing health patterns: {e}")
            return {"error": str(e)}
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            'is_ready': self.is_ready,
            'models_loaded': list(self.models.keys()),
            'model_path': self.model_path,
            'last_updated': datetime.now().isoformat()
        }