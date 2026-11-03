"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { siteConfig } from "@/lib/config";
import { notify } from "@/lib/notify";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { BookNookButton } from "@/components/ui/booknook-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RiBookReadLine,
  RiMenu4Line,
  RiCloseLine,
  RiUser3Line,
  RiLogoutBoxRLine,
  RiBookMarkedLine,
  RiFileList3Line,
  RiAddCircleLine,
  RiCompass3Line,
} from "react-icons/ri";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      notify.success("Logged Out", "You have safely disconnected your reader session.");
      router.push("/");
      router.refresh();
    } catch {
      notify.error("Logout Error", "Unable to complete logout. Please try again.");
    }
  };


  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "All Books", href: "/books" },
  ];

  const authenticatedLinks = [
    { name: "Add Book", href: "/add-book" },
    { name: "My Books", href: "/my-books" },
    { name: "My Borrows", href: "/my-borrows" },
  ];

  const allNavLinks = user ? [...publicLinks, ...authenticatedLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        { }
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="size-9 rounded-2xl bg-gradient-to-br from-[#1a382a] via-[#15251d] to-[#0e1a14] border border-[#1f362b] shadow-sm flex items-center justify-center text-[#8fd9a8] transition-transform duration-200 group-hover:scale-105">
              <RiBookReadLine className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-serif text-xl font-bold tracking-tight text-foreground">
                {siteConfig.appName}
              </span>
              <span className="hidden lg:inline-flex items-center text-[10px] py-0.5 px-2 rounded-full font-bold uppercase tracking-wider bg-[#e0915a]/15 text-[#e0915a] border border-[#e0915a]/25">
                <RiCompass3Line className="size-2.5 mr-1" />
                {siteConfig.libraryBranch}
              </span>
            </div>
          </Link>

          { }
          <nav className="hidden md:flex items-center gap-1">
            {allNavLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[#8fd9a8]/15 text-[#8fd9a8] font-bold border border-[#8fd9a8]/30 shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions, Theme Toggle & Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Auth Controls (With Skeleton to prevent layout flicker) */}
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 rounded-full bg-muted" />
              <Skeleton className="size-8 rounded-full bg-muted" />
            </div>
          ) : user ? (

            <DropdownMenu>
              <DropdownMenuTrigger
                className="cursor-pointer inline-flex items-center gap-2 p-1 rounded-full border border-border hover:border-mint-accent/50 bg-card transition-all outline-none"
                aria-label="User account menu"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "Reader avatar"}
                    className="size-7 rounded-full object-cover border border-mint-accent/30"
                  />
                ) : (
                  <div className="size-7 rounded-full bg-[#8fd9a8] text-[#0e1a14] font-bold text-xs flex items-center justify-center select-none shadow-xs">
                    {(user.name || user.email || "R").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-foreground pr-2 max-w-[120px] truncate">
                  {user.name || user.email?.split("@")[0]}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-2xl border border-border bg-card text-card-foreground shadow-xl"
              >
                <DropdownMenuLabel className="p-2">
                  <p className="font-heading font-serif text-sm font-bold text-foreground truncate">
                    {user.name || "Library Reader"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-border" />

                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-muted hover:text-[#8fd9a8] flex items-center gap-2"
                >
                  <RiUser3Line className="size-4 text-mint-accent" />
                  <span>My Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/books/add")}
                  className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-muted hover:text-[#8fd9a8] flex items-center gap-2"
                >
                  <RiAddCircleLine className="size-4 text-[#8fd9a8]" />
                  <span>Add a Book</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/my-books")}
                  className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-muted hover:text-[#8fd9a8] flex items-center gap-2"
                >
                  <RiBookMarkedLine className="size-4 text-[#8fd9a8]" />
                  <span>My Books</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/my-borrows")}
                  className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer hover:bg-muted hover:text-[#8fd9a8] flex items-center gap-2"
                >
                  <RiFileList3Line className="size-4 text-[#e0915a]" />
                  <span>My Borrows</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-border" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 flex items-center gap-2"
                >
                  <RiLogoutBoxRLine className="size-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs border-border bg-card hover:bg-muted text-foreground"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <BookNookButton size="sm">Register</BookNookButton>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl text-foreground hover:bg-muted focus:outline-none"
          >
            {mobileMenuOpen ? (
              <RiCloseLine className="size-6 text-[#8fd9a8]" />
            ) : (
              <RiMenu4Line className="size-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col space-y-1">
            {allNavLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#8fd9a8]/15 text-[#8fd9a8] font-bold border border-[#8fd9a8]/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth Section */}
          <div className="pt-3 border-t border-border">
            {isLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Skeleton className="h-9 w-full rounded-full bg-muted" />
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-background border border-border">
                  <div className="size-8 rounded-full bg-[#8fd9a8] text-[#0e1a14] font-bold text-xs flex items-center justify-center">
                    {(user.name || user.email || "R").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {user.name || "Library Reader"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted"
                >
                  <RiUser3Line className="size-4 text-[#8fd9a8]" />
                  <span>My Profile</span>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full rounded-full text-xs text-rose-400 border-border hover:bg-rose-500/10 justify-center gap-1.5"
                >
                  <RiLogoutBoxRLine className="size-3.5" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full text-xs border-border text-foreground"
                  >
                    Login
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <BookNookButton size="sm" className="w-full justify-center">
                    Register
                  </BookNookButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
