"""Auth router — authentication endpoints."""
from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import get_current_user
from backend.core.database import get_db
from backend.core.security import create_access_token
from backend.modules.auth.repository import AuthTokenRepository, UserRepository
from backend.modules.auth.schemas import (
    ChangePasswordRequest,
    ChangePasswordResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    ResetPasswordResponse,
    SendVerificationRequest,
    TokenResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
)
from backend.modules.auth.service import AuthService, AuthTokenService
from backend.modules.usuarios.service import UserService
from backend.modules.usuarios.schemas import UserRead
from backend.modules.refreshtokens.repository import RefreshTokenRepository
from backend.modules.refreshtokens.service import RefreshTokenService
from backend.modules.refreshtokens.schemas import RefreshTokenRequest, RefreshTokenResponse

router = APIRouter(tags=["Auth"])


def _get_mail_service():
    """Get or build MailService (lazily imported to avoid circular issues)."""
    from backend.core.mail import mail_service
    return mail_service


def _build_auth_service(db: AsyncSession) -> AuthService:
    """Build AuthService with all dependencies."""
    user_repo = UserRepository(db)
    refresh_repo = RefreshTokenRepository(db)
    auth_token_repo = AuthTokenRepository(db)
    return AuthService(
        user_service=UserService(user_repo),
        refresh_token_service=RefreshTokenService(refresh_repo),
        auth_token_service=AuthTokenService(auth_token_repo),
        mail_service=_get_mail_service(),
    )


# ── Existing Endpoints ──────────────────────────────────────────────


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    auth_service = _build_auth_service(db)
    return await auth_service.register(**data.model_dump())


@router.post("/token", response_model=TokenResponse)
async def token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """OAuth2-compatible token endpoint for Swagger's Authorize button.

    Accepts application/x-www-form-urlencoded with username and password.
    Maps `username` → `email` for the login service.
    """
    auth_service = _build_auth_service(db)
    result = await auth_service.login(email=form_data.username, password=form_data.password)
    return TokenResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """JSON-based login endpoint for the frontend.

    Accepts application/json with email and password.
    """
    auth_service = _build_auth_service(db)
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

    # Fetch user to include email + role in the new access token
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)
    user = await user_service.get(new_token.user_id)
    if user:
        access_token = create_access_token({
            "sub": str(user.id),
            "role": user.role.value,
            "email": user.email,
        })
    else:
        access_token = create_access_token({"sub": str(new_token.user_id)})

    return RefreshTokenResponse(access_token=access_token, refresh_token=new_raw)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(data: RefreshTokenRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = RefreshTokenRepository(db)
    service = RefreshTokenService(repo)
    await service.revoke_token(data.refresh_token)


# ── Password Reset ──────────────────────────────────────────────────


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    auth_service = _build_auth_service(db)
    await auth_service.forgot_password(data.email)
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    auth_service = _build_auth_service(db)
    await auth_service.reset_password(data.token, data.new_password)
    return ResetPasswordResponse()


# ── Email Verification ──────────────────────────────────────────────


@router.post("/send-verification")
async def send_verification(data: SendVerificationRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    auth_service = _build_auth_service(db)
    await auth_service.send_verification(data.email)
    return {"message": "If the email exists, a verification link has been sent"}


@router.post("/verify-email")
async def verify_email(data: VerifyEmailRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    auth_service = _build_auth_service(db)
    await auth_service.verify_email(data.token)
    return VerifyEmailResponse()


# ── Change Password ─────────────────────────────────────────────────


@router.put("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    auth_service = _build_auth_service(db)
    user_id = UUID(current_user["user_id"])
    await auth_service.change_password(user_id, data.current_password, data.new_password)
    return ChangePasswordResponse()
