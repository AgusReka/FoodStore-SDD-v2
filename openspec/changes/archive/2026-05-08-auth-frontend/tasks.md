# Tasks: auth-frontend

## 1. API Layer — Add Auth Endpoint Constants

- [x] 1.1 Add `AUTH_FORGOT_PASSWORD`, `AUTH_RESET_PASSWORD`, `AUTH_SEND_VERIFICATION`, `AUTH_VERIFY_EMAIL`, `AUTH_CHANGE_PASSWORD` constants to `shared/api/endpoints.ts`

## 2. State Management — Extend authStore

- [x] 2.1 Add `register` action to authStore: POST to `ENDPOINTS.AUTH_REGISTER`, no token storage, manages isLoading/hasError
- [x] 2.2 Add `forgotPassword` action to authStore: POST to `ENDPOINTS.AUTH_FORGOT_PASSWORD`
- [x] 2.3 Add `resetPassword` action to authStore: POST to `ENDPOINTS.AUTH_RESET_PASSWORD` with token, newPassword, confirmPassword
- [x] 2.4 Add `sendVerification` action to authStore: POST to `ENDPOINTS.AUTH_SEND_VERIFICATION`
- [x] 2.5 Add `verifyEmail` action to authStore: POST to `ENDPOINTS.AUTH_VERIFY_EMAIL`, update user.is_verified on success
- [x] 2.6 Add `changePassword` action to authStore: PUT to `ENDPOINTS.AUTH_CHANGE_PASSWORD`

## 3. Hooks — Extend useAuth with Mutations

- [x] 3.1 Add `forgotPassword` mutation to useAuth hook using `useMutation` calling `ENDPOINTS.AUTH_FORGOT_PASSWORD`
- [x] 3.2 Add `resetPassword` mutation to useAuth hook using `useMutation` calling `ENDPOINTS.AUTH_RESET_PASSWORD`
- [x] 3.3 Add `sendVerification` mutation to useAuth hook using `useMutation` calling `ENDPOINTS.AUTH_SEND_VERIFICATION`
- [x] 3.4 Add `verifyEmail` mutation to useAuth hook using `useMutation` calling `ENDPOINTS.AUTH_VERIFY_EMAIL`
- [x] 3.5 Add `changePassword` mutation to useAuth hook using `useMutation` calling `ENDPOINTS.AUTH_CHANGE_PASSWORD`

## 4. Validation Helpers

- [x] 4.1 Create `shared/utils/validation.ts` with `validatePassword(password)` returning error message array and `isValidEmail(email)` boolean
- [x] 4.2 Password validation rules: min 8 chars, at least 1 uppercase, at least 1 lowercase, at least 1 digit

## 5. Auth Form Components

- [x] 5.1 Implement `LoginForm.tsx`: email + password fields, validation, loading state, error display, links to register and forgot-password
- [x] 5.2 Implement `RegisterForm.tsx`: email, username, first_name, last_name, phone, password, confirm_password fields with full validation (password strength, match check, email format)
- [x] 5.3 Create `ChangePasswordForm.tsx`: current password, new password, confirm password fields with validation

## 6. Auth Pages

- [x] 6.1 Implement `LoginPage.tsx`: wire LoginForm, handle redirect after login (to ?redirect= or /), pass loading/error state
- [x] 6.2 Implement `RegisterPage.tsx`: wire RegisterForm, redirect to /login?email=<email> on success, pass loading/error state
- [x] 6.3 Implement `ProfilePage.tsx`: display user info, email verification status + verification link, include ChangePasswordForm
- [x] 6.4 Create `ForgotPasswordPage.tsx`: email input form, success message display, link back to login
- [x] 6.5 Create `ResetPasswordPage.tsx`: read token from URL query params, new password + confirm form, success/error display
- [x] 6.6 Create `VerifyEmailPage.tsx`: read token from URL query params, call verify API, display success/error, fallback to resend form

## 7. Routing & Route Guard

- [x] 7.1 Create `shared/components/ProtectedRoute.tsx`: checks `useAuth().isAuthenticated`, redirects to `/login?redirect=<path>` if unauthenticated, shows spinner while loading
- [x] 7.2 Update `App.tsx` with all new routes: /forgot-password, /reset-password, /verify-email, /profile (wrapped in ProtectedRoute)
- [x] 7.3 Update `/login` route to use fully implemented LoginPage
- [x] 7.4 Update `/register` route to use fully implemented RegisterPage

## 8. Barrel Exports

- [x] 8.1 Update `pages/index.ts` to export all auth pages (LoginPage, RegisterPage, ProfilePage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage)
- [x] 8.2 Update `features/auth/index.ts` to export LoginForm, RegisterForm, ChangePasswordForm

## 9. Build Verification

- [x] 9.1 Run `tsc --noEmit` to verify TypeScript compilation passes
- [x] 9.2 Run `vite build` to verify the production build succeeds
