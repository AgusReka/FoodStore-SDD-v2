## Context

The backend `direcciones` module already uses English attribute names (`street`, `city`, `postal_code`, `is_primary`, `street_number`) in its Pydantic schemas (`DireccionCreate`, `DireccionRead`, `DireccionList`). The SQLModel `Address` also uses English Python attributes with Spanish column-name mappings (`calle`, `numero`, `ciudad`, `codigo_postal`).

The frontend was built assuming Spanish field names based on early prototypes, creating a mismatch on every address API call. GET returns `DireccionList {items, total, page, size}` but the frontend does `Array.isArray(response.data)` which fails. Additionally, CheckoutPage calls `get('/api/v1/direcciones')` which, given the axios `baseURL` already includes `/api/v1`, produces a doubled URL.

## Goals / Non-Goals

**Goals:**
- Fix all 5 issues identified during exploration (field names POST, field names GET, response structure, hardcoded URL, missing street_number)
- Frontend-only changes — backend stays untouched
- Make checkout flow work end-to-end

**Non-Goals:**
- No backend schema changes (backend is correct)
- No DB migration or model changes
- No internationalization (labels remain in Spanish for UX)
- No REST API redesign (only fix the mismatches)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend-only fix | Yes | Backend schemas are correct; changing them breaks nothing, so adapt frontend to match reality |
| Keep UI labels in Spanish | Yes | Users are Spanish-speaking; `calle`/`ciudad` labels in the form are fine, only the payload changes |
| Add `street_number` as separate field | Yes | Backend expects `street_number` (nullable `VARCHAR(20)`) and model maps it to `numero`. A separate input in the form gives cleaner UX than forcing users to mix street + number in one field |
| Unwrap `DireccionList` via generic type | Yes | The existing `PaginatedResponse<T>` type in `client.ts` already models `{items, total, page, size}` — use it |
| Use `ENDPOINTS.ADDRESSES_LIST` | Yes | Already defined in `endpoints.ts` as `ADDRESSES_LIST: '/direcciones/'`. Using the constant avoids hardcoded strings |

## Risks / Trade-offs

- **[Low] Form UX change**: Adding `street_number` changes form length slightly. Mitigation: keep it as a single row alongside existing fields with proper placeholder.
- **[Low] Existing address data**: Addresses created via DB seed or admin may have `null` street_number. Mitigation: `street_number` is nullable in both schema and form, optional field.
- **[None] Backward compat**: Frontend-only change, no API versioning needed since backend behavior is unchanged.
