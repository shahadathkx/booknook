"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/context/library-context";
import { notify } from "@/lib/notify";
import { Book } from "@/types/book";
import { siteConfig } from "@/lib/config";
import { format } from "date-fns";
import { RotateCcw, User, Calendar, BookCheck, MapPin } from "lucide-react";

interface ReturnBookDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReturnBookDialog({ book, open, onOpenChange }: ReturnBookDialogProps) {
  const { returnBook } = useLibrary();

  if (!book) return null;

  const currentBorrow = book.currentBorrow;

  const handleConfirmReturn = () => {
    const result = returnBook(book.id);
    if (result.success && result.book) {
      notify.success(
        "Book Returned to Shelf",
        `"${result.book.title}" has been checked back in. It is now marked as Available.`
      );
      onOpenChange(false);
    } else {
      notify.error("Return Failed", result.error || "Unable to process return.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <RotateCcw className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Book Return Check-In</span>
          </div>
          <DialogTitle className="text-xl font-serif text-stone-900 dark:text-stone-50">
            Return &quot;{book.title}&quot;
          </DialogTitle>
          <DialogDescription className="text-stone-600 dark:text-stone-400 text-xs">
            Confirm that this volume is being returned in good condition to {siteConfig.libraryBranch}.
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
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              ISBN: {book.isbn} • {book.genre}
            </p>
          </div>
        </div>

        {/* Current Active Loan Summary */}
        {currentBorrow ? (
          <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
              Active Loan Record
            </div>
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <User className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Borrowed by: <strong>{currentBorrow.borrowerName}</strong>
              </span>
            </div>
            {currentBorrow.borrowerEmail && (
              <div className="text-[11px] text-stone-500 pl-5">
                Contact: {currentBorrow.borrowerEmail}
              </div>
            )}
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <Calendar className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Loan Date: {format(new Date(currentBorrow.borrowedAt), "MMM d, yyyy")}
                {" • "}
                Due: <strong>{format(new Date(currentBorrow.dueDate), "MMM d, yyyy")}</strong>
              </span>
            </div>
            {currentBorrow.notes && (
              <div className="text-[11px] text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-900/60 p-2 rounded border border-amber-200/50 dark:border-amber-900/40 italic">
                &ldquo;{currentBorrow.notes}&rdquo;
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-stone-100 p-3 text-xs text-stone-600">
            No active borrower record found for this volume.
          </div>
        )}

        {/* Re-shelving location notice */}
        <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800">
          <MapPin className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Returning to: <strong>Main Stacks, {siteConfig.libraryBranch}</strong>
          </span>
        </div>

        <DialogFooter className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Keep on Loan
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirmReturn}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm gap-1.5"
          >
            <BookCheck className="size-3.5" />
            Confirm Return to Shelf
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
