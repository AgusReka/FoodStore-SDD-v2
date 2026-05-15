## 1. Backend: Return 401 for deleted user in /auth/me

- [x] 1.1 Change `backend/modules/auth/router.py` line 104-105: replace `NotFoundError("User not found")` with `UnauthorizedError("User not found or deleted")`

## 2. Frontend: Clear auth on fetchProfile error

- [x] 2.1 Edit `frontend/src/shared/stores/authStore.ts` `fetchProfile` catch block to call `clearAuth()` instead of silently setting `profileLoading: false`

## 3. Frontend: Break infinite retry loop in ProtectedRoute

- [x] 3.1 Add `useRef` import to `frontend/src/shared/components/ProtectedRoute.tsx`
- [x] 3.2 Add a `hasFetched` ref guard so `fetchProfile()` is called at most once per mount

## 4. Frontend: Prevent LoginPage redirect with stale token

- [x] 4.1 Edit `frontend/src/pages/LoginPage.tsx`: add `user` selector from authStore and guard the redirect effect with `accessToken && user`
