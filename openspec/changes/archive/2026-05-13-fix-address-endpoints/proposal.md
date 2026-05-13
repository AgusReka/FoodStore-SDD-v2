## Why

Checkout fails with 422 Validation Errors because the frontend address components send Spanish field names (`calle`, `ciudad`, `codigo_postal`) while the backend—already correct—expects English names (`street`, `city`, `postal_code`). The GET response also wraps addresses in a `DireccionList {items, total, page, size}` object while the frontend expects a raw array, and CheckoutPage hardcodes a URL that doubles the `/api/v1` prefix.

## What Changes

All changes are frontend-only. Backend schemas stay as-is (already correct English).

- **AddressForm**: Send `street`, `city`, `postal_code`, `street_number` (English) matching `DireccionCreate`. Add `street_number` field to the form.
- **AddressCard interface**: Read `street`, `city`, `postal_code`, `is_primary` (English) matching `DireccionRead`.
- **CheckoutPage GET**: Unwrap `response.data.items` from `DireccionList` instead of treating response as a raw array.
- **CheckoutPage URL**: Use `ENDPOINTS.ADDRESSES_LIST` instead of hardcoded `/api/v1/direcciones` (which doubles the base prefix).
- **Endpoints constant**: Add `ADDRESSES_LIST` as `ENDPOINTS.ADDRESSES_LIST` (already exists in endpoints.ts — just use it).

## Capabilities

### New Capabilities

*(none — this is a bugfix with no new capability)*

### Modified Capabilities

- **address-management**: Update spec scenarios to use English field names (`street`, `city`, `postal_code`, `is_primary`) matching the actual backend schema. Spec currently documents Spanish names that mismatch reality.

## Impact

- `frontend/src/entities/address/AddressForm.tsx` — field names, interface, add street_number
- `frontend/src/entities/address/AddressCard.tsx` — interface field names
- `frontend/src/pages/CheckoutPage.tsx` — GET unwrapping, URL constant
- `openspec/specs/address-management/spec.md` — field names in scenarios
