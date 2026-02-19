import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AntdGlobalProvider from "@/contexts/AntdGlobalProvider";

const inter = Inter({ subsets: ["latin"] });

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Ameritas LiteLLM";

export const metadata: Metadata = {
  title: `${appName} Dashboard`,
  description: `${appName} Proxy Admin UI`,
  icons: { icon: "./favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdGlobalProvider>{children}</AntdGlobalProvider>
      </body>
    </html>
  );
}
