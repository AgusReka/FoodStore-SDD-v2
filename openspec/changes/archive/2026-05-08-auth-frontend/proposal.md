## Why

The FoodStore backend auth module is fully implemented (login, register, refresh, logout, password reset, email verification, change password), but the frontend only has placeholder pages and empty form components. Users cannot actually log in, register, reset their password, or manage their profile. This change delivers the complete frontend authentication experience to match the backend capabilities.

## What Changes

- **New auth endpoint constants**: Add `AUTH_FORGOT_PASSWORD`, `AUTH_RESET_PASSWORD`, `AUTH_SEND_VERIFICATION`, `AUTH_VERIFY_EMAIL`, `AUTH_CHANGE_PASSWORD` to `shared/api/endpoints.ts`
- **Extended authStore**: Add `register`, `forgotPassword`, `resetPassword`, `sendVerification`, `verifyEmail`, `changePassword` actions to the Zustand store
- **Extended useAuth hook**: Add TanStack Query mutations for forgot-password, reset-password, send-verification, verify-email, change-password
- **LoginForm component**: Full implementation with form validation, error display, loading state, and link to register/forgot-password
- **RegisterForm component**: Full implementation with password strength validation, error display, loading state
- **LoginPage**: Wire LoginForm into the page route, handle post-login redirect
- **RegisterPage**: Wire RegisterForm into the page route, handle post-registration redirect
- **ProfilePage**: Display user info (name, email, role, verification status), link to change password
- **ForgotPasswordPage** (new): Email input form, success message display
- **ResetPasswordPage** (new): Token-based password reset form with new password + confirm
- **VerifyEmailPage** (new): Token verification page with success/error states
- **ChangePasswordForm** (new): Current password + new password + confirm form
- **ProtectedRoute** (new): Route guard component that redirects unauthenticated users to login
- **App.tsx routing**: Add all new auth routes with protected route wrapping
- **auth/index.ts barrel**: Export form components
- **pages/index.ts barrel**: Export all page components

## Capabilities

### New Capabilities
- `frontend-auth-ui`: Login, registration, password reset, email verification, and profile management UI components and pages for the FoodStore frontend

### Modified Capabilities
- `frontend-state-management`: Extend authStore with `register`, `forgotPassword`, `resetPassword`, `sendVerification`, `verifyEmail`, `changePassword` actions; add register request/response schemas to useAuth hook
- `frontend-api-client`: Add auth endpoint constants for forgot-password, reset-password, send-verification, verify-email, change-password
- `frontend-routing`: Add auth routes (login, register, forgot-password, reset-password, verify-email), profile route, and protected route guard component
- `authentication`: Add frontend-specific requirements for auth UI flows (form validation, redirect behavior, error display patterns)

## Impact

- **Frontend code**: New files in `frontend/src/features/auth/` (forms), `frontend/src/pages/` (new auth pages), `frontend/src/shared/` (route guard component)
- **Frontend modifications**: `shared/api/endpoints.ts`, `shared/stores/authStore.ts`, `shared/hooks/useAuth.ts`, `app/App.tsx`, `pages/index.ts`, `features/auth/index.ts`
- **No backend changes**: All required backend endpoints already exist
- **No new dependencies**: Uses existing React Router, Zustand, TanStack Query, Axios
