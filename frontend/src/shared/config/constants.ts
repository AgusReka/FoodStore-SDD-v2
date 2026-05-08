// App-wide constants for the FoodStore frontend

// localStorage keys for auth persistence
export const ACCESS_TOKEN_KEY = 'foodstore_access_token'
export const REFRESH_TOKEN_KEY = 'foodstore_refresh_token'

// Token expiry times
export const ACCESS_TOKEN_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes
export const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// TanStack Query defaults
export const STALE_TIME = 5 * 60 * 1000 // 5 minutes
export const RETRY_COUNT = 1
export const REFETCH_ON_WINDOW_FOCUS = false

// Pagination defaults
export const PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// API defaults
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const API_PREFIX = '/api/v1'

// UI defaults
export const TOAST_DURATION_MS = 4000
export const SIDEBAR_WIDTH = 280
