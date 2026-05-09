"""Authentication service — auth flows and token management."""
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from backend.core.config import settings
from backend.core.enums import AuthTokenPurpose
from backend.core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from backend.core.mail import MailService
from backend.core.security import create_access_token, generate_safe_token, hash_token_deterministic, verify_password
from backend.modules.auth.repository import AuthTokenRepository, UserRepository
from backend.modules.refreshtokens.service import RefreshTokenService
from backend.modules.usuarios.service import UserService


def build_reset_password_url(token: str, base_url: str | None = None) -> str:
    """Build frontend password reset URL with token as query parameter.

    Matches frontend: ResetPasswordPage uses searchParams.get('token')
    URL format: {FRONTEND_URL}/reset-password?token=xxx
    """
    frontend = base_url or settings.FRONTEND_URL
    frontend = frontend.rstrip("/")
    return f"{frontend}/reset-password?token={token}"


def build_verify_email_url(token: str, base_url: str | None = None) -> str:
    """Build frontend email verification URL with token as query parameter.

    Matches frontend: VerifyEmailPage uses searchParams.get('token')
    URL format: {FRONTEND_URL}/verify-email?token=xxx
    """
    frontend = base_url or settings.FRONTEND_URL
    frontend = frontend.rstrip("/")
    return f"{frontend}/verify-email?token={token}"


class AuthTokenService:
    """Service for password reset and email verification tokens."""

    TOKEN_EXPIRY = {
        AuthTokenPurpose.PASSWORD_RESET: timedelta(hours=1),
        AuthTokenPurpose.EMAIL_VERIFICATION: timedelta(hours=24),
    }

    def __init__(self, repository: AuthTokenRepository):
        self.repository = repository

    async def create_token(
        self, user_id: UUID, purpose: AuthTokenPurpose
    ) -> tuple[str, str]:
        """Create a token. Returns (raw_token, token_id)."""
        raw_token = generate_safe_token()
        hashed = hash_token_deterministic(raw_token)
        expires_at = datetime.now(timezone.utc) + self.TOKEN_EXPIRY[purpose]

        obj = await self.repository.create(
            token_hash=hashed,
            user_id=user_id,
            purpose=purpose,
            expires_at=expires_at,
        )
        return raw_token, str(obj.id)

    async def validate_and_consume(
        self, raw_token: str, purpose: AuthTokenPurpose
    ) -> UUID:
        """Validate and consume a token. Returns user_id on success."""
        hashed = hash_token_deterministic(raw_token)
        stored = await self.repository.get_by_token_hash(hashed)
        if not stored:
            raise NotFoundError("Invalid token")

        if stored.purpose != purpose:
            raise UnauthorizedError("Invalid token purpose")

        if stored.used_at is not None:
            raise UnauthorizedError("Token has already been used")

        if datetime.now(timezone.utc) > stored.expires_at:
            raise UnauthorizedError("Token has expired")

        await self.repository.mark_as_used(stored.id)
        return stored.user_id

    async def revoke_all_for_user(
        self, user_id: UUID, purpose: AuthTokenPurpose | None = None
    ) -> None:
        """Revoke all unused tokens for a user, optionally filtered by purpose."""
        await self.repository.revoke_all_for_user(
            user_id,
            purpose=purpose.value if purpose else None,
        )


class AuthService:
    def __init__(
        self,
        user_service: UserService,
        refresh_token_service: RefreshTokenService,
        auth_token_service: AuthTokenService | None = None,
        mail_service: MailService | None = None,
    ):
        self.user_service = user_service
        self.refresh_token_service = refresh_token_service
        self.auth_token_service = auth_token_service
        self.mail_service = mail_service

    async def register(
        self,
        email: str,
        username: str,
        password: str,
        first_name: str,
        last_name: str,
        **kwargs,
    ):
        user = await self.user_service.create_user(
            email=email,
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            **kwargs,
        )
        # Auto-send verification email after registration
        if self.auth_token_service and not user.is_verified:
            await self._do_send_verification(user.id, email)
        return user

    async def _do_send_verification(self, user_id: UUID, email: str) -> None:
        """Internal: send verification email for a user."""
        if not self.auth_token_service:
            return

        raw, _ = await self.auth_token_service.create_token(
            user_id,
            AuthTokenPurpose.EMAIL_VERIFICATION,
        )
        verify_url = build_verify_email_url(raw)

        if self.mail_service:
            await self.mail_service.send_verification_email(email, verify_url)
        else:
            print(f"[DEV] Email verification token for {email}: {raw}")
            print(f"      URL: {verify_url}")

    async def login(self, email: str, password: str):
        user = await self.user_service.get_by_email(email)
        if not user:
            raise UnauthorizedError("Invalid email or password")

        if not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")

        access_token = create_access_token(
            {
                "sub": str(user.id),
                "role": user.role.value,
                "email": user.email,
            }
        )
        raw_refresh, refresh_obj = await self.refresh_token_service.create_token(
            user.id
        )

        return {
            "access_token": access_token,
            "refresh_token": raw_refresh,
            "user": user,
        }

    async def get_current_user(self, user_id: str):
        return await self.user_service.get(UUID(user_id))

    # ── Password Reset ──────────────────────────────────────────────

    async def forgot_password(self, email: str) -> None:
        """Request a password reset. Always returns success (prevent enumeration)."""
        user = await self.user_service.get_by_email(email)
        if not user:
            return

        if self.auth_token_service:
            raw, _ = await self.auth_token_service.create_token(
                user.id,
                AuthTokenPurpose.PASSWORD_RESET,
            )
            reset_url = build_reset_password_url(raw)

            if self.mail_service:
                await self.mail_service.send_reset_password(email, reset_url)
            else:
                print(f"[DEV] Password reset token for {email}: {raw}")
                print(f"      URL: {reset_url}")

    async def reset_password(self, token: str, new_password: str) -> None:
        """Reset password using a reset token."""
        user_id = await self.auth_token_service.validate_and_consume(
            token,
            AuthTokenPurpose.PASSWORD_RESET,
        )
        await self.user_service.update_password(user_id, new_password)
        await self.refresh_token_service.repository.revoke_all_for_user(user_id)

    # ── Email Verification ──────────────────────────────────────────

    async def send_verification(self, email: str) -> None:
        """Send an email verification token."""
        user = await self.user_service.get_by_email(email)
        if not user:
            return

        if user.is_verified:
            return

        await self._do_send_verification(user.id, email)

    async def verify_email(self, token: str) -> None:
        """Verify email using a verification token."""
        user_id = await self.auth_token_service.validate_and_consume(
            token,
            AuthTokenPurpose.EMAIL_VERIFICATION,
        )
        await self.user_service.update(user_id, is_verified=True)

    # ── Change Password ─────────────────────────────────────────────

    async def change_password(
        self, user_id: UUID, current_password: str, new_password: str
    ) -> None:
        """Change password for authenticated user."""
        user = await self.user_service.get(user_id)
        if not user:
            raise NotFoundError("User not found")

        if not verify_password(current_password, user.hashed_password):
            raise UnauthorizedError("Current password is incorrect")

        await self.user_service.update_password(user_id, new_password)
        await self.refresh_token_service.repository.revoke_all_for_user(user_id)
