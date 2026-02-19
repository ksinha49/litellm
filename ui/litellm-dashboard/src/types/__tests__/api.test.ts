import { isApiError, getErrorMessage, ApiError } from "../api";

describe("API Type Utilities", () => {
  describe("isApiError", () => {
    it("returns true for objects with error property", () => {
      const error: ApiError = { error: "Something went wrong" };
      expect(isApiError(error)).toBe(true);
    });

    it("returns true for objects with message property", () => {
      const error: ApiError = { message: "Something went wrong" };
      expect(isApiError(error)).toBe(true);
    });

    it("returns true for objects with detail property", () => {
      const error: ApiError = { detail: "Something went wrong" };
      expect(isApiError(error)).toBe(true);
    });

    it("returns true for objects with nested detail.error", () => {
      const error: ApiError = { detail: { error: "Nested error" } };
      expect(isApiError(error)).toBe(true);
    });

    it("returns false for null", () => {
      expect(isApiError(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isApiError(undefined)).toBe(false);
    });

    it("returns false for strings", () => {
      expect(isApiError("error message")).toBe(false);
    });

    it("returns false for numbers", () => {
      expect(isApiError(404)).toBe(false);
    });

    it("returns false for objects without error/message/detail", () => {
      expect(isApiError({ status: 500 })).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("extracts message from Error instance", () => {
      const error = new Error("Test error");
      expect(getErrorMessage(error)).toBe("Test error");
    });

    it("extracts error from ApiError with error property", () => {
      const error: ApiError = { error: "API error" };
      expect(getErrorMessage(error)).toBe("API error");
    });

    it("extracts message from ApiError with message property", () => {
      const error: ApiError = { message: "API message" };
      expect(getErrorMessage(error)).toBe("API message");
    });

    it("extracts string detail from ApiError", () => {
      const error: ApiError = { detail: "Detail message" };
      expect(getErrorMessage(error)).toBe("Detail message");
    });

    it("extracts nested detail.error from ApiError", () => {
      const error: ApiError = { detail: { error: "Nested error message" } };
      expect(getErrorMessage(error)).toBe("Nested error message");
    });

    it("returns string directly when passed a string", () => {
      expect(getErrorMessage("Plain error string")).toBe("Plain error string");
    });

    it("returns default message for unknown error types", () => {
      expect(getErrorMessage(123)).toBe("An unknown error occurred");
      expect(getErrorMessage(null)).toBe("An unknown error occurred");
      expect(getErrorMessage(undefined)).toBe("An unknown error occurred");
      expect(getErrorMessage({})).toBe("An unknown error occurred");
    });

    it("prioritizes detail over error and message", () => {
      const error: ApiError = {
        detail: "Detail message",
        error: "Error message",
        message: "Message",
      };
      expect(getErrorMessage(error)).toBe("Detail message");
    });
  });
});
