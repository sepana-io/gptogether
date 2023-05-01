from fastapi import APIRouter
from app.resources import (
    public, 
    user,
    prompts,
    conversations
)

API_VERSION = "v1"

api_router = APIRouter()

api_router.include_router(
    public.router, prefix=f"/{API_VERSION}", tags=["Public Endpoints"]
)
api_router.include_router(
    user.router, prefix=f"/{API_VERSION}/user", tags=["User Endpoints"]
)
api_router.include_router(
    prompts.router, prefix=f"/{API_VERSION}/prompts", tags=["Prompts Endpoints"]
)
api_router.include_router(
    conversations.router, prefix=f"/{API_VERSION}/conversation", tags=["Conversation Endpoints"]
)
