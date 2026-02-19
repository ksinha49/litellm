/**
 * Shared API types for the LiteLLM Dashboard
 *
 * This file contains type definitions for API responses and common data structures.
 * Import these types instead of using `any` for better type safety.
 */

// ============================================================================
// Error Handling Types
// ============================================================================

/**
 * Standard API error response from the backend
 */
export interface ApiError {
  error?: string;
  message?: string;
  detail?: string | { error: string };
  code?: string | number;
  status?: number;
}

/**
 * Type guard to check if an error is an API error response
 */
export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== "object" || error === null) return false;
  return "error" in error || "message" in error || "detail" in error;
}

/**
 * Extracts error message from unknown error type
 * Use this instead of casting to `any`
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isApiError(error)) {
    if (typeof error.detail === "string") return error.detail;
    if (typeof error.detail === "object" && error.detail?.error) {
      return error.detail.error;
    }
    return error.error || error.message || "An unknown error occurred";
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

// ============================================================================
// API Response Wrapper Types
// ============================================================================

/**
 * Generic paginated response from list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  current_page: number;
  total_pages: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

// ============================================================================
// Common Data Types
// ============================================================================

/**
 * Standard metadata object used across entities
 */
export type Metadata = Record<string, unknown>;

/**
 * Model configuration parameters
 */
export interface LiteLLMParams {
  model: string;
  api_key?: string;
  api_base?: string;
  custom_llm_provider?: string;
  [key: string]: unknown;
}

/**
 * Standard budget configuration
 */
export interface BudgetConfig {
  max_budget: number | null;
  budget_duration: string | null;
  budget_reset_at?: string;
  soft_budget?: number;
}

/**
 * Standard rate limit configuration
 */
export interface RateLimitConfig {
  tpm_limit: number | null;
  rpm_limit: number | null;
  max_parallel_requests?: number;
}

// ============================================================================
// Form Value Types
// ============================================================================

/**
 * Base type for form values - use specific interfaces where possible
 */
export type FormValues = Record<string, unknown>;

/**
 * Key creation form values
 */
export interface KeyCreateFormValues {
  key_alias?: string;
  duration?: string;
  models?: string[];
  max_budget?: number;
  team_id?: string;
  metadata?: Metadata;
  tpm_limit?: number;
  rpm_limit?: number;
  budget_duration?: string;
  allowed_cache_controls?: string[];
  blocked?: boolean;
  [key: string]: unknown;
}

/**
 * User creation form values
 */
export interface UserCreateFormValues {
  user_email: string;
  user_role?: string;
  max_budget?: number;
  budget_duration?: string;
  models?: string[];
  team_id?: string;
  metadata?: Metadata;
  [key: string]: unknown;
}

/**
 * Team creation form values
 */
export interface TeamCreateFormValues {
  team_alias: string;
  models?: string[];
  max_budget?: number;
  budget_duration?: string;
  tpm_limit?: number;
  rpm_limit?: number;
  organization_id?: string;
  metadata?: Metadata;
  [key: string]: unknown;
}

/**
 * Model creation form values
 */
export interface ModelCreateFormValues {
  model_name: string;
  litellm_params: LiteLLMParams;
  model_info?: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================================================
// Callback Types
// ============================================================================

/**
 * Standard refresh callback used across components
 */
export type RefreshCallback = () => void | Promise<void>;

/**
 * Standard delete callback
 */
export type DeleteCallback = (id: string) => void | Promise<void>;

/**
 * Standard selection callback
 */
export type SelectCallback<T> = (item: T) => void;

// ============================================================================
// Re-exports from existing type files
// ============================================================================

// These are re-exported for convenience - prefer importing from the original files
// when working within those modules
export type { Setter } from "@/types";
export type { UserInfo } from "@/components/view_users/types";
export type { Team, KeyResponse } from "@/components/key_team_helpers/key_list";
