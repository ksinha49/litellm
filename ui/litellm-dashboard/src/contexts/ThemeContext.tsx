import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getProxyBaseUrl } from '@/components/networking'

const resolveLogoPath = (path: string): string => {
  const rootPath = process.env.NEXT_PUBLIC_SERVER_ROOT_PATH || ''
  if (!path) {
    return path
  }
  if (/^https?:\/\//.test(path) || (rootPath && path.startsWith(rootPath))) {
    return path
  }
  if (path.startsWith('/')) {
    return `${rootPath}${path}`
  }
  return `${rootPath}/${path}`
}

interface ThemeContextType {
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  accessToken?: string | null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, accessToken }) => {
  const defaultLogoUrl = resolveLogoPath('/ui/favicon.png')
  const initialLogoUrl = process.env.NEXT_PUBLIC_LOGO_PATH
    ? resolveLogoPath(process.env.NEXT_PUBLIC_LOGO_PATH)
    : defaultLogoUrl
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl)

  // Load logo URL from backend on mount
  useEffect(() => {
    const loadLogoSettings = async () => {
      if (accessToken) {
        try {
          const proxyBaseUrl = getProxyBaseUrl();
          const url = proxyBaseUrl ? `${proxyBaseUrl}/get/ui_theme_settings` : '/get/ui_theme_settings';
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.values?.logo_url) {
              setLogoUrl(resolveLogoPath(data.values.logo_url))
            }
          }
        } catch (error) {
          console.warn('Failed to load logo settings from backend:', error);
          setLogoUrl(defaultLogoUrl);
        }
      }
    };

    loadLogoSettings();
  }, [accessToken, defaultLogoUrl]);

  return (
    <ThemeContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </ThemeContext.Provider>
  );
};