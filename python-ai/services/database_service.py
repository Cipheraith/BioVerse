"""
Database Service for BioVerse Python AI
Handles database connections and operations
"""

import asyncio
import asyncpg
import os
from typing import Dict, List, Any, Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

from .base_service import BaseService

class DatabaseService(BaseService):
    """Service for database operations"""
    
    def __init__(self):
        super().__init__("DatabaseService")
        self.database_url = os.getenv("DATABASE_URL")
        self.engine = None
        self.session_factory = None
        self.is_connected = False
        
    async def initialize(self):
        """Initialize database connection"""
        try:
            if not self.database_url:
                self.logger.warning("No database URL provided. Using fallback connection.")
                # Construct URL from individual components
                db_host = os.getenv("DB_HOST", "localhost")
                db_port = os.getenv("DB_PORT", "5432")
                db_name = os.getenv("DB_NAME", "bioverse_zambia_db")
                db_user = os.getenv("DB_USER", "bioverse_admin")
                db_password = os.getenv("DB_PASSWORD", "")
                
                self.database_url = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
            
            # Create async engine
            self.engine = create_async_engine(
                self.database_url,
                echo=False,  # Set to True for SQL debugging
                pool_size=10,
                max_overflow=20
            )
            
            # Create session factory
            self.session_factory = sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Test connection
            await self._test_connection()
            
            self.is_connected = True
            self.logger.info("Database service initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize database service: {e}")
            self.is_connected = False
            raise
    
    async def _test_connection(self):
        """Test database connection"""
        try:
            async with self.engine.begin() as conn:
                result = await conn.execute(text("SELECT 1"))
                # Properly handle the result
                row = result.first()
                if row:
                    self.logger.info("Database connection test successful")
                else:
                    raise Exception("No result returned from test query")
        except Exception as e:
            self.logger.error(f"Database connection test failed: {e}")
            # Don't raise the error, just log it and continue without database
            self.is_connected = False
    
    async def get_session(self) -> AsyncSession:
        """Get database session"""
        if not self.session_factory:
            raise Exception("Database not initialized")
        return self.session_factory()
    
    async def execute_query(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Execute a query and return results"""
        try:
            async with self.get_session() as session:
                result = await session.execute(text(query), params or {})
                rows = result.fetchall()
                
                # Convert to list of dictionaries
                columns = result.keys()
                return [dict(zip(columns, row)) for row in rows]
                
        except Exception as e:
            self.logger.error(f"Error executing query: {e}")
            raise
    
    async def get_patient_data(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Get patient data from database"""
        try:
            query = """
            SELECT p.*, 
                   array_agg(DISTINCT mh.condition) as medical_history,
                   array_agg(DISTINCT m.name) as medications
            FROM patients p
            LEFT JOIN medical_history mh ON p.id = mh.patient_id
            LEFT JOIN medications m ON p.id = m.patient_id
            WHERE p.id = :patient_id
            GROUP BY p.id
            """
            
            results = await self.execute_query(query, {"patient_id": patient_id})
            
            if results:
                return results[0]
            return None
            
        except Exception as e:
            self.logger.error(f"Error getting patient data: {e}")
            return None
    
    async def save_health_twin(self, health_twin_data: Dict[str, Any]) -> bool:
        """Save health twin data to database"""
        try:
            query = """
            INSERT INTO health_twins (
                id, patient_id, health_score, risk_factors, 
                predictions, recommendations, ai_insights, 
                visualization_data, created_at, updated_at
            ) VALUES (
                :id, :patient_id, :health_score, :risk_factors,
                :predictions, :recommendations, :ai_insights,
                :visualization_data, NOW(), NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                health_score = EXCLUDED.health_score,
                risk_factors = EXCLUDED.risk_factors,
                predictions = EXCLUDED.predictions,
                recommendations = EXCLUDED.recommendations,
                ai_insights = EXCLUDED.ai_insights,
                visualization_data = EXCLUDED.visualization_data,
                updated_at = NOW()
            """
            
            await self.execute_query(query, health_twin_data)
            return True
            
        except Exception as e:
            self.logger.error(f"Error saving health twin: {e}")
            return False
    
    async def get_health_twin(self, twin_id: str) -> Optional[Dict[str, Any]]:
        """Get health twin from database"""
        try:
            query = "SELECT * FROM health_twins WHERE id = :twin_id"
            results = await self.execute_query(query, {"twin_id": twin_id})
            
            if results:
                return results[0]
            return None
            
        except Exception as e:
            self.logger.error(f"Error getting health twin: {e}")
            return None
    
    async def get_patient_vitals_history(self, patient_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get patient vitals history"""
        try:
            query = """
            SELECT * FROM vitals 
            WHERE patient_id = :patient_id 
            AND recorded_at >= NOW() - INTERVAL '%s days'
            ORDER BY recorded_at DESC
            """ % days
            
            return await self.execute_query(query, {"patient_id": patient_id})
            
        except Exception as e:
            self.logger.error(f"Error getting vitals history: {e}")
            return []
    
    async def close(self):
        """Close database connections"""
        if self.engine:
            await self.engine.dispose()
        self.is_connected = False
        self.logger.info("Database service closed")