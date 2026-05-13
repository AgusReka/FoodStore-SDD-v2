## 1. Fix AddressForm field names and add street_number

- [x] 1.1 Update `AddressFormData` interface: rename fields to `street`, `city`, `postal_code`, add `street_number`
- [x] 1.2 Update state variables and input handlers to English names
- [x] 1.3 Add `street_number` input field with placeholder "N°" (nullable, optional)
- [x] 1.4 Update `post()` payload to send `street`, `city`, `postal_code`, `street_number`
- [x] 1.5 Update form validation to include English field names

## 2. Fix AddressCard interface to match DireccionRead

- [x] 2.1 Rename `Address` interface fields: `calle` → `street`, `ciudad` → `city`, `codigo_postal` → `postal_code`, `es_principal` → `is_primary`
- [x] 2.2 Update JSX to display the renamed fields
- [x] 2.3 Update `is_primary` conditional rendering

## 3. Fix CheckoutPage GET response unwrapping and URL

- [x] 3.1 Replace hardcoded `'/api/v1/direcciones'` with `ENDPOINTS.ADDRESSES_LIST`
- [x] 3.2 Update `useQuery` to type as `PaginatedResponse<Address>` and unwrap `response.data.items`
- [x] 3.3 Import `PaginatedResponse` type from `@shared/api/client`
- [x] 3.4 Remove redundant `Array.isArray` check (data is always `items[]`)

## 4. Fix CheckoutPage inline Address interface

- [x] 4.1 Align the local `Address` interface in CheckoutPage with updated field names (`street`, `city`, `postal_code`, `is_primary`)

## 5. Update spec for address-management

- [x] 5.1 After apply, archive the change to sync the delta spec changes into `openspec/specs/address-management/spec.md`
