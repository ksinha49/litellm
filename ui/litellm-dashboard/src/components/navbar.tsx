import { useHealthReadiness } from "@/app/(dashboard)/hooks/healthReadiness/useHealthReadiness";
import { getProxyBaseUrl } from "@/components/networking";
import { useTheme } from "@/contexts/ThemeContext";
import { clearTokenCookies } from "@/utils/cookieUtils";
import { fetchProxySettings } from "@/utils/proxyUtils";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Switch, Tag } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CommunityEngagementButtons } from "./Navbar/CommunityEngagementButtons/CommunityEngagementButtons";
import UserDropdown from "./Navbar/UserDropdown/UserDropdown";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Ameritas LLM";

interface NavbarProps {
  userID: string | null;
  userEmail: string | null;
  userRole: string | null;
  premiumUser: boolean;
  proxySettings: any;
  setProxySettings: React.Dispatch<React.SetStateAction<any>>;
  accessToken: string | null;
  isPublicPage: boolean;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  userID,
  userEmail,
  userRole,
  premiumUser,
  proxySettings,
  setProxySettings,
  accessToken,
  isPublicPage = false,
  sidebarCollapsed = false,
  onToggleSidebar,
  isDarkMode,
  toggleDarkMode
}) => {
  const baseUrl = getProxyBaseUrl();
  const [logoutUrl, setLogoutUrl] = useState("");
  const { logoUrl } = useTheme();
  const { data: healthData } = useHealthReadiness();
  const version = healthData?.litellm_version;

  const rootPath = process.env.NEXT_PUBLIC_SERVER_ROOT_PATH || "";
  const defaultLogoUrl = `${rootPath}/assets/logos/ameritas_logo.png`;
  const imageUrl = logoUrl || defaultLogoUrl;

  useEffect(() => {
    const initializeProxySettings = async () => {
      if (accessToken) {
        const settings = await fetchProxySettings(accessToken);
        console.log("response from fetchProxySettings", settings);
        if (settings) {
          setProxySettings(settings);
        }
      }
    };

    initializeProxySettings();
  }, [accessToken]);

  useEffect(() => {
    setLogoutUrl(proxySettings?.PROXY_LOGOUT_URL || "");
  }, [proxySettings]);

  const handleLogout = () => {
    clearTokenCookies();
    window.location.href = logoutUrl;
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="w-full">
        <div className="flex items-center h-14 px-4">
          <div className="flex items-center flex-shrink-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="flex items-center justify-center w-10 h-10 mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <span className="text-lg">{sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center" aria-label={`${appName} Home`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- Logo URL can be external/dynamic */}
                <img
                  src={imageUrl}
                  alt={`${appName} logo`}
                  className="h-8 object-contain"
                  style={{ width: "auto", maxWidth: "160px" }}
                />
              </Link>
              {version && (
                <Tag className="text-xs font-medium cursor-pointer">
                  <a
                    href="https://docs.litellm.ai/release_notes"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    v{version}
                  </a>
                </Tag>
              )}
            </div>
          </div>
          {/* Right side nav items */}
          <div className="flex items-center space-x-5 ml-auto">
            {isPublicPage ? (
              <>
                <a
                  href="/docs"
                  className="text-sm font-medium transition-colors"
                  style={{ color: "#377dd0" }}
                >
                  API Docs
                </a>
                <a
                  href="/ui/analytics"
                  className="text-sm font-medium transition-colors"
                  style={{ color: "#377dd0" }}
                >
                  Analytics
                </a>
                <a
                  href="/ui"
                  className="text-sm font-medium px-4 py-2 transition-colors"
                  style={{
                    backgroundColor: "#377dd0",
                    color: "#ffffff",
                    borderRadius: "9999px",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#0758ac"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#377dd0"; }}
                >
                  Console
                </a>
              </>
            ) : (
              <>
                <CommunityEngagementButtons />
                {/* Dark mode is currently a work in progress. To test, you can change 'false' to 'true' below.
                Do not set this to true by default until all components are confirmed to support dark mode styles. */}
                {false && <Switch
                  data-testid="dark-mode-toggle"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                  checkedChildren={<MoonOutlined />}
                  unCheckedChildren={<SunOutlined />}
                />}
                <a
                  href="https://docs.litellm.ai/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Docs
                </a>
                <UserDropdown onLogout={handleLogout} />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
