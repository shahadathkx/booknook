"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Book } from "@/types/book";
import { useAuth, getJwt } from "@/hooks/use-auth";
import { useLibrary } from "@/context/library-context";
import { ApiError, api } from "@/lib/api";
import { BookNookButton } from "@/components/ui/booknook-button";
import {
  RiArrowLeftLine,
  RiUser3Line,
  RiCalendarLine,
  RiMailLine,
  RiHashtag,
  RiBookMarkedLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiInformationLine,
} from "react-icons/ri";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookDetailViewProps {
  initialBook: Book | null;
  bookId: string;
}

export function BookDetailView({ initialBook, bookId }: BookDetailViewProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isPending } = useAuth();
  const { books: contextBooks, borrowBook } = useLibrary();

  const liveBook =
    initialBook ?? contextBooks.find((book) => book.id === bookId) ?? null;


  const initialCopies = liveBook
    ? typeof liveBook.availableCopies === "number"
      ? liveBook.availableCopies
      : liveBook.status === "available"
      ? 1
      : 0
    : 0;

  const [availabilityOverride, setAvailabilityOverride] = useState<{
    bookId: string;
    copies: number;
  } | null>(null);
  const availableCopies =
    availabilityOverride && liveBook && availabilityOverride.bookId === liveBook.id
      ? Math.min(initialCopies, availabilityOverride.copies)
      : initialCopies;
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isSubmittingBorrow, setIsSubmittingBorrow] = useState(false);
  const [returnDate, setReturnDate] = useState<string | null>(null);


  if (!liveBook) {
    return (
      <div className="max-w-lg mx-auto my-20 p-8 text-center rounded-3xl border border-border bg-card shadow-lg">
        <div className="size-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <RiCloseCircleLine className="size-7" />
        </div>
        <h2 className="font-heading font-serif text-2xl font-bold text-foreground mb-2">
          Book Not Found
        </h2>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          The requested book volume does not exist in our catalog or may have been decommissioned.
        </p>
        <Link href="/books">
          <BookNookButton size="sm" variant="outline" className="gap-2">
            <RiArrowLeftLine className="size-4" />
            <span>Return to All Books</span>
          </BookNookButton>
        </Link>
      </div>
    );
  }


  const addedByName = typeof liveBook.addedBy === "object" && liveBook.addedBy
    ? liveBook.addedBy.name
    : typeof liveBook.addedBy === "string"
    ? liveBook.addedBy
    : "BookNook Curator";

  const addedByEmail = typeof liveBook.addedBy === "object" && liveBook.addedBy
    ? liveBook.addedBy.email
    : "librarian@booknook.local";

  const formattedAddedDate = liveBook.addedAt
    ? new Date(liveBook.addedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently Added";

  const categoryName = liveBook.category || liveBook.genre;
  const isAvailable = availableCopies > 0;

  const formattedReturnDate = returnDate
    ? new Date(returnDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "7 days after checkout";


  const handleBorrowClick = () => {
    if (availableCopies <= 0) {
      toast.error("Not Available");
      return;
    }
    if (isPending || isAuthLoading) {
      return;
    }
    if (!user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/books/${bookId}`)}`);
      return;
    }
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    setReturnDate(dueDate.toISOString());
    setIsBorrowModalOpen(true);
  };


  const handleConfirmBorrow = async () => {
    if (!liveBook) return;

    if (availableCopies <= 0) {
      toast.error("Not Available");
      return;
    }

    setIsSubmittingBorrow(true);

    try {
      const returnDateObj = returnDate ? new Date(returnDate) : new Date();
      const isMongoId = /^[a-f\d]{24}$/i.test(liveBook.id);

      if (isMongoId) {
        const token = await getJwt(true);
        if (!token) {
          router.push(`/login?callbackUrl=${encodeURIComponent(`/books/${bookId}`)}`);
          return;
        }

        await api.post(
          "/borrows",
          { bookId: liveBook.id },
          { token }
        );
      } else {
        const userEmailLower = user?.email?.toLowerCase().trim();
        const alreadyBorrowed = contextBooks.some(
          (b) =>
            b.id === liveBook.id &&
            b.currentBorrow?.borrowerEmail?.toLowerCase().trim() === userEmailLower
        );
        if (alreadyBorrowed) {
          toast.error("You have already borrowed this book");
          return;
        }

        const result = borrowBook(liveBook.id, {
          borrowerName: user?.name || user?.email?.split("@")[0] || "Registered Reader",
          borrowerEmail: user?.email || undefined,
          loanDurationDays: 7,
        });
        if (!result.success) {
          toast.error(result.error || "Failed to borrow book");
          return;
        }

        try {
          const storageKey = "booknook_my_borrows";
          const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
          const newRecord = {
            id: `brw-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
            bookId: liveBook.id,
            title: liveBook.title,
            author: liveBook.author,
            coverImage: liveBook.coverImage,
            coverTheme: liveBook.coverTheme,
            borrowDate: new Date().toISOString(),
            returnDate: returnDateObj.toISOString(),
            userEmail: user?.email || "",
          };
          localStorage.setItem(
            storageKey,
            JSON.stringify([
              newRecord,
              ...existing.filter((record: { bookId?: string }) => record.bookId !== liveBook.id),
            ])
          );
        } catch (error) {
          console.warn("Could not save local borrow backup:", error);
        }
      }

      setAvailabilityOverride({
        bookId: liveBook.id,
        copies: Math.max(0, availableCopies - 1),
      });
      toast.success(
        `"${liveBook.title}" borrowed successfully! Return by ${formattedReturnDate}.`
      );
      setIsBorrowModalOpen(false);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("You have already borrowed this book");
      } else if (
        err instanceof ApiError &&
        (err.status === 400 || err.message.toLowerCase().includes("not available"))
      ) {
        toast.error("Not Available");
      } else if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/books/${bookId}`)}`);
      } else {
        toast.error(err instanceof Error ? err.message : "Borrow failed");
      }
    } finally {
      setIsSubmittingBorrow(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      { }
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/books" className="hover:text-foreground transition-colors">
          All Books
        </Link>
        <span>/</span>
        <span className="text-[#8fd9a8] font-medium truncate max-w-xs sm:max-w-md">
          {liveBook.title}
        </span>
      </div>

      { }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        { }
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-2xl relative overflow-hidden">
            { }
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8fd9a8]/60 to-transparent" />

            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#15251d] shadow-lg">
              {liveBook.coverImage ? (
                <Image
                  src={liveBook.coverImage}
                  alt={`Cover of ${liveBook.title}`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  unoptimized={liveBook.coverImage.startsWith("http")}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${
                    liveBook.coverTheme?.gradientClass ||
                    "from-slate-900 via-indigo-950 to-blue-900 text-amber-100"
                  } flex flex-col items-center justify-center p-8 text-center`}
                >
                  <span className="font-heading font-serif text-2xl font-bold text-amber-200 mb-2">
                    {liveBook.title}
                  </span>
                  <span className="text-sm opacity-80">{liveBook.author}</span>
                </div>
              )}

              {/* Status Ribbon */}
              <div className="absolute top-4 right-4">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md shadow-md flex items-center gap-1.5 ${
                    isAvailable
                      ? "bg-[#8fd9a8]/25 text-[#8fd9a8] border border-[#8fd9a8]/40"
                      : "bg-rose-500/25 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      isAvailable ? "bg-[#8fd9a8] animate-pulse" : "bg-rose-400"
                    }`}
                  />
                  {isAvailable ? `${availableCopies} Available` : "Not Available"}
                </span>
              </div>
            </div>

            {/* Quick Catalog Meta */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-border text-center">
              <div className="p-2.5 rounded-xl bg-background border border-border">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  ISBN Reference
                </span>
                <span className="text-xs font-semibold text-foreground mt-0.5 block truncate">
                  {liveBook.isbn}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-background border border-border">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  Publication Year
                </span>
                <span className="text-xs font-semibold text-foreground mt-0.5 block">
                  {liveBook.publishedYear}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Book Information, Provenance, and Borrow CTA */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Eyebrow and Category */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e0915a] bg-[#e0915a]/10 px-3 py-1 rounded-full border border-[#e0915a]/25">
              {categoryName}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RiHashtag className="size-3.5 text-[#8fd9a8]" />
              Catalog ID: {liveBook.id}
            </span>
          </div>

          {/* Book Title */}
          <div>
            <h1 className="font-heading font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
              {liveBook.title}
            </h1>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <RiUser3Line className="size-4 text-[#8fd9a8]" />
              <span>
                Authored by{" "}
                <strong className="text-foreground font-semibold">
                  {liveBook.author}
                </strong>
              </span>
            </div>
          </div>

          {/* Availability Status Card */}
          <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground block">
                Circulation Availability
              </span>
              <span
                className={`text-sm font-bold mt-0.5 flex items-center gap-1.5 ${
                  isAvailable ? "text-[#8fd9a8]" : "text-rose-400"
                }`}
              >
                {isAvailable ? (
                  <>
                    <RiCheckboxCircleLine className="size-4" />
                    <span>{availableCopies} {availableCopies === 1 ? "copy" : "copies"} currently in stacks</span>
                  </>
                ) : (
                  <>
                    <RiCloseCircleLine className="size-4" />
                    <span>Currently out on loan (0 copies available)</span>
                  </>
                )}
              </span>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider border ${
                isAvailable
                  ? "bg-[#8fd9a8]/10 text-[#8fd9a8] border-[#8fd9a8]/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {isAvailable ? "In Stock" : "Checked Out"}
            </span>
          </div>

          {/* Synopsis / Description */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Literary Synopsis
            </h2>
            <p className="text-foreground/90 text-sm sm:text-base leading-relaxed font-sans">
              {liveBook.description}
            </p>
          </div>

          {/* Added By & Added Date Provenance Information */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#e0915a] flex items-center gap-1.5">
              <RiInformationLine className="size-4" />
              Provenance & Catalog Entry Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Added by: name/email */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Added By</span>
                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                  <RiUser3Line className="size-3.5 text-[#8fd9a8]" />
                  <span>{addedByName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RiMailLine className="size-3.5 text-[#8fd9a8]" />
                  <span className="truncate">{addedByEmail}</span>
                </div>
              </div>

              {/* Added date */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Added to Collection</span>
                <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                  <RiCalendarLine className="size-3.5 text-[#8fd9a8]" />
                  <span>{formattedAddedDate}</span>
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  Catalog Verified Entry
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Button: "Borrow" */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <BookNookButton
              variant={isAvailable ? "primary" : "secondary"}
              size="default"
              onClick={handleBorrowClick}
              disabled={!isAvailable || isPending || isAuthLoading || isSubmittingBorrow}
              className="gap-2.5 font-bold px-8 shadow-lg shadow-[#8fd9a8]/20"
            >
              <RiBookMarkedLine className="size-5" />
              <span>Borrow</span>
            </BookNookButton>

            <Link href="/books">
              <BookNookButton variant="outline" size="default" className="gap-2">
                <RiArrowLeftLine className="size-4" />
                <span>Back to All Books</span>
              </BookNookButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Borrow Confirmation Modal (Custom dialog, no alert/confirm) */}
      <Dialog open={isBorrowModalOpen} onOpenChange={setIsBorrowModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[#8fd9a8] mb-1">
              <RiBookMarkedLine className="size-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Circulation Check Out
              </span>
            </div>
            <DialogTitle className="font-heading font-serif text-2xl font-bold text-foreground">
              Borrow &quot;{liveBook.title}&quot;
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Confirm your checkout details below. This volume will be issued directly to your reader profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Read-Only Patron Name */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={user?.name || user?.email?.split("@")[0] || "Registered Reader"}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-medium cursor-not-allowed select-none opacity-90 focus:outline-none"
                />
                <RiUser3Line className="size-3.5 text-[#8fd9a8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Read-Only Patron Email */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={user?.email || ""}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-medium cursor-not-allowed select-none opacity-90 focus:outline-none"
                />
                <RiMailLine className="size-3.5 text-[#8fd9a8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Book Title */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Book Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={liveBook.title}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-medium cursor-not-allowed select-none opacity-90 focus:outline-none"
                />
                <RiBookMarkedLine className="size-3.5 text-[#8fd9a8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Return Date (7 days from today) */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Return Date (7 days from today)
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={formattedReturnDate}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground font-medium cursor-not-allowed select-none opacity-90 focus:outline-none"
                />
                <RiCalendarLine className="size-3.5 text-[#8fd9a8] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsBorrowModalOpen(false)}
              disabled={isSubmittingBorrow}
              className="px-4 py-2 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <BookNookButton
              variant="primary"
              size="default"
              disabled={isSubmittingBorrow}
              onClick={handleConfirmBorrow}
            >
              <span>{isSubmittingBorrow ? "Processing Borrow..." : "Confirm Borrow"}</span>
            </BookNookButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
