from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import get_current_user
from backend.core.database import get_db
from backend.core.security import create_access_token
from backend.modules.auth.schemas import RegisterRequest, LoginRequest, TokenResponse
from backend.modules.auth.service import AuthService
from backend.modules.usuarios.repository import UserRepository
from backend.modules.usuarios.service import UserService
from backend.modules.usuarios.schemas import UserRead
from backend.modules.refreshtokens.repository import RefreshTokenRepository
from backend.modules.refreshtokens.service import RefreshTokenService
from backend.modules.refreshtokens.schemas import RefreshTokenRequest, RefreshTokenResponse

router = APIRouter(tags=["Auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    user_repo = UserRepository(db)
    refresh_repo = RefreshTokenRepository(db)
    user_service = UserService(user_repo)
    refresh_service = RefreshTokenService(refresh_repo)
    auth_service = AuthService(user_service, refresh_service)
    return await auth_service.register(**data.model_dump())


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    user_repo = UserRepository(db)
    refresh_repo = RefreshTokenRepository(db)
    user_service = UserService(user_repo)
    refresh_service = RefreshTokenService(refresh_repo)
    auth_service = AuthService(user_service, refresh_service)
    result = await auth_service.login(email=data.email, password=data.password)
    return TokenResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
    )


@router.get("/me", response_model=UserRead)
async def me(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(current_user["user_id"])
    repo = UserRepository(db)
    service = UserService(repo)
    user = await service.get(user_id)
    if not user:
        from backend.core.exceptions import NotFoundError
        raise NotFoundError("User not found")
    return user


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh(data: RefreshTokenRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = RefreshTokenRepository(db)
    service = RefreshTokenService(repo)
    new_raw, new_token = await service.validate_and_rotate(data.refresh_token)
    access_token = create_access_token({"sub": str(new_token.user_id)})
    return RefreshTokenResponse(access_token=access_token, refresh_token=new_raw)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(data: RefreshTokenRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = RefreshTokenRepository(db)
    service = RefreshTokenService(repo)
    await service.revoke_token(data.refresh_token)
