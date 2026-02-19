"use client";

import { useState, useCallback, useRef } from "react";
import NotificationsManager from "@/components/molecules/notifications_manager";
import { getErrorMessage } from "@/types/api";

/**
 * State returned by useApiCall hook
 */
export interface ApiCallState<T> {
  /** The data returned from the API call */
  data: T | null;
  /** Whether the API call is in progress */
  isLoading: boolean;
  /** Error message if the call failed */
  error: string | null;
  /** Whether the call completed successfully */
  isSuccess: boolean;
}

/**
 * Options for configuring the API call behavior
 */
export interface UseApiCallOptions {
  /** Show success notification on completion (default: false) */
  showSuccessNotification?: boolean;
  /** Custom success message */
  successMessage?: string;
  /** Show error notification on failure (default: true) */
  showErrorNotification?: boolean;
  /** Custom error message prefix */
  errorMessagePrefix?: string;
  /** Callback on successful completion */
  onSuccess?: () => void;
  /** Callback on error */
  onError?: (error: unknown) => void;
  /** Reset data when starting a new call (default: true) */
  resetOnCall?: boolean;
}

/**
 * Return type for useApiCall hook
 */
export interface UseApiCallReturn<T, TArgs extends unknown[]> {
  /** Current state of the API call */
  state: ApiCallState<T>;
  /** Function to execute the API call */
  execute: (...args: TArgs) => Promise<T | null>;
  /** Reset state to initial values */
  reset: () => void;
  /** Set data manually (useful for optimistic updates) */
  setData: (data: T | null) => void;
}

const initialState = <T>(): ApiCallState<T> => ({
  data: null,
  isLoading: false,
  error: null,
  isSuccess: false,
});

/**
 * Custom hook for making API calls with standardized loading, error, and success states
 *
 * This hook provides:
 * - Loading state management
 * - Error handling with automatic notifications
 * - Success notifications (optional)
 * - Abort controller for cleanup
 * - Callbacks for success/error handling
 *
 * Usage:
 *   const { state, execute } = useApiCall(
 *     (userId: string) => userGetCall(accessToken, userId),
 *     { showSuccessNotification: true, successMessage: "User loaded!" }
 *   );
 *
 *   // In your component
 *   useEffect(() => {
 *     execute(userId);
 *   }, [userId, execute]);
 *
 *   if (state.isLoading) return <Spinner />;
 *   if (state.error) return <ErrorMessage message={state.error} />;
 *   if (state.data) return <UserCard user={state.data} />;
 *
 * @param apiFunction - The async function to call
 * @param options - Configuration options
 * @returns Object with state, execute function, reset function, and setData function
 */
export function useApiCall<T, TArgs extends unknown[] = []>(
  apiFunction: (...args: TArgs) => Promise<T>,
  options: UseApiCallOptions = {}
): UseApiCallReturn<T, TArgs> {
  const {
    showSuccessNotification = false,
    successMessage = "Operation completed successfully",
    showErrorNotification = true,
    errorMessagePrefix = "",
    onSuccess,
    onError,
    resetOnCall = true,
  } = options;

  const [state, setState] = useState<ApiCallState<T>>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(initialState);
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Reset or start loading
      if (resetOnCall) {
        setState({
          data: null,
          isLoading: true,
          error: null,
          isSuccess: false,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
          isSuccess: false,
        }));
      }

      try {
        const result = await apiFunction(...args);

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        setState({
          data: result,
          isLoading: false,
          error: null,
          isSuccess: true,
        });

        if (showSuccessNotification) {
          NotificationsManager.success(successMessage);
        }

        onSuccess?.();
        return result;
      } catch (error: unknown) {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        const errorMessage = getErrorMessage(error);
        const fullErrorMessage = errorMessagePrefix
          ? `${errorMessagePrefix}: ${errorMessage}`
          : errorMessage;

        setState({
          data: null,
          isLoading: false,
          error: fullErrorMessage,
          isSuccess: false,
        });

        if (showErrorNotification) {
          NotificationsManager.fromBackend(error);
        }

        // Always log errors to console for debugging
        console.error("[useApiCall] API call failed:", error);

        onError?.(error);
        return null;
      }
    },
    [
      apiFunction,
      showSuccessNotification,
      successMessage,
      showErrorNotification,
      errorMessagePrefix,
      onSuccess,
      onError,
      resetOnCall,
    ]
  );

  return { state, execute, reset, setData };
}

/**
 * Simplified version for one-off API calls that don't need persistent state
 *
 * Usage:
 *   const deleteUser = useApiAction(
 *     () => userDeleteCall(accessToken, userId),
 *     {
 *       showSuccessNotification: true,
 *       successMessage: "User deleted",
 *       onSuccess: () => refreshUserList()
 *     }
 *   );
 *
 *   <Button onClick={deleteUser.execute} loading={deleteUser.isLoading}>
 *     Delete
 *   </Button>
 */
export function useApiAction<TArgs extends unknown[] = []>(
  apiFunction: (...args: TArgs) => Promise<unknown>,
  options: Omit<UseApiCallOptions, "resetOnCall"> = {}
): {
  execute: (...args: TArgs) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} {
  const { state, execute: baseExecute } = useApiCall(apiFunction, {
    ...options,
    resetOnCall: true,
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      await baseExecute(...args);
    },
    [baseExecute]
  );

  return {
    execute,
    isLoading: state.isLoading,
    error: state.error,
  };
}

export default useApiCall;
