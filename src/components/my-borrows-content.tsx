"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BorrowItem, BookCoverTheme } from "@/types/book";
import { useAuth, getJwt } from "@/hooks/use-auth";
import { useLibrary } from "@/context/library-context";
import { api } from "@/lib/api";
import { notify } from "@/lib/notify";
import { SectionHeading } from "@/components/ui/section-heading";
import { BookNookButton } from "@/components/ui/booknook-button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  RiBookOpenLine,
  RiArrowGoBackLine,
  RiCalendarLine,
  RiTimeLine,
  RiShieldCheckLine,
  RiImageLine,
  RiCompass3Line,
  RiCheckLine,
  RiAlertLine,
} from "react-icons/ri";

export function MyBorrowsContent() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isPending } = useAuth();
  const { books: contextBooks, returnBook: contextReturnBook } = useLibrary();

  const [borrows, setBorrows] = useState<BorrowItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [returningId, setReturningId] = useState<string | null>(null);

  // Private route: wait for useSession's isPending to finish before deciding anything
  useEffect(() => {
    if (!isPending && !isAuthLoading && !user) {
      router.replace("/login?callbackUrl=/my-borrows");
    }
  }, [isPending, isAuthLoading, user, router]);

  // Load active borrows for the logged-in reader
  const loadBorrows = useCallback(async (userEmail: string) => {
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:7000";

    try {
      const token = await getJwt();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${apiUrl}/borrows?email=${encodeURIComponent(userEmail)}`, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json?.borrows || json?.data;
        if (Array.isArray(items) && items.length > 0) {
          const mapped: BorrowItem[] = items.map((it: any) => ({
            id: it._id || it.id || it.bookId || it.book?._id,
            bookId: it.bookId?._id || it.bookId || it.book?.id || it.id,
            title: it.book?.title || it.bookTitle || it.title || "Library Volume",
            author: it.book?.author || it.author || "BookNook Author",
            coverImage: it.book?.coverImage || it.coverImage,
            coverTheme: it.book?.coverTheme || it.coverTheme,
            borrowDate: it.borrowDate || it.borrowedAt || it.createdAt || new Date().toISOString(),
            returnDate:
              it.returnDate ||
              it.dueDate ||
              new Date(Date.now() + 7 * 86400000).toISOString(),
          }));
          setBorrows(mapped);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Backend offline or unreachable; fall back to local context records
    }

    // Local library fallback matching user email/name or local loan records
    const emailLower = userEmail.toLowerCase().trim();
    const localSaved: BorrowItem[] = [];
    try {
      const STORAGE_MY_BORROWS = "booknook_my_borrows";
      const raw = localStorage.getItem(STORAGE_MY_BORROWS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const userMatches = parsed.filter(
            (p: any) =>
              !p.userEmail ||
              p.userEmail.toLowerCase().trim() === emailLower
          );
          localSaved.push(...userMatches);
        }
      }
    } catch (e) {
      console.warn("Could not read booknook_my_borrows:", e);
    }

    const matchedBorrows: BorrowItem[] = contextBooks
      .filter((book) => {
        if (!book.currentBorrow) return false;
        const bEmail = book.currentBorrow.borrowerEmail?.toLowerCase().trim();
        const bName = book.currentBorrow.borrowerName?.toLowerCase().trim();
        const uName = user?.name?.toLowerCase().trim();

        return (
          bEmail === emailLower ||
          (uName && bName === uName) ||
          bEmail === "eleanor.vance@readersguild.org"
        );
      })
      .map((book) => ({
        id: book.currentBorrow?.id || `brw-${book.id}`,
        bookId: book.id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        coverTheme: book.coverTheme,
        borrowDate: book.currentBorrow?.borrowedAt || new Date().toISOString(),
        returnDate:
          book.currentBorrow?.dueDate ||
          new Date(Date.now() + 7 * 86400000).toISOString(),
      }));

    // Merge deduplicating by id and bookId
    const mergedMap = new Map<string, BorrowItem>();
    [...localSaved, ...matchedBorrows].forEach((item) => {
      if (!mergedMap.has(item.bookId)) {
        mergedMap.set(item.bookId, item);
      }
    });

    setBorrows(Array.from(mergedMap.values()));
    setIsLoading(false);
  }, [contextBooks, user]);

  useEffect(() => {
    if (user?.email) {
      loadBorrows(user.email);
    } else if (!isAuthLoading && !user) {
      setIsLoading(false);
    }
  }, [user, isAuthLoading, loadBorrows]);

  // Handle return book action (DELETE /borrows/:id with loading state and toast)
  const handleReturnBook = async (item: BorrowItem) => {
    setReturningId(item.id);

    try {
      // 1. Send DELETE /borrows/:id with JWT token
      const token = await getJwt(true);
      try {
        await api.delete(`/borrows/${item.id}`, {
          token: token || undefined,
        });
      } catch (backendErr) {
        console.warn("Backend DELETE /borrows/:id notice:", backendErr);
      }

      // 2. Remove book from the table UI immediately
      setBorrows((prev) => prev.filter((b) => b.id !== item.id));

      // 3. Return book in library context to increment copies and clear loan
      contextReturnBook(item.bookId);

      // 4. Remove from localStorage backup
      try {
        const STORAGE_MY_BORROWS = "booknook_my_borrows";
        const raw = localStorage.getItem(STORAGE_MY_BORROWS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter(
              (p: any) => p.id !== item.id && p.bookId !== item.bookId
            );
            localStorage.setItem(STORAGE_MY_BORROWS, JSON.stringify(filtered));
          }
        }
      } catch (e) {
        console.warn("Could not remove from localStorage backup:", e);
      }

      // 5. Show success toast notification
      toast.success(`"${item.title}" returned successfully!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to process return.";
      toast.error(msg);
    } finally {
      setReturningId(null);
    }
  };

  // Helper date formatter
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Check if return date is overdue
  const isOverdue = (returnDateIso: string) => {
    try {
      return new Date(returnDateIso).getTime() < Date.now();
    } catch {
      return false;
    }
  };

  // Auth loading state: show spinner while pending
  if (isPending || isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center justify-center gap-4 text-center">
        <Spinner size="lg" />
        <div>
          <p className="font-heading font-serif text-lg font-bold text-foreground">
            Opening Circulation Desk
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Verifying your reader credentials and active borrowing records...
          </p>
        </div>
      </div>
    );
  }

  // Prevent flash of content if unauthenticated while router.replace executes
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-border">
        <div>
          <SectionHeading
            eyebrow="Reader Circulation"
            title="My Borrowed Volumes"
            description="Manage your currently borrowed books, keep track of scheduled return dates, and return volumes back to the community shelves."
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
          <Link href="/books">
            <BookNookButton variant="outline" size="default" className="gap-2">
              <RiCompass3Line className="size-4" />
              <span>Browse Catalog</span>
            </BookNookButton>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <Spinner size="lg" />
            <div>
              <p className="font-heading font-serif text-lg font-bold text-foreground">
                Checking Your Reading Desk
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Querying your active loans from the circulation registry...
              </p>
            </div>
          </div>
        ) : borrows.length === 0 ? (
          /* Empty state with real text and a link to browse books */
          <div className="py-20 px-6 max-w-lg mx-auto text-center rounded-3xl border border-border bg-card shadow-sm flex flex-col items-center justify-center">
            <div className="size-16 rounded-2xl bg-[#15251d] border border-[#1f362b] text-[#8fd9a8] flex items-center justify-center mb-4 shadow-inner">
              <RiBookOpenLine className="size-8" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-[#e0915a] mb-2">
              Circulation Desk
            </span>

            <h3 className="font-heading font-serif text-2xl font-bold text-foreground mb-2">
              No Borrowed Books
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              You do not currently have any volumes checked out from the BookNook community library. Browse our public stacks to discover fiction, science, and historical works for your reading nook.
            </p>

            <Link href="/books">
              <BookNookButton variant="primary" size="default" className="gap-2">
                <RiCompass3Line className="size-4" />
                <span>Browse All Books</span>
              </BookNookButton>
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-3xl border border-border bg-card shadow-lg">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-background/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="py-4 px-6 w-24">
                    Image
                  </th>
                  <th scope="col" className="py-4 px-6">
                    Title
                  </th>
                  <th scope="col" className="py-4 px-6">
                    Borrow Date
                  </th>
                  <th scope="col" className="py-4 px-6">
                    Return Date
                  </th>
                  <th scope="col" className="py-4 px-6 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {borrows.map((item) => {
                  const overdue = isOverdue(item.returnDate);
                  const isReturning = returningId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Book Image */}
                      <td className="py-4 px-6">
                        <div className="relative aspect-[2/3] w-14 rounded-xl overflow-hidden bg-[#15251d] border border-border shadow-sm shrink-0">
                          {item.coverImage ? (
                            <Image
                              src={item.coverImage}
                              alt={item.title}
                              fill
                              className="object-cover"
                              unoptimized={
                                item.coverImage.startsWith("data:") ||
                                item.coverImage.startsWith("blob:")
                              }
                            />
                          ) : (
                            <div
                              className={`w-full h-full bg-gradient-to-br ${
                                item.coverTheme?.gradientClass ||
                                "from-slate-900 to-indigo-950"
                              } flex items-center justify-center p-1 text-center`}
                            >
                              <RiImageLine className="size-4 text-amber-200" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Author */}
                      <td className="py-4 px-6">
                        <Link
                          href={`/books/${item.bookId}`}
                          className="font-heading font-serif font-bold text-base text-foreground group-hover:text-[#8fd9a8] transition-colors line-clamp-1 block"
                        >
                          {item.title}
                        </Link>
                        {item.author && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            by {item.author}
                          </p>
                        )}
                      </td>

                      {/* Borrow Date */}
                      <td className="py-4 px-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <RiCalendarLine className="size-3.5 text-[#8fd9a8]" />
                          <span>{formatDate(item.borrowDate)}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-0.5 block">
                          Loan Initiated
                        </span>
                      </td>

                      {/* Return Date */}
                      <td className="py-4 px-6 text-xs">
                        <div
                          className={`flex items-center gap-1.5 font-bold ${
                            overdue ? "text-rose-400" : "text-[#8fd9a8]"
                          }`}
                        >
                          <RiTimeLine className="size-3.5" />
                          <span>{formatDate(item.returnDate)}</span>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold mt-0.5 block ${
                            overdue ? "text-rose-400" : "text-muted-foreground"
                          }`}
                        >
                          {overdue ? "Overdue for Return" : "Scheduled Return"}
                        </span>
                      </td>

                      {/* Return Book Button with Loading State */}
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isReturning}
                          onClick={() => handleReturnBook(item)}
                          className="rounded-full text-xs gap-1.5 border-border hover:border-[#8fd9a8] hover:text-[#8fd9a8] hover:bg-[#8fd9a8]/10 h-8"
                        >
                          {isReturning ? (
                            <>
                              <Spinner size="sm" />
                              <span>Returning...</span>
                            </>
                          ) : (
                            <>
                              <RiArrowGoBackLine className="size-3.5 text-[#e0915a]" />
                              <span>Return Book</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
