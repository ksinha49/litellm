"use client";

import React, { useEffect, useRef } from "react";
import { ConfigProvider, notification } from "antd";
import { setNotificationInstance } from "@/components/molecules/notifications_manager";

const ameritasTheme = {
  token: {
    colorPrimary: "#d3222a",
    colorLink: "#0058db",
    colorLinkHover: "#0758ac",
    colorText: "#333333",
    colorTextSecondary: "#595959",
    colorBorder: "#cccccc",
    colorBgLayout: "#f5f5f5",
    borderRadius: 4,
    fontFamily: "'Source Sans 3', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Button: {
      colorPrimary: "#d3222a",
      colorPrimaryHover: "#b20d15",
      colorPrimaryActive: "#8a0a10",
      borderRadius: 4,
    },
    Input: {
      borderRadius: 4,
      colorBorder: "#cccccc",
      colorPrimaryHover: "#0058db",
    },
    Card: {
      borderRadius: 8,
    },
  },
};

export default function AntdGlobalProvider({ children }: { children: React.ReactNode }) {
  const [api, contextHolder] = notification.useNotification();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setNotificationInstance(api);
      initialized.current = true;
    }
  }, [api]);

  return (
    <ConfigProvider theme={ameritasTheme}>
      {contextHolder}
      {children}
    </ConfigProvider>
  );
}
