"use client";

import { useLogin } from "@/app/(dashboard)/hooks/login/useLogin";
import { useUIConfig } from "@/app/(dashboard)/hooks/uiConfig/useUIConfig";
import LoadingScreen from "@/components/common_components/LoadingScreen";
import { getProxyBaseUrl } from "@/components/networking";
import { getCookie } from "@/utils/cookieUtils";
import { isJwtExpired } from "@/utils/jwtUtils";
import { FileTextOutlined, HomeOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Alert, Button, Form, Input, Popover, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Ameritas LLM";
const rootPath = process.env.NEXT_PUBLIC_SERVER_ROOT_PATH || "";

function LoginPageContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { data: uiConfig, isLoading: isConfigLoading } = useUIConfig();
  const loginMutation = useLogin();
  const router = useRouter();

  useEffect(() => {
    if (isConfigLoading) {
      return;
    }

    // Check if admin UI is disabled
    if (uiConfig && uiConfig.admin_ui_disabled) {
      setIsLoading(false);
      return;
    }

    const rawToken = getCookie("token");
    if (rawToken && !isJwtExpired(rawToken)) {
      router.replace(`${getProxyBaseUrl()}/ui`);
      return;
    }

    if (uiConfig && uiConfig.auto_redirect_to_sso) {
      router.push(`${getProxyBaseUrl()}/sso/key/generate`);
      return;
    }

    setIsLoading(false);
  }, [isConfigLoading, router, uiConfig]);

  const handleSubmit = () => {
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: (data) => {
          router.push(data.redirect_url);
        },
      },
    );
  };

  const error = loginMutation.error instanceof Error ? loginMutation.error.message : null;
  const isLoginLoading = loginMutation.isPending;

  const { Title, Text, Paragraph } = Typography;

  if (isConfigLoading || isLoading) {
    return <LoadingScreen />;
  }

  // Show disabled message if admin UI is disabled
  if (uiConfig && uiConfig.admin_ui_disabled) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loginCard}>
          <div style={styles.logoSection}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${rootPath}/assets/logos/ameritas_logo.png`} alt={`${appName} logo`} style={{ height: 40, width: "auto" }} />
          </div>

          <Alert
            message="Admin UI Disabled"
            description={
              <>
                <Paragraph style={{ fontSize: 14, marginBottom: 8 }}>
                  The Admin UI has been disabled by the administrator. To re-enable it, please update the following
                  environment variable:
                </Paragraph>
                <Paragraph style={{ fontSize: 14, marginBottom: 0 }}>
                  <code style={styles.codeInline}>DISABLE_ADMIN_UI=False</code>
                </Paragraph>
              </>
            }
            type="warning"
            showIcon
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Top-left navigation buttons */}
      <div style={styles.topNav}>
        <Link href={`${rootPath}/hub`} style={styles.topNavButton} title="Hub">
          <HomeOutlined />
        </Link>
        <Link href={`${rootPath}/docs/`} style={styles.topNavButton} title="API Docs">
          <FileTextOutlined />
        </Link>
      </div>

      {/* Left branding panel */}
      <div style={styles.brandPanel}>
        <div style={styles.brandContent}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${rootPath}/assets/logos/ameritas_logo.png`}
            alt={`${appName} logo`}
            style={{ height: 48, width: "auto", marginBottom: 32 }}
          />
          <h1 style={styles.brandHeading}>LLM Gateway</h1>
          <p style={styles.brandSubtext}>
            Centralized AI model management, monitoring, and access control for your organization.
          </p>
          <div style={styles.brandDivider} />
          <p style={styles.brandFootnote}>
            Powered by LiteLLM Proxy
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div style={styles.loginPanel}>
        <div style={styles.loginCard}>
          <div style={styles.loginHeader}>
            <Title level={3} style={{ margin: 0, color: "#333333", fontWeight: 600 }}>
              Sign In
            </Title>
            <Text style={{ color: "#767676", fontSize: 15 }}>
              Access the {appName} Admin Console
            </Text>
          </div>

          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16, borderRadius: 6 }} />}

          <Form onFinish={handleSubmit} layout="vertical" requiredMark={false}>
            <Form.Item
              label={<span style={styles.formLabel}>Username</span>}
              name="username"
              rules={[{ required: true, message: "Please enter your username" }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#767676" }} />}
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoginLoading}
                size="large"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              label={<span style={styles.formLabel}>Password</span>}
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#767676" }} />}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoginLoading}
                size="large"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoginLoading}
                disabled={isLoginLoading}
                block
                size="large"
                style={styles.primaryButton}
              >
                {isLoginLoading ? "Signing in..." : "Sign In"}
              </Button>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              {!uiConfig?.sso_configured ? (
                <Popover
                  content="Please configure SSO to log in with SSO."
                  trigger="hover"
                >
                  <Button disabled block size="large" style={styles.ssoButton}>
                    Sign In with SSO
                  </Button>
                </Popover>
              ) : (
                <Button
                  disabled={isLoginLoading}
                  onClick={() =>
                    router.push(`${getProxyBaseUrl()}/sso/key/generate`)
                  }
                  block
                  size="large"
                  style={styles.ssoButton}
                >
                  Sign In with SSO
                </Button>
              )}
            </Form.Item>
          </Form>

          {uiConfig?.sso_configured && (
            <Alert
              type="info"
              showIcon
              closable
              style={{ marginTop: 16, borderRadius: 6, borderColor: "#b0d9f3", backgroundColor: "#eff8ff" }}
              message={
                <Text style={{ fontSize: 13 }}>
                  SSO is enabled. Auto-redirect is off. Set{" "}
                  <Text code>AUTO_REDIRECT_UI_LOGIN_TO_SSO=true</Text> to re-enable.
                </Text>
              }
            />
          )}

        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row" as const,
    position: "relative" as const,
  },
  brandPanel: {
    flex: "0 0 420px",
    background: "linear-gradient(165deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    position: "relative" as const,
    overflow: "hidden",
  },
  brandContent: {
    position: "relative" as const,
    zIndex: 1,
    maxWidth: 320,
  },
  brandHeading: {
    fontSize: 32,
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 16px 0",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  brandSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 1.6,
    margin: "0 0 32px 0",
  },
  brandDivider: {
    width: 48,
    height: 3,
    backgroundColor: "#d3222a",
    borderRadius: 2,
    marginBottom: 16,
  },
  brandFootnote: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.4)",
    margin: 0,
  },
  loginPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
    backgroundColor: "#f5f5f5",
  },
  loginCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: "40px 36px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04)",
  },
  loginHeader: {
    marginBottom: 28,
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#333333",
  },
  input: {
    borderRadius: 6,
    borderColor: "#cccccc",
  },
  primaryButton: {
    height: 44,
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 15,
    backgroundColor: "#d3222a",
    borderColor: "#d3222a",
  },
  ssoButton: {
    height: 44,
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 15,
    borderColor: "#0058db",
    color: "#0058db",
  },
  codeInline: {
    backgroundColor: "#f5f5f5",
    padding: "1px 6px",
    borderRadius: 3,
    fontSize: 12,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  logoSection: {
    textAlign: "center" as const,
    marginBottom: 24,
  },
  topNav: {
    position: "absolute" as const,
    top: 16,
    left: 16,
    display: "flex",
    gap: 8,
    zIndex: 10,
  },
  topNavButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 4,
    textDecoration: "none",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(4px)",
  },
};

export default function LoginPage() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <LoginPageContent />
    </QueryClientProvider>
  );
}
