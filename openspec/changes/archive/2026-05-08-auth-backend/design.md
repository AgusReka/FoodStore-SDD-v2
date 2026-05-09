# Design: auth-backend

## Architecture Overview

Extend the existing auth module with three new flows (password reset, email verification, change password) plus input validation. All new features follow the existing patterns: FastAPI routes → Service layer → Repository → SQLModel. A new `AuthToken` model serves both password reset and email verification purposes.

```
┌─────────────────────────────────────────────┐
│              Auth Router                     │
│  /forgot-password  /reset-password          │
│  /send-verification /verify-email            │
│  /change-password                            │
└──────────┬──────────────────────────────────┘
           │ delegates to
           ▼
┌─────────────────────────────────────────────┐
│           AuthService (extended)             │
│  forgot_password()  reset_password()         │
│  send_verification()  verify_email()         │
│  change_password()                            │
└──────┬──────────────┬───────────────────────┘
       │              │
       ▼              ▼
┌────────────┐ ┌──────────────────┐
│ UserService │ │ AuthTokenService  │
│ (existing)  │ │ (new)             │
└────────────┘ └──────────────────┘
```

## Context

The current auth module provides basic authentication: register, login, /me, token refresh, and logout. However, it lacks several production-required flows:

- **Password reset**: No way for users to recover accounts
- **Email verification**: `User.is_verified` column exists but is never set to `true`
- **Change password**: Authenticated users have no endpoint to update passwords
- **Validation**: Password fields accept any input without strength checks

No new external dependencies are needed — all tools are available in the existing stack (passlib for hashing, pydantic for validation, python-jose for tokens).

## Goals / Non-Goals

**Goals:**
- Add password reset flow (forgot → email token → reset)
- Add email verification flow (send → verify)
- Add change password endpoint for authenticated users
- Add password validation rules (min length, complexity)
- Enhance input validation across auth schemas
- Enrich JWT access token payload with email claim
- Single reusable `AuthToken` model for all token-based flows

**Non-Goals:**
- Email sending infrastructure (SMTP configuration, templates — use a placeholder/mock service)
- Frontend forms or UI for any new flow
- Rate limiting or account lockout on failed attempts (separate concern)
- OAuth or social login
- Two-factor authentication

## Decisions

### Decision 1: Unified `AuthToken` model vs separate tables

**Chosen**: Single `AuthToken` model with `purpose` enum (`password_reset`, `email_verification`)

**Alternatives considered:**
- Separate `PasswordResetToken` and `EmailVerificationToken` tables — cleaner isolation but more boilerplate and migrations
- Storing reset tokens in a Redis-like cache — no infrastructure available, adds deployment complexity

**Rationale**: Both flows share identical structure (token_hash, user_id, expiry, used status). A single model with a `purpose` discriminator avoids table proliferation while keeping queries simple. Adding new purposes (e.g., `phone_verification`) requires no schema changes.

### Decision 2: Token stored as hash (bcrypt)

**Chosen**: Hash reset/verification tokens with passlib (same as refresh tokens)

**Rationale**: Follows the same pattern already established by `RefreshToken`. The raw token is returned only once at creation; the DB stores a hash. This prevents token theft via DB leak.

### Decision 3: Password validation at Pydantic schema layer

**Chosen**: `@field_validator` on `password` fields in auth schemas

**Alternatives considered:**
- Service-layer validation — works but validation logic is farther from the API contract
- Database constraints — too rigid, can't provide user-friendly error messages

**Rationale**: Pydantic validators provide immediate, structured error responses and keep the schema self-documenting. Users know exactly why their password was rejected.

### Decision 4: Change password revokes all refresh tokens

**Chosen**: After successful password change, all existing refresh tokens for the user are revoked

**Rationale**: Security best practice — a password change may indicate account compromise. Revoking all tokens forces re-login on all devices.

### Decision 5: Enrich access token with email claim

**Chosen**: Add `email` to the JWT payload alongside existing `sub` and `role`

**Rationale**: The frontend frequently needs the user's email for display. Including it in the token avoids an extra DB query on every protected endpoint. The token is already signed, so the email is tamper-proof.

## Data Model

### New: `AuthToken` table (`auth_tokens`)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, auto-generated |
| token_hash | String(255) | bcrypt hash of the raw token |
| user_id | UUID, FK → usuarios.id | The user this token belongs to |
| purpose | Enum("password_reset", "email_verification") | Discriminator |
| expires_at | DateTime(tz) | When the token expires |
| used_at | DateTime(tz) | null until consumed |
| created_at | DateTime(tz) | server default now() |

### Existing fields leveraged (no migration needed)

- `User.is_verified` — defaults to `False`, set to `True` on successful email verification
- `User.hashed_password` — updated by password reset and change password flows
- `RefreshToken` — all user tokens revoked on password change

## API Changes

### New Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/forgot-password` | Public | Request password reset (email → token) |
| POST | `/api/v1/auth/reset-password` | Public | Reset password with token |
| POST | `/api/v1/auth/send-verification` | Public | Send email verification |
| POST | `/api/v1/auth/verify-email` | Public | Verify email with token |
| PUT | `/api/v1/auth/change-password` | JWT | Change password (requires current password) |

### Modified Behavior

| Endpoint | Change |
|----------|--------|
| POST `/api/v1/auth/login` | Access token now includes `email` claim |
| POST `/api/v1/auth/register` | Password validated against strength rules |

### Request/Response Schemas

```
ForgotPasswordRequest  → { email: str }
ForgotPasswordResponse → { message: str }       (always success, don't reveal if email exists)

ResetPasswordRequest   → { token: str, new_password: str, confirm_password: str }
ResetPasswordResponse  → { message: str }

SendVerificationRequest  → { email: str }
SendVerificationResponse → { message: str }

VerifyEmailRequest → { token: str }
VerifyEmailResponse → { message: str }

ChangePasswordRequest  → { current_password: str, new_password: str, confirm_password: str }
ChangePasswordResponse → { message: str }
```

## Implementation Notes

- **Password reset flow**: Always return success message even if email doesn't exist (prevent email enumeration)
- **Email verification**: The `send-verification` endpoint creates/rotates a token; actual email sending is a placeholder (log to console)
- **Token expiry**: Password reset tokens expire in 1 hour; email verification tokens in 24 hours
- **Password rules**: Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
- **Module placement**: New `AuthTokenService` and `AuthTokenRepository` live in `backend/modules/auth/` alongside existing auth code. The `AuthToken` model goes in `backend/modules/auth/model.py`
- **Existing schema extension**: Add password validation and new schemas to `backend/modules/auth/schemas.py`

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Password reset token brute-force | Token expires after 1 hour; hashed in DB so DB leak doesn't reveal valid tokens |
| Email enumeration via forgot-password | Return same message whether email exists or not |
| Stale tokens accumulating in DB | Background cleanup (future consideration); low volume at current scale |
| Password change locks user out of all sessions | Expected behavior — user just changed password, re-login is appropriate |
| Token replay (intercepted email link) | Short TTL (1 hour for reset, 24h for verification); token is single-use |
