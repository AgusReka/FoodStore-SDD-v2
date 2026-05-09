"""Security utilities: password hashing and JWT tokens."""

import hmac
import secrets
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_safe_token(num_bytes: int = 48) -> str:
    """Generate a cryptographically secure, URL-safe token.

    48 bytes = 384 bits of entropy = 64 URL-safe characters.
    Significantly more secure than UUID4 (122 bits of entropy).
    """
    return secrets.token_urlsafe(num_bytes)


def hash_token_deterministic(token: str) -> str:
    """Hash a token deterministically using HMAC-SHA256.

    Unlike bcrypt (which uses random salt), this produces the SAME output
    for the SAME input every time. This allows DB lookups by hash.

    Uses settings.SECRET_KEY as the HMAC key.
    """
    key_bytes = settings.SECRET_KEY.encode("utf-8")
    token_bytes = token.encode("utf-8")
    return hmac.new(key_bytes, token_bytes, sha256).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to compare against

    Returns:
        bool: True if the password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: The plain text password to hash

    Returns:
        str: The hashed password
    """
    return pwd_context.hash(password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: The data to encode in the token
        expires_delta: Optional expiration time delta

    Returns:
        str: The encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    """
    Decode and validate a JWT access token.

    Args:
        token: The JWT token to decode

    Returns:
        dict | None: The decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        return None