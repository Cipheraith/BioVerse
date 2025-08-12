"""
Base Service Class for BioVerse Python AI Services
"""

import logging
import structlog
from typing import Any, Dict, Optional

class BaseService:
    """Base class for all BioVerse services"""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = self._setup_logger()
        
    def _setup_logger(self) -> structlog.BoundLogger:
        """Set up structured logging for the service"""
        structlog.configure(
            processors=[
                structlog.stdlib.filter_by_level,
                structlog.stdlib.add_logger_name,
                structlog.stdlib.add_log_level,
                structlog.stdlib.PositionalArgumentsFormatter(),
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.UnicodeDecoder(),
                structlog.processors.JSONRenderer()
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )
        
        return structlog.get_logger(self.service_name)
    
    async def initialize(self):
        """Initialize the service - to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement initialize method")
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for the service"""
        return {
            "service": self.service_name,
            "status": "healthy",
            "timestamp": structlog.processors.TimeStamper().now()
        }
    
    async def close(self):
        """Close the service - to be implemented by subclasses if needed"""
        self.logger.info(f"{self.service_name} service closed")
        pass