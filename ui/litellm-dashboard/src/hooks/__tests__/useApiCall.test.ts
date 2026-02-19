import { renderHook, act, waitFor } from "@testing-library/react";
import { useApiCall, useApiAction } from "../useApiCall";

// Mock NotificationsManager
jest.mock("@/components/molecules/notifications_manager", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    fromBackend: jest.fn(),
  },
}));

import NotificationsManager from "@/components/molecules/notifications_manager";

describe("useApiCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with correct default state", () => {
    const apiFunction = jest.fn().mockResolvedValue({ data: "test" });
    const { result } = renderHook(() => useApiCall(apiFunction));

    expect(result.current.state).toEqual({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  });

  it("sets loading state when execute is called", async () => {
    const apiFunction = jest.fn().mockResolvedValue({ data: "test" });
    const { result } = renderHook(() => useApiCall(apiFunction));

    act(() => {
      result.current.execute();
    });

    expect(result.current.state.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  it("updates state with data on successful call", async () => {
    const testData = { id: 1, name: "Test" };
    const apiFunction = jest.fn().mockResolvedValue(testData);
    const { result } = renderHook(() => useApiCall(apiFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.state).toEqual({
      data: testData,
      isLoading: false,
      error: null,
      isSuccess: true,
    });
  });

  it("updates state with error on failed call", async () => {
    const error = new Error("API Error");
    const apiFunction = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useApiCall(apiFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.state.error).toBe("API Error");
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.isSuccess).toBe(false);
  });

  it("shows error notification by default on failure", async () => {
    const error = new Error("API Error");
    const apiFunction = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useApiCall(apiFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(NotificationsManager.fromBackend).toHaveBeenCalledWith(error);
  });

  it("does not show error notification when disabled", async () => {
    const error = new Error("API Error");
    const apiFunction = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() =>
      useApiCall(apiFunction, { showErrorNotification: false })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(NotificationsManager.fromBackend).not.toHaveBeenCalled();
  });

  it("shows success notification when enabled", async () => {
    const apiFunction = jest.fn().mockResolvedValue({ data: "test" });
    const { result } = renderHook(() =>
      useApiCall(apiFunction, {
        showSuccessNotification: true,
        successMessage: "Operation successful!",
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(NotificationsManager.success).toHaveBeenCalledWith("Operation successful!");
  });

  it("calls onSuccess callback on successful call", async () => {
    const onSuccess = jest.fn();
    const apiFunction = jest.fn().mockResolvedValue({ data: "test" });
    const { result } = renderHook(() =>
      useApiCall(apiFunction, { onSuccess })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("calls onError callback on failed call", async () => {
    const onError = jest.fn();
    const error = new Error("API Error");
    const apiFunction = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() =>
      useApiCall(apiFunction, { onError })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("passes arguments to the API function", async () => {
    const apiFunction = jest.fn().mockResolvedValue({ data: "test" });
    const { result } = renderHook(() =>
      useApiCall((id: string, name: string) => apiFunction(id, name))
    );

    await act(async () => {
      await result.current.execute("123", "TestName");
    });

    expect(apiFunction).toHaveBeenCalledWith("123", "TestName");
  });

  it("resets state when reset is called", async () => {
    const apiFunction = jest.fn().mockResolvedValue({ data: "test" });
    const { result } = renderHook(() => useApiCall(apiFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.state.data).toEqual({ data: "test" });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  });

  it("allows setting data manually", () => {
    const apiFunction = jest.fn().mockResolvedValue({ data: "test" });
    const { result } = renderHook(() => useApiCall(apiFunction));

    act(() => {
      result.current.setData({ manual: "data" });
    });

    expect(result.current.state.data).toEqual({ manual: "data" });
  });
});

describe("useApiAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides simplified interface for actions", async () => {
    const apiFunction = jest.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useApiAction(apiFunction));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await result.current.execute();
    });

    expect(apiFunction).toHaveBeenCalled();
  });

  it("tracks loading state", async () => {
    const apiFunction = jest.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useApiAction(apiFunction));

    act(() => {
      result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("tracks error state", async () => {
    const error = new Error("Action failed");
    const apiFunction = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() =>
      useApiAction(apiFunction, { showErrorNotification: false })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe("Action failed");
  });
});
