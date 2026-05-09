"""Auth schemas — request/response validation and password strength rules."""
import re

from pydantic import BaseModel, field_validator


def _validate_password(password: str) -> str:
    """Validate password strength."""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")
    return password


# ── Existing Schemas ────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    first_name: str
    last_name: str
    phone: str | None = None

    _validate_password = field_validator("password")(_validate_password)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ── Password Reset ──────────────────────────────────────────────────


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

    _validate_password = field_validator("new_password")(_validate_password)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class ResetPasswordResponse(BaseModel):
    message: str = "Password has been reset successfully"


# ── Email Verification ──────────────────────────────────────────────


class SendVerificationRequest(BaseModel):
    email: str


class VerifyEmailRequest(BaseModel):
    token: str


class VerifyEmailResponse(BaseModel):
    message: str = "Email verified successfully"


# ── Change Password ─────────────────────────────────────────────────


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    _validate_password = field_validator("new_password")(_validate_password)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class ChangePasswordResponse(BaseModel):
    message: str = "Password changed successfully"
