import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { SocketProvider } from "@/contexts/socket-context";
import { ThemeProvider as ChatThemeProvider } from "@/contexts/theme-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { ToastProvider, ToastListener } from "@/components/ui/use-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebChat",
  description: "Real-time web chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AuthProvider>
              <SocketProvider>
                <ChatThemeProvider>
                  <SidebarProvider>
                    {children}
                    <ToastListener />
                  </SidebarProvider>
                </ChatThemeProvider>
              </SocketProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import "./globals.css";
