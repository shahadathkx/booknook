"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLibrary } from "@/context/library-context";
import { BookNookButton } from "@/components/ui/booknook-button";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Spinner } from "@/components/ui/spinner";
import { notify } from "@/lib/notify";
import { siteConfig } from "@/lib/config";
import {
  RiUser3Line,
  RiMailLine,
  RiShieldCheckLine,
  RiBookMarkedLine,
  RiFileList3Line,
  RiLogoutBoxRLine,
  RiLoginBoxLine,
} from "react-icons/ri";

export function ProfileContent() {
  const router = useRouter();
  const { user, isLoading, isPending, signOut } = useAuth();
  const { books, borrowedCount } = useLibrary();


  useEffect(() => {
    if (!isPending && !isLoading && !user) {
      router.replace("/login?callbackUrl=/profile");
    }
  }, [isPending, isLoading, user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      notify.success("Logged Out", "You have signed out of your account.");
      router.push("/");
      router.refresh();
    } catch {
      notify.error("Error", "Could not complete logout.");
    }
  };


  if (isPending || isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-28 px-4 flex flex-col items-center justify-center gap-4 text-center">
        <Spinner size="lg" />
        <div>
          <p className="font-heading font-serif text-lg font-bold text-foreground">
            Opening Member Profile
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Loading reader credentials...
          </p>
        </div>
      </div>
    );
  }


  if (!user) {
    return null;
  }


  const userBorrows = books.filter(
    (b) =>
      b.status === "borrowed" &&
      (b.currentBorrow?.borrowerName?.toLowerCase() === user.name?.toLowerCase() ||
        b.currentBorrow?.borrowerEmail?.toLowerCase() === user.email?.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <SectionHeading
        eyebrow="Reader Registry"
        title="Member Profile"
        description="Your official BookNook patron credentials, circulation status, and library account details."
      />

      { }
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm relative overflow-hidden mt-6">
        { }
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8fd9a8]/60 to-transparent" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          { }
          <div className="relative shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "Reader profile photo"}
                className="size-24 rounded-full object-cover border-2 border-[#8fd9a8] shadow-md"
              />
            ) : (
              <div className="size-24 rounded-full bg-gradient-to-br from-[#1a382a] to-[#0e1a14] border-2 border-[#8fd9a8] shadow-md flex items-center justify-center text-[#8fd9a8] font-heading font-serif text-3xl font-bold select-none">
                {(user.name || user.email || "R").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-[#15251d] border border-[#1f362b] flex items-center justify-center text-[#8fd9a8]">
              <RiShieldCheckLine className="size-4" />
            </div>
          </div>

          { }
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading font-serif text-2xl font-bold text-foreground">
                  {user.name || "Anonymous Reader"}
                </h3>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground mt-1">
                  <RiMailLine className="size-3.5 text-[#8fd9a8]" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <span className="inline-flex items-center self-center sm:self-start text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#8fd9a8]/15 text-[#8fd9a8] border border-[#8fd9a8]/30">
                Verified Reader
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Member of {siteConfig.libraryBranch} • Registered Reader Status
            </p>
          </div>
        </div>

        { }
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-border">
          <div className="p-3.5 rounded-2xl bg-background border border-border">
            <span className="text-[11px] text-muted-foreground block">Branch</span>
            <span className="font-semibold text-xs text-foreground mt-0.5 block truncate">
              {siteConfig.libraryBranch}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-background border border-border">
            <span className="text-[11px] text-muted-foreground block">Active Loans</span>
            <span className="font-semibold text-xs text-[#8fd9a8] mt-0.5 block">
              {userBorrows.length > 0 ? userBorrows.length : borrowedCount} Books
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-background border border-border">
            <span className="text-[11px] text-muted-foreground block">Status</span>
            <span className="font-semibold text-xs text-emerald-400 mt-0.5 block">
              Good Standing
            </span>
          </div>
        </div>

        { }
        <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/my-borrows">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs gap-1.5 border-border"
              >
                <RiFileList3Line className="size-3.5 text-[#e0915a]" />
                <span>My Borrows</span>
              </Button>
            </Link>

            <Link href="/books">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-xs gap-1.5"
              >
                <RiBookMarkedLine className="size-3.5 text-[#8fd9a8]" />
                <span>Explore Catalog</span>
              </Button>
            </Link>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-full text-xs text-rose-400 border-border hover:bg-rose-500/10 gap-1.5"
          >
            <RiLogoutBoxRLine className="size-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
