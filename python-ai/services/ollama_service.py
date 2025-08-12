"""
Ollama Service for BioVerse
Handles local AI model interactions through Ollama
"""

import asyncio
import json
import httpx
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
import os
from .base_service import BaseService

class OllamaRequest(BaseModel):
    model: str
    prompt: str
    stream: bool = False
    options: Optional[Dict[str, Any]] = None

class OllamaResponse(BaseModel):
    model: str
    response: str
    done: bool
    context: Optional[List[int]] = None

class OllamaService(BaseService):
    """Service for interacting with Ollama local AI models"""
    
    def __init__(self):
        super().__init__("OllamaService")
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.default_model = os.getenv("OLLAMA_MODEL", "deepseek-r1:1.5b")
        self.embedding_model = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
        self.vision_model = os.getenv("OLLAMA_VISION_MODEL", "llava:7b")
        self.client = None
        self.is_available = False
        self.available_models = []
        
    async def initialize(self):
        """Initialize the Ollama service"""
        try:
            self.client = httpx.AsyncClient(timeout=30.0)
            
            # Check if Ollama is running
            await self._check_availability()
            
            if self.is_available:
                # Get available models
                await self._load_available_models()
                
                # Ensure required models are available
                await self._ensure_models()
                
            self.logger.info(f"Ollama service initialized. Available: {self.is_available}")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Ollama service: {e}")
            self.is_available = False
    
    async def _check_availability(self):
        """Check if Ollama service is available"""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            self.is_available = response.status_code == 200
        except Exception as e:
            self.logger.warning(f"Ollama not available: {e}")
            self.is_available = False
    
    async def _load_available_models(self):
        """Load list of available models"""
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                self.available_models = [model["name"] for model in data.get("models", [])]
                self.logger.info(f"Available models: {self.available_models}")
        except Exception as e:
            self.logger.error(f"Failed to load available models: {e}")
    
    async def _ensure_models(self):
        """Ensure required models are available"""
        required_models = [self.default_model, self.embedding_model]
        
        for model in required_models:
            if model not in self.available_models:
                self.logger.info(f"Pulling required model: {model}")
                await self._pull_model(model)
    
    async def _pull_model(self, model_name: str):
        """Pull a model from Ollama registry"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/pull",
                json={"name": model_name},
                timeout=300.0  # 5 minutes for model download
            )
            
            if response.status_code == 200:
                self.logger.info(f"Successfully pulled model: {model_name}")
                self.available_models.append(model_name)
            else:
                self.logger.error(f"Failed to pull model {model_name}: {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error pulling model {model_name}: {e}")
    
    async def generate_text(self, prompt: str, model: Optional[str] = None, **kwargs) -> str:
        """Generate text using Ollama model"""
        if not self.is_available:
            raise Exception("Ollama service not available")
        
        model = model or self.default_model
        
        try:
            request_data = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": kwargs
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json=request_data,
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error generating text: {e}")
            raise
    
    async def generate_health_analysis(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate health analysis using AI"""
        prompt = f"""
        As a medical AI assistant, analyze the following patient data and provide insights:
        
        Patient Data:
        {json.dumps(patient_data, indent=2)}
        
        Please provide:
        1. Health risk assessment
        2. Potential concerns
        3. Recommendations
        4. Preventive measures
        
        Format your response as JSON with the following structure:
        {{
            "risk_level": "low|medium|high",
            "risk_score": 0-100,
            "concerns": ["concern1", "concern2"],
            "recommendations": ["rec1", "rec2"],
            "preventive_measures": ["measure1", "measure2"],
            "summary": "Brief summary"
        }}
        """
        
        try:
            response = await self.generate_text(prompt, temperature=0.3, top_p=0.9)
            
            # Try to parse JSON response
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                # If not valid JSON, return structured response
                return {
                    "risk_level": "medium",
                    "risk_score": 50,
                    "concerns": ["Unable to parse detailed analysis"],
                    "recommendations": ["Consult healthcare provider"],
                    "preventive_measures": ["Regular health checkups"],
                    "summary": response[:200] + "..." if len(response) > 200 else response
                }
                
        except Exception as e:
            self.logger.error(f"Error generating health analysis: {e}")
            raise
    
    async def generate_embeddings(self, text: str, model: Optional[str] = None) -> List[float]:
        """Generate embeddings for text"""
        if not self.is_available:
            raise Exception("Ollama service not available")
        
        model = model or self.embedding_model
        
        try:
            response = await self.client.post(
                f"{self.base_url}/api/embeddings",
                json={
                    "model": model,
                    "prompt": text
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("embedding", [])
            else:
                raise Exception(f"Ollama embeddings error: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"Error generating embeddings: {e}")
            raise
    
    async def analyze_symptoms(self, symptoms: List[str]) -> Dict[str, Any]:
        """Analyze symptoms and provide potential diagnoses"""
        symptoms_text = ", ".join(symptoms)
        
        prompt = f"""
        Analyze these symptoms and provide potential medical insights:
        Symptoms: {symptoms_text}
        
        Provide a JSON response with:
        {{
            "potential_conditions": ["condition1", "condition2"],
            "urgency_level": "low|medium|high|emergency",
            "recommended_actions": ["action1", "action2"],
            "specialist_referral": "specialist_type or null",
            "confidence": 0-100
        }}
        
        Important: This is for informational purposes only and not a substitute for professional medical advice.
        """
        
        try:
            response = await self.generate_text(prompt, temperature=0.2)
            
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {
                    "potential_conditions": ["Analysis unavailable"],
                    "urgency_level": "medium",
                    "recommended_actions": ["Consult healthcare provider"],
                    "specialist_referral": None,
                    "confidence": 50
                }
                
        except Exception as e:
            self.logger.error(f"Error analyzing symptoms: {e}")
            raise
    
    async def generate_health_recommendations(self, health_profile: Dict[str, Any]) -> List[str]:
        """Generate personalized health recommendations"""
        prompt = f"""
        Based on this health profile, provide 5 personalized health recommendations:
        
        Health Profile:
        {json.dumps(health_profile, indent=2)}
        
        Provide practical, actionable recommendations as a JSON array:
        ["recommendation1", "recommendation2", "recommendation3", "recommendation4", "recommendation5"]
        """
        
        try:
            response = await self.generate_text(prompt, temperature=0.4)
            
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                # Return default recommendations if parsing fails
                return [
                    "Maintain regular exercise routine",
                    "Follow a balanced diet",
                    "Get adequate sleep (7-9 hours)",
                    "Stay hydrated",
                    "Schedule regular health checkups"
                ]
                
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            raise
    
    async def luma_chat(self, message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Luma AI health assistant chat using Ollama"""
        if not self.is_available:
            return {
                "response": f"Hello! I'm Luma, your AI health assistant. You asked: '{message}'. I'm currently running in offline mode, but I can still provide basic health guidance. Always consult healthcare professionals for medical advice.",
                "confidence": 0.7,
                "model_used": "fallback"
            }
        
        try:
            luma_prompt = f"""You are Luma, BioVerse's friendly health AI assistant. Provide helpful, accurate health information while being empathetic. Always recommend consulting healthcare professionals for serious concerns.

User asked: "{message}"

Respond as Luma with helpful health guidance."""

            response_text = await self.generate_text(
                luma_prompt,
                temperature=0.7,
                top_p=0.9
            )
            
            return {
                "response": response_text.strip(),
                "confidence": 0.9,
                "model_used": self.default_model
            }
            
        except Exception as e:
            self.logger.error(f"Error in Luma chat: {e}")
            return {
                "response": f"I'm sorry, I'm having trouble right now. Regarding '{message}', I'd recommend consulting with a healthcare professional.",
                "confidence": 0.5,
                "model_used": "error_fallback"
            }

    async def close(self):
        """Close the Ollama service"""
        if self.client:
            await self.client.aclose()
        self.logger.info("Ollama service closed")