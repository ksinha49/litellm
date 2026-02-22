"use client";

import React, { Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/navbar";
import AnalyticsDashboardView from "@/components/AnalyticsDashboard/AnalyticsDashboardView";

const queryClient = new QueryClient();

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
  const [proxySettings, setProxySettings] = useState<any>({});

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider accessToken={accessToken}>
        <div className="min-h-screen bg-white">
          <Navbar
            userID={null}
            userEmail={null}
            userRole={null}
            premiumUser={false}
            setProxySettings={setProxySettings}
            proxySettings={proxySettings}
            accessToken={accessToken}
            isPublicPage={true}
            isDarkMode={false}
            toggleDarkMode={() => {}}
          />
          <AnalyticsDashboardView accessToken={accessToken} />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
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
