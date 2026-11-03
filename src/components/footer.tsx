"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import {
  RiBookReadLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTwitterXFill,
  RiFacebookFill,
  RiInstagramLine,
  RiGithubFill,
} from "react-icons/ri";

export function Footer() {
  const socialLinks = [
    {
      name: "X (formerly Twitter)",
      href: "https://x.com",
      icon: RiTwitterXFill,
    },
    {
      name: "Facebook",
      href: "https://facebook.com",
      icon: RiFacebookFill,
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: RiInstagramLine,
    },
    {
      name: "GitHub",
      href: "https://github.com",
      icon: RiGithubFill,
    },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-card transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          { }
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="size-9 rounded-2xl bg-gradient-to-br from-[#1a382a] via-[#15251d] to-[#0e1a14] border border-[#1f362b] shadow-sm flex items-center justify-center text-[#8fd9a8]">
                <RiBookReadLine className="size-4" />
              </div>
              <span className="font-heading font-serif text-xl font-bold tracking-tight text-foreground">
                {siteConfig.appName}
              </span>
            </Link>

            { }
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              BookNook is a community-first digital library sanctuary designed to celebrate timeless literature, making book borrowing, reading tracking, and collection sharing effortless.
            </p>

            { }
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="size-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-[#8fd9a8] hover:border-[#8fd9a8]/50 transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          { }
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-heading font-serif text-sm font-bold text-foreground tracking-wide">
              Library Navigation
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-[#8fd9a8] transition-colors">
                  Home Sanctuary
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-[#8fd9a8] transition-colors">
                  All Cataloged Volumes
                </Link>
              </li>
              <li>
                <Link href="/my-borrows" className="hover:text-[#8fd9a8] transition-colors">
                  Active Loans & Circulation
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#8fd9a8] transition-colors">
                  Reader Member Profile
                </Link>
              </li>
            </ul>
          </div>

          { }
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-heading font-serif text-sm font-bold text-foreground tracking-wide">
              Contact & Circulation Desk
            </h3>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <RiMapPinLine className="size-4 text-[#8fd9a8] shrink-0 mt-0.5" />
                <span>Mymensingh, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RiMailLine className="size-4 text-[#8fd9a8] shrink-0" />
                <a
                  href="mailto:booknook.app.official@gmail.com"
                  className="hover:text-[#8fd9a8] transition-colors"
                >
                  booknook.app.official@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <RiPhoneLine className="size-4 text-[#8fd9a8] shrink-0" />
                <a
                  href="tel:+8801864123312"
                  className="hover:text-[#8fd9a8] transition-colors"
                >
                  +8801864123312
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Line */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <p>© 2026 BookNook Library System. All rights reserved.</p>
          <p>
            Operating under {siteConfig.libraryBranch} • Open Circulation Hours
          </p>
        </div>
      </div>
    </footer>
  );
}
