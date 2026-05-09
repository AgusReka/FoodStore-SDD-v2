# Design: auth-frontend

## Context

The FoodStore backend auth module is fully implemented with 10 endpoints: register, login, me, refresh, logout, forgot-password, reset-password, send-verification, verify-email, change-password. The frontend has:

- **authStore** (Zustand): login, logout, refresh actions already working
- **useAuth hook**: login, logout, register, profile fetch via TanStack Query
- **API client**: Axios instance with auth interceptor + endpoint constants (missing 5 auth endpoints)
- **Pages**: LoginPage (placeholder), RegisterPage (placeholder), ProfilePage (empty)
- **Forms**: LoginForm.tsx (1 line), RegisterForm.tsx (1 line) - both empty
- **Routing**: /login, /register, / routes exist

This design covers adding the complete frontend auth UI layer — all forms, pages, extended store/hook, route guards, and barrel exports.

## Goals / Non-Goals

**Goals:**
- Complete frontend auth UI: login, register, forgot password, reset password, email verification, change password, profile view
- Extend authStore with all missing auth actions (register, forgotPassword, resetPassword, sendVerification, verifyEmail, changePassword)
- Extend useAuth hook with TanStack Query mutations for all auth flows
- Add all missing endpoint constants to shared/api/endpoints.ts
- Create ProtectedRoute component for route gating
- Wire all auth routes into App.tsx
- Update barrel exports (auth/index.ts, pages/index.ts)

**Non-Goals:**
- Backend changes (all endpoints already exist)
- UI theming beyond Tailwind utility classes
- Social login / OAuth providers
- Two-factor authentication
- Admin user management UI (separate change)
- E2E tests (unit tests for forms are separate concern)

## Decisions

### 1. Feature forms as separate components (not inline in pages)

Forms (`LoginForm`, `RegisterForm`) live in `features/auth/` as reusable components, consumed by their respective pages. This follows the existing FSD pattern and allows forms to be reused (e.g., LoginForm in a modal, RegisterForm in an admin creation flow).

**Alternatives considered:**
- **Forms inline in pages**: Simpler but breaks FSD layering and prevents reuse
- **Forms in widgets/**: Would work but features/ is more semantically correct per FSD

### 2. Controlled form components with manual validation

Each form uses React controlled components (useState for each field) with manual validation on submit. Validation rules mirror the backend (password: 8+ chars, uppercase, lowercase, digit).

**Why not react-hook-form / formik?** — Not worth adding a dependency for 5 simple forms. The validation logic is straightforward and mirrors backend rules defined in the auth spec.

### 3. Auth store extension: direct action addition

New actions (`register`, `forgotPassword`, `resetPassword`, `sendVerification`, `verifyEmail`, `changePassword`) are added directly to the existing authStore. The persist middleware partialize only persists tokens — not user or error state — which remains correct.

**Why not a separate store?** — All actions relate to auth state. Splitting would create cross-store dependencies.

### 4. useAuth hook extension: TanStack Query mutations

New auth flows use `useMutation` from TanStack Query (consistent with existing `register` mutation pattern). Mutations handle loading/error states internally, which the consuming components read.

**Why not use store actions for everything?** — Mutations that don't need to persist state long-term (forgot-password, reset-password, verify-email) are better as hook-level mutations. Only login/register/change-password need store integration (login stores tokens, register may pre-fill email).

### 5. ProtectedRoute as a layout wrapper component

`<ProtectedRoute>` checks `useAuth().isAuthenticated` and redirects to `/login?redirect=<path>` if false. Wraps protected routes in App.tsx.

**Why not a middleware-based approach?** — React Router v6 doesn't have middleware. The wrapper component pattern is idiomatic and type-safe.

### 6. Redirect strategy

- **Login**: After success, redirect to the `redirect` query param, or `/` (home) if absent
- **Register**: After success, redirect to `/login?email=<email>` with a success toast/notification
- **Logout**: Redirect to `/login`
- **Protected routes**: Unauthenticated users go to `/login?redirect=<original_path>`

### 7. Error display pattern

- Form-level error banner for API errors (wrong password, email not found, etc.)
- Field-level validation shown inline (password too short, emails don't match, etc.)
- Loading spinner on submit buttons during API calls
- Success messages as inline alerts (not toasts, to keep it simple and accessible)

## Architecture

```
Pages Layer (pages/)
  LoginPage          ← uses LoginForm, handles redirect
  RegisterPage       ← uses RegisterForm, handles redirect
  ProfilePage        ← displays user info + ChangePasswordForm
  ForgotPasswordPage ← forgot password form
  ResetPasswordPage  ← reset password form (token from URL)
  VerifyEmailPage    ← verify email (token from URL)

Features Layer (features/auth/)
  LoginForm.tsx        ← login form component
  RegisterForm.tsx     ← registration form component
  ChangePasswordForm.tsx ← change password form component
  index.ts             ← barrel export

Shared Layer (shared/)
  stores/authStore.ts   ← extended with new actions
  hooks/useAuth.ts      ← extended with new mutations
  api/endpoints.ts       ← extended with new constants
  components/ProtectedRoute.tsx ← new route guard

App Layer (app/)
  App.tsx              ← updated routes
```

## Data Flow

```
User fills form → Component state (useState)
  → validation passes?
    → YES: calls useAuth mutation (TanStack Query) or store action
    → NO: shows inline field errors
  → API call succeeds?
    → YES: (login) store tokens + redirect | (register) redirect to login
    → YES: (password reset, verify) show success message
    → NO: show error banner from mutation.error
```

## Implementation Notes

### Endpoint constants to add (endpoints.ts)
```
AUTH_FORGOT_PASSWORD: `${AUTH}/forgot-password`
AUTH_RESET_PASSWORD: `${AUTH}/reset-password`
AUTH_SEND_VERIFICATION: `${AUTH}/send-verification`
AUTH_VERIFY_EMAIL: `${AUTH}/verify-email`
AUTH_CHANGE_PASSWORD: `${AUTH}/change-password`
```

### AuthStore actions to add
- `register(data: RegisterData): Promise<void>` — POST /auth/register, no token storage
- `forgotPassword(email: string): Promise<void>` — POST /auth/forgot-password
- `resetPassword(token, newPassword, confirmPassword): Promise<void>` — POST /auth/reset-password
- `sendVerification(email: string): Promise<void>` — POST /auth/send-verification
- `verifyEmail(token: string): Promise<void>` — POST /auth/verify-email
- `changePassword(currentPassword, newPassword, confirmPassword): Promise<void>` — PUT /auth/change-password

### Routing structure (App.tsx)
```
/                        → HomePage (public)
/login                   → LoginPage (public)
/register                → RegisterPage (public)
/forgot-password         → ForgotPasswordPage (public)
/reset-password          → ResetPasswordPage (public)
/verify-email            → VerifyEmailPage (public)
/profile                 → ProfilePage (protected, wrapped in <ProtectedRoute>)
/checkout                → CheckoutPage (protected)
/orders                  → OrdersPage (protected)
*                        → NotFound
```

### Password validation rules (mirror backend)
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- New password and confirm password must match

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Token expiry during long form fill | useAuth hook already has auto-refresh via axios interceptor (from frontend-api-client spec); profile refetch on 401 clears stale state |
| Password manager autofill interference | Use standard `name` attributes on inputs, no `autocomplete="off"` on password fields |
| Double-submit on slow connections | Disable submit button while mutation is pending; use `isPending` from TanStack Query |
| Email verification race condition (user closes tab before verifying) | VerifyEmailPage reads token from URL query param — bookmarkable. Resend option on page |
| Backend returns 422 with field errors | Form displays field-level errors when API returns validation details; generic error banner for unexpected errors |
