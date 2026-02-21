import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

import AntdGlobalProvider from "@/contexts/AntdGlobalProvider";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Ameritas LLM";

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
      <body className={sourceSans3.className}>
        <AntdGlobalProvider>{children}</AntdGlobalProvider>
      </body>
    </html>
  );
}
