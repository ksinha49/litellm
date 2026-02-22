"use client";

import React, { Suspense, useEffect, useState } from "react";
import AnalyticsDashboardView from "@/components/AnalyticsDashboard/AnalyticsDashboardView";

function getCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((row) => row.startsWith(name + "="));
  if (!match) return null;
  const value = match.slice(name.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function AnalyticsPageContent() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  return <AnalyticsDashboardView accessToken={accessToken} />;
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <AnalyticsPageContent />
    </Suspense>
  );
}
