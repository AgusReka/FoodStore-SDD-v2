## Context

When the database is reset (deleted and recreated) while the frontend retains stale JWT tokens in localStorage, the application enters a deadlock state. The root cause chain is:

1. Frontend loads stale `accessToken` from localStorage → `isAuthenticated` = true
2. `ProtectedRoute` sees `accessToken` exists but `user` is null → triggers `fetchProfile()`
3. `fetchProfile()` calls `GET /auth/me` with stale token
4. Backend decodes JWT successfully (token still valid/not expired) → resolves user ID
5. User doesn't exist in new DB → backend raises `NotFoundError` → **HTTP 404**
6. Frontend Axios interceptor only handles 401 errors, not 404 → passes error through
7. `fetchProfile()` catch block sets `profileLoading: false` but does NOT clear auth
8. `ProtectedRoute` sees `profileLoading` changed → re-triggers `fetchProfile()` → **infinite loop**
9. User cannot escape: `LoginPage` redirects to `/` if `accessToken` exists, Header/logout is behind the spinner

This change fixes 4 specific points in the chain to ensure stale tokens are detected and cleared gracefully.

## Goals / Non-Goals

**Goals:**
- When backend returns an error for `/auth/me` (any error, not just 401), the frontend SHALL clear stale auth state and redirect to login
- When a JWT user no longer exists in the database, the backend SHALL return 401 so the frontend's token refresh interceptor can clean up
- The ProtectedRoute SHALL NOT infinitely retry profile fetch after a failure
- The LoginPage SHALL NOT redirect authenticated users whose profile fetch has failed (stale token scenario)
- The user SHALL always have an escape route to login/logout

**Non-Goals:**
- No changes to the JWT token format or expiry logic
- No changes to the refresh token flow
- No changes to the login, register, or password reset flows
- No database schema changes
- No new endpoints or API contracts

## Decisions

### Decision 1: Backend `/auth/me` returns 401 instead of 404 for deleted users

**Rationale:** The frontend's Axios interceptor has robust 401 handling that triggers token refresh → on failure → `clearAuth()` → redirect to `/login`. Returning 404 bypasses this entirely. Changing to 401 activates the existing defense mechanism.

**Alternative considered:** Adding 404 handling to the Axios interceptor. Rejected because 404 is semantically wrong for "your credentials are invalid" — the resource (the user's own profile) should return 401 when the caller is not who they claim to be.

### Decision 2: `fetchProfile` clears auth on ANY error

**Rationale:** If the backend fails to return the user profile for any reason (network error, 401, 404, 500, user deleted, token expired), the frontend should not assume the user is authenticated. Clearing `accessToken`, `refreshToken`, and `user` on any error is the safest default. This makes the system self-healing — stale tokens get purged on first failed request.

**Alternative considered:** Only clearing auth on 401/403 errors. Rejected because it leaves edge cases uncovered (e.g., backend restructured endpoints, network partitions, etc.).

### Decision 3: ProtectedRoute uses a ref guard to prevent infinite retries

**Rationale:** The current `useEffect` re-fires every time `profileLoading` transitions, which creates an infinite loop when `fetchProfile` keeps failing. Adding `hasFetched` ref ensures the profile is fetched at most once per ProtectedRoute mount.

**Alternative considered:** Adding a `fetchFailed` boolean to the auth store. Rejected because using a plain `useRef` is simpler, doesn't require store changes, and the ref is automatically cleaned up when the component unmounts.

### Decision 4: LoginPage checks `user` in addition to `accessToken`

**Rationale:** In the stale token scenario, `accessToken` exists but `user` is null (because `fetchProfile` failed). The current code redirects immediately on `accessToken` alone, sending the user back to ProtectedRoute → spinner trap. Checking both `accessToken && user` ensures we only redirect when the user is truly authenticated with a valid profile.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Race condition: `fetchProfile` error clears auth while a concurrent login is in progress | `login()` sets `isLoading=true` which blocks ProtectedRoute's profile fetch trigger; login sets tokens+user atomically |
| `useRef` guard prevents profile re-fetch even after the user logs in with a different account | The ref is per-mount; when the user navigates away and back, the component remounts with a fresh ref |
| Clearing auth on any fetchProfile error could log out a user during a transient network blip | This is acceptable — the user just needs to log in again; better than being stuck in an infinite loop. The token was already invalid if /auth/me fails |
