// Typed API client helpers wrapping the Axios instance
import apiClient from './axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Generic GET request
 */
export async function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return apiClient.get<T>(url, { params, ...config })
}

/**
 * Generic POST request
 */
export async function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return apiClient.post<T>(url, data, config)
}

/**
 * Generic PATCH request
 */
export async function patch<T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return apiClient.patch<T>(url, data, config)
}

/**
 * Generic DELETE request
 */
export async function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return apiClient.delete<T>(url, config)
}

/**
 * Paginated list response type used across all endpoints
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}
