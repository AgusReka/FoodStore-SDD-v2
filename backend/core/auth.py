"""Current user dependency and RBAC authorization for protected routes."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from backend.core.config import settings
from backend.core.enums import UserRole
from backend.core.exceptions import ForbiddenError
from backend.core.permissions import Permission, ROLE_PERMISSIONS

# OAuth2 scheme — points to /token which accepts form-encoded data (Swagger-compatible)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    """
    Dependency to get the current authenticated user.

    Args:
        token: JWT token from Authorization header

    Returns:
        dict: User data from token with user_id, email, and role

    Raises:
        HTTPException: If token is invalid or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role"),
        }
    except JWTError:
        raise credentials_exception


def require_role(required_role: UserRole):
    """FastAPI dependency factory: require a minimum role (admin bypasses)."""
    async def checker(
        current_user: Annotated[dict, Depends(get_current_user)],
    ) -> dict:
        user_role = current_user.get("role")
        if user_role != required_role.value:
            if user_role != UserRole.ADMIN.value:
                raise ForbiddenError(
                    f"Role '{required_role.value}' required"
                )
        return current_user
    return checker


def require_permission(required_permission: str | Permission):
    """FastAPI dependency factory: require a specific permission (admin bypasses)."""
    async def checker(
        current_user: Annotated[dict, Depends(get_current_user)],
    ) -> dict:
        user_role = UserRole(current_user["role"])
        if user_role == UserRole.ADMIN:
            return current_user

        permissions = ROLE_PERMISSIONS.get(user_role, set())
        perm_str = (
            required_permission.value
            if isinstance(required_permission, Permission)
            else required_permission
        )

        if Permission(perm_str) not in permissions:
            raise ForbiddenError(
                f"Permission '{perm_str}' required"
            )
        return current_user
    return checker