# Proposal: auth-backend

## What Changes

Complete the backend authentication system for FoodStore with production-ready security features: password reset flow, email verification, change password, and enhanced validation.

## Why

The current auth module has basic login/register/me/refresh/logout endpoints implemented, but is missing critical security features required for a production e-commerce platform:

- **Password reset**: Users need a way to recover their accounts
- **Email verification**: The `User` model has `is_verified = False` but no verification flow exists
- **Change password**: Authenticated users cannot update their password
- **Input validation**: No password strength validation, minimal schema constraints
- **Token payload**: Access tokens should carry full identity context

## Scope

### In Scope

- Password reset flow (forgot password → email token → reset password)
- Email verification flow (send verification → verify email)
- Change password endpoint for authenticated users
- Password validation rules (minimum length, complexity requirements)
- Enhanced input validation for all auth schemas
- Token payload enrichment (role already present, add email claim)
- Comprehensive error responses for auth failures

### Out of Scope

- Email sending infrastructure (SMTP configuration, email templates — assume a placeholder mail service)
- Frontend forms for password reset and email verification
- Rate limiting (separate infrastructure concern)
- OAuth/social login
- Two-factor authentication (2FA)

## Capabilities

| Capability | Type | Description |
|-----------|------|-------------|
| `auth-backend` | modified | Extend existing authentication module with password reset, email verification, change password, and validation |
| `backend-security` | modified | Add password validation rules and account protection |

## Impact

- **Backend modules affected**: `auth/`, `core/`
- **New dependencies**: None (uses existing `python-jose`, `passlib`, `pydantic`)
- **Database changes**: None (existing `User.is_verified`, `User.hashed_password` columns suffice; password reset tokens stored in `RefreshToken` table or new `PasswordResetToken` model)
- **API contract**: New endpoints added; existing endpoints unchanged in signature
