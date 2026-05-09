# Tasks: auth-backend

## 1. Data Model — AuthToken entity

- [x] 1.1 Create `AuthToken` SQLModel in `backend/modules/auth/model.py` with fields: id (UUID), token_hash (String 255), user_id (FK → usuarios.id), purpose (Enum: password_reset, email_verification), expires_at (DateTime with timezone), used_at (nullable DateTime), created_at (server default now)
- [x] 1.2 Register AuthToken model import in `backend/main.py` (alongside existing model imports)
- [x] 1.3 Generate Alembic migration for the `auth_tokens` table

## 2. Repository Layer — AuthTokenRepository

- [x] 2.1 Create `AuthTokenRepository` in `backend/modules/auth/repository.py` with methods: `create()`, `get_by_token_hash()`, `mark_as_used()`, `revoke_all_for_user()`
- [x] 2.2 Create `__init__.py` for auth module if needed (export router)

## 3. Service Layer — AuthTokenService + AuthService extensions

- [x] 3.1 Create `AuthTokenService` in `backend/modules/auth/service.py` with methods: `create_token()`, `validate_and_consume()`, `revoke_all_for_user()` and helpers for generating raw tokens + hashing
- [x] 3.2 Add `forgot_password(email)` method to AuthService — validates user exists (silently), generates password reset AuthToken
- [x] 3.3 Add `reset_password(token, new_password)` method to AuthService — validates and consumes token, updates user password hash, revokes all refresh tokens
- [x] 3.4 Add `send_verification(email)` method to AuthService — generates email verification AuthToken
- [x] 3.5 Add `verify_email(token)` method to AuthService — validates and consumes token, sets `user.is_verified = True`
- [x] 3.6 Add `change_password(user_id, current_password, new_password)` method to AuthService — verifies current password, updates hash, revokes all refresh tokens

## 4. Schema Layer — New schemas + password validation

- [x] 4.1 Add Pydantic schemas to `backend/modules/auth/schemas.py`: `ForgotPasswordRequest`, `ResetPasswordRequest`, `ResetPasswordResponse`, `SendVerificationRequest`, `VerifyEmailRequest`, `VerifyEmailResponse`, `ChangePasswordRequest`, `ChangePasswordResponse`
- [x] 4.2 Add `@field_validator('password')` on `RegisterRequest` enforcing: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
- [x] 4.3 Add password validation to `ResetPasswordRequest` and `ChangePasswordRequest` schemas
- [x] 4.4 Update `TokenResponse` / access token creation to include `email` claim in JWT payload

## 5. Router Layer — New endpoints

- [x] 5.1 Add `POST /auth/forgot-password` endpoint — accepts email, calls AuthService.forgot_password, returns success message
- [x] 5.2 Add `POST /auth/reset-password` endpoint — accepts token + new_password + confirm_password, calls AuthService.reset_password
- [x] 5.3 Add `POST /auth/send-verification` endpoint — accepts email, calls AuthService.send_verification
- [x] 5.4 Add `POST /auth/verify-email` endpoint — accepts token, calls AuthService.verify_email
- [x] 5.5 Add `PUT /auth/change-password` endpoint — JWT-protected, accepts current_password + new_password + confirm_password, calls AuthService.change_password
- [x] 5.6 Update existing `POST /auth/login` to include `email` in the JWT access token payload

## 6. Verification & Cleanup

- [x] 6.1 Verify all new endpoints are registered and respond correctly via server startup test
- [x] 6.2 Verify Alembic migration applies cleanly (create / upgrade head)
- [x] 6.3 Verify password validation rejects weak passwords and accepts strong ones
- [x] 6.4 Verify password reset flow end-to-end: forgot → reset → login with new password
- [x] 6.5 Verify email verification flow: send → verify → confirm is_verified=True
- [x] 6.6 Verify change password flow: change → old password rejected → new password works
