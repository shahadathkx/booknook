"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="booknook-dark"
      enableSystem={false}
      themes={["booknook-dark", "booknook-light"]}
      {...props}
    >
      <ThemeSync />
      {children}
      <CustomToaster />
    </NextThemesProvider>
  );
}

/**
 * Synchronizes the Tailwind 'dark' class with the active DaisyUI theme.
 */
function ThemeSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (resolvedTheme === "booknook-dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [resolvedTheme]);

  return null;
}

/**
 * Hot-toast container styled specifically for BookNook's forest-green & mint palette
 */
function CustomToaster() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "booknook-light";

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: isDark ? "#15251d" : "#ffffff",
          color: isDark ? "#e6f0ea" : "#122119",
          border: isDark ? "1px solid #1f362b" : "1px solid #d8e3da",
          borderRadius: "1rem",
          boxShadow: isDark
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)"
            : "0 10px 25px -5px rgba(18, 33, 25, 0.1), 0 8px 10px -6px rgba(18, 33, 25, 0.05)",
          padding: "10px 16px",
          fontSize: "12px",
        },
        success: {
          iconTheme: {
            primary: "#8fd9a8",
            secondary: isDark ? "#0e1a14" : "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#f87171",
            secondary: isDark ? "#0e1a14" : "#ffffff",
          },
        },
      }}
    />
  );
}
