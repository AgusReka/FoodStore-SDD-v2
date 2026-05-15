## Why

When the database is reset (deleted and recreated) while the frontend retains stale JWT tokens in localStorage, the application enters a deadlock state: the frontend believes the user is authenticated, repeatedly sends the stale token to the backend, the backend rejects requests (returns 404 instead of 401), and the user cannot log out, navigate to login, or use the app in any way. This creates a frustrating infinite-loop UX trap with no escape route.

## What Changes

- **Backend `/auth/me` endpoint**: Return HTTP 401 (Unauthorized) instead of 404 when the JWT user no longer exists in the database, so the frontend's Axios 401 interceptor triggers token refresh/clear logic
- **Frontend `fetchProfile` in authStore**: Clear auth state (accessToken, refreshToken, user) on ANY fetch error instead of silently swallowing it, so stale tokens are purged automatically
- **Frontend `ProtectedRoute`**: Add a guard to prevent infinite re-fetching of profile when it repeatedly fails
- **Frontend `LoginPage`**: Only redirect authenticated users if they have both a token AND a valid user object, preventing redirect loops with stale tokens

## Capabilities

### New Capabilities
- (none — this is a bug fix, no new capabilities)

### Modified Capabilities
- `user-auth`: The `/auth/me` endpoint SHALL return 401 (not 404) when the token's user no longer exists. The frontend SHALL clear auth state when profile fetch fails for any reason. The ProtectedRoute SHALL NOT retry profile fetch indefinitely. The LoginPage SHALL NOT redirect when user data is missing despite having a token.

## Impact

- **Backend**: `backend/modules/auth/router.py` — change exception type in `/auth/me` from `NotFoundError` to `UnauthorizedError`
- **Frontend**: 
  - `frontend/src/shared/stores/authStore.ts` — clear auth on fetchProfile error
  - `frontend/src/shared/components/ProtectedRoute.tsx` — prevent infinite retry loop
  - `frontend/src/pages/LoginPage.tsx` — guard redirect with user presence check
- No database changes, no new dependencies, no breaking API contract changes
