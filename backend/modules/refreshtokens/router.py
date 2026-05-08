"""Refresh token router — endpoints exposed through auth module."""
from fastapi import APIRouter

router = APIRouter(tags=["Refresh Tokens"])

# All refresh token endpoints are managed through the auth module.
# This router exists for module structure consistency.
