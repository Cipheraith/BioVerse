"""
Authentication middleware for BioVerse Python AI Service
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

security = HTTPBearer()

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify API key for authentication"""
    api_key = os.getenv("NODE_SERVER_API_KEY")
    
    # In production, API key is required for security
    # Only allow requests without API key in explicit development mode
    is_dev_mode = os.getenv("ENVIRONMENT", "production").lower() == "development"
    
    if not api_key:
        if is_dev_mode:
            print("WARNING: Running without API key in development mode")
            return True
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Server configuration error: API key not configured",
            )
    
    if credentials.credentials != api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return True