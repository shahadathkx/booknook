"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { useHydrated } from "@/hooks/use-hydrated";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useHydrated();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle theme"
        className="rounded-full text-muted-foreground"
      >
        <span className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "booknook-dark" || theme === "booknook-dark";

  const toggleTheme = () => {
    setTheme(isDark ? "booknook-light" : "booknook-dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark forest theme"}
      className="rounded-full text-muted-foreground hover:text-[#8fd9a8] transition-colors"
    >
      {isDark ? (
        <HiOutlineSun className="size-4 text-[#8fd9a8]" />
      ) : (
        <HiOutlineMoon className="size-4 text-emerald-800" />
      )}
    </Button>
  );
}
