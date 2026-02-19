"use client";

import React, { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Button, Card, Text, Title } from "@tremor/react";
import { RiAlertLine, RiRefreshLine } from "@remixicon/react";

interface RootErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Root-level error boundary for the entire application
 *
 * This provides a full-page error fallback when something goes catastrophically wrong.
 * It's designed to be used in the root layout to catch any unhandled errors.
 *
 * Usage in layout.tsx:
 *   <RootErrorBoundary>
 *     {children}
 *   </RootErrorBoundary>
 */
export function RootErrorBoundary({ children }: RootErrorBoundaryProps) {
  return (
    <ErrorBoundary
      context="Application"
      fallback={<AppErrorFallback />}
      onError={(error) => {
        // Log to any external error tracking service here
        console.error("[RootErrorBoundary] Application error:", error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Full-page error fallback component
 */
function AppErrorFallback() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/ui/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <RiAlertLine className="h-8 w-8 text-red-600" />
          </div>
          <Title className="text-xl text-gray-900">Application Error</Title>
          <Text className="mt-2 text-gray-600">
            Something went wrong while loading the application. This error has been logged.
          </Text>
          <div className="mt-6 flex gap-3 justify-center">
            <Button
              variant="primary"
              icon={RiRefreshLine}
              onClick={handleRefresh}
            >
              Refresh Page
            </Button>
            <Button
              variant="secondary"
              onClick={handleGoHome}
            >
              Go to Home
            </Button>
          </div>
          <Text className="mt-6 text-xs text-gray-400">
            If this problem persists, please contact your administrator.
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default RootErrorBoundary;
