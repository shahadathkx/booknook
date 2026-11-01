"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/context/library-context";
import { notify } from "@/lib/notify";
import { Book } from "@/types/book";
import { siteConfig } from "@/lib/config";
import { format, addDays } from "date-fns";
import { BookmarkPlus, Calendar, User, Mail, ShieldCheck } from "lucide-react";

interface BorrowBookDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BorrowBookDialog({ book, open, onOpenChange }: BorrowBookDialogProps) {
  const { borrowBook } = useLibrary();

  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerEmail, setBorrowerEmail] = useState("");
  const [loanDays, setLoanDays] = useState<number>(siteConfig.defaultLoanDays);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mountedDate, setMountedDate] = useState<Date | null>(null);

  React.useEffect(() => {
    setMountedDate(new Date());
  }, []);

  const dueDate = useMemo(() => {
    const base = mountedDate ?? new Date("2026-10-31T00:00:00Z");
    return addDays(base, loanDays);
  }, [mountedDate, loanDays]);

  const handleReset = () => {
    setBorrowerName("");
    setBorrowerEmail("");
    setLoanDays(siteConfig.defaultLoanDays);
    setNotes("");
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!borrowerName.trim() || borrowerName.trim().length < 2) {
      newErrors.borrowerName = "Please enter the reader's full name (at least 2 characters).";
    }
    if (borrowerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(borrowerEmail.trim())) {
        newErrors.borrowerEmail = "Please enter a valid email address.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    if (!validate()) {
      notify.error("Invalid Reader Information", "Please verify the highlighted fields.");
      return;
    }

    const result = borrowBook(book.id, {
      borrowerName: borrowerName.trim(),
      borrowerEmail: borrowerEmail.trim() || undefined,
      loanDurationDays: loanDays,
      notes: notes.trim() || undefined,
    });

    if (result.success && result.book) {
      notify.success(
        "Book Checked Out Successfully",
        `"${result.book.title}" is now loaned to ${borrowerName.trim()}. Due back on ${format(
          dueDate,
          "MMM d, yyyy"
        )}.`
      );
      handleReset();
      onOpenChange(false);
    } else {
      notify.error("Borrow Request Denied", result.error || "Unable to complete loan.");
    }
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <BookmarkPlus className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Circulation Desk</span>
          </div>
          <DialogTitle className="text-xl font-serif text-stone-900 dark:text-stone-50">
            Borrow &quot;{book.title}&quot;
          </DialogTitle>
          <DialogDescription className="text-stone-600 dark:text-stone-400 text-xs">
            Complete the checkout record to check this volume out from {siteConfig.libraryBranch}.
          </DialogDescription>
        </DialogHeader>

        {/* Book Spotlight Card */}
        <div className="my-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/50 p-3.5 flex items-center gap-3.5">
          <div
            className={`w-14 h-20 shrink-0 rounded-md bg-gradient-to-br ${book.coverTheme.gradientClass} shadow-md border border-white/20 flex flex-col justify-between p-1.5`}
          >
            <div className="border-b border-white/20 pb-0.5">
              <span className="text-[7px] font-serif block truncate font-bold text-amber-200">
                {book.title}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[6px] opacity-75 block truncate text-stone-200">
                {book.author}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">
              {book.title}
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              by <span className="font-medium text-stone-800 dark:text-stone-200">{book.author}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="bg-white/80 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                {book.genre}
              </span>
              <span>ISBN: {book.isbn}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Reader Name */}
          <div>
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Patron / Reader Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                value={borrowerName}
                onChange={(e) => {
                  setBorrowerName(e.target.value);
                  if (errors.borrowerName) setErrors((prev) => ({ ...prev, borrowerName: "" }));
                }}
                placeholder="e.g. Clara Montgomery"
                className={`pl-8 ${errors.borrowerName ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}`}
              />
              <User className="size-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
            {errors.borrowerName && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.borrowerName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Contact Email <span className="text-stone-400 font-normal">(Optional, for due-date notifications)</span>
            </label>
            <div className="relative">
              <Input
                type="email"
                value={borrowerEmail}
                onChange={(e) => {
                  setBorrowerEmail(e.target.value);
                  if (errors.borrowerEmail) setErrors((prev) => ({ ...prev, borrowerEmail: "" }));
                }}
                placeholder="e.g. clara.montgomery@example.org"
                className={`pl-8 ${errors.borrowerEmail ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}`}
              />
              <Mail className="size-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
            {errors.borrowerEmail && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.borrowerEmail}</p>
            )}
          </div>

          {/* Loan Duration & Due Date Preview */}
          <div>
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1.5">
              Loan Period
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 14, 21, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setLoanDays(days)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    loanDays === days
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            {/* Calculated Return Date Badge */}
            <div className="mt-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <Calendar className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Scheduled Return Date:</span>
              </div>
              <span className="font-semibold text-amber-800 dark:text-amber-300">
                {format(dueDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Circulation Notes <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Reserved for book club reading group"
              className="text-xs"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Borrower agrees to return this volume in good physical condition.</span>
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm gap-1.5"
            >
              <BookmarkPlus className="size-3.5" />
              Confirm Checkout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
