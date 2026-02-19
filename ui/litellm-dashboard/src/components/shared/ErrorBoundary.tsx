"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Card, Text, Title } from "@tremor/react";
import { RiRefreshLine, RiAlertLine } from "@remixicon/react";
import NotificationsManager from "../molecules/notifications_manager";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to show instead of the default error card */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** If true, shows a minimal inline error instead of a full card */
  inline?: boolean;
  /** Context name for error reporting */
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for catching React rendering errors
 *
 * Wraps components to catch JavaScript errors anywhere in their child component tree,
 * log those errors, and display a fallback UI instead of crashing the entire app.
 *
 * Usage:
 *   <ErrorBoundary context="UserSettings">
 *     <UserSettingsPanel />
 *   </ErrorBoundary>
 *
 * With custom fallback:
 *   <ErrorBoundary fallback={<Text>Something went wrong</Text>}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, context } = this.props;

    // Log error to console (this will be visible even in production)
    console.error(
      `[ErrorBoundary${context ? `:${context}` : ""}] Caught error:`,
      error,
      errorInfo
    );

    // Store error info for display
    this.setState({ errorInfo });

    // Call optional error callback
    if (onError) {
      onError(error, errorInfo);
    }

    // Show notification to user
    NotificationsManager.error({
      message: "Component Error",
      description: `An error occurred${context ? ` in ${context}` : ""}. Please try refreshing.`,
      duration: 8,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, inline, context } = this.props;

    if (!hasError) {
      return children;
    }

    // Use custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Inline error display
    if (inline) {
      return (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <RiAlertLine className="h-4 w-4" />
          <span>Error{context ? ` in ${context}` : ""}</span>
          <button
            onClick={this.handleReset}
            className="ml-auto text-red-600 hover:text-red-800 underline text-xs"
          >
            Try again
          </button>
        </div>
      );
    }

    // Default error card
    return (
      <Card className="max-w-lg mx-auto mt-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <RiAlertLine className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <Title className="text-lg text-red-900">Something went wrong</Title>
            <Text className="mt-1 text-gray-600">
              {context
                ? `An error occurred in the ${context} component.`
                : "An unexpected error occurred in this component."}
            </Text>
            {process.env.NODE_ENV === "development" && error && (
              <details className="mt-3">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Error details
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-40">
                  {error.message}
                  {"\n\n"}
                  {error.stack}
                </pre>
              </details>
            )}
            <div className="mt-4 flex gap-2">
              <Button
                size="xs"
                variant="secondary"
                icon={RiRefreshLine}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                size="xs"
                variant="light"
                onClick={this.handleRefresh}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }
}

/**
 * Higher-order component to wrap any component with an error boundary
 *
 * Usage:
 *   const SafeUserSettings = withErrorBoundary(UserSettings, { context: "UserSettings" });
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  boundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...boundaryProps} context={boundaryProps?.context || displayName}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WithErrorBoundary;
}

export default ErrorBoundary;
