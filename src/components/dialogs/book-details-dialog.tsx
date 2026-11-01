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
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";
import { format } from "date-fns";
import { BookmarkPlus, RotateCcw, User, Calendar, BookOpen, Hash, Clock } from "lucide-react";

interface BookDetailsDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBorrowClick: (book: Book) => void;
  onReturnClick: (book: Book) => void;
}

export function BookDetailsDialog({
  book,
  open,
  onOpenChange,
  onBorrowClick,
  onReturnClick,
}: BookDetailsDialogProps) {
  if (!book) return null;

  const isAvailable = book.status === "available";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge
              variant={isAvailable ? "default" : "secondary"}
              className={
                isAvailable
                  ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-600/30"
                  : "bg-amber-600/15 text-amber-700 dark:text-amber-300 border-amber-600/30"
              }
            >
              <span
                className={`size-1.5 rounded-full mr-1 ${
                  isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isAvailable ? "Available to Borrow" : "Currently on Loan"}
            </Badge>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              Published in {book.publishedYear}
            </span>
          </div>

          <DialogTitle className="text-2xl font-serif text-stone-900 dark:text-stone-50 mt-1">
            {book.title}
          </DialogTitle>
          <DialogDescription className="text-stone-600 dark:text-stone-400 text-sm">
            by <strong className="text-stone-800 dark:text-stone-200">{book.author}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Book Presentation Banner */}
        <div className="my-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/50 p-4 flex gap-4">
          <div
            className={`w-20 h-28 shrink-0 rounded-md bg-gradient-to-br ${book.coverTheme.gradientClass} shadow-lg border border-white/20 flex flex-col justify-between p-2 relative overflow-hidden`}
          >
            <div className="absolute left-0 inset-y-0 w-1.5 bg-black/20" />
            <div className="border-b border-white/20 pb-1 pl-1">
              <span className="text-[9px] font-serif block font-bold text-amber-200 leading-tight line-clamp-2">
                {book.title}
              </span>
            </div>
            <div className="text-right pl-1">
              <span className="text-[8px] opacity-80 block truncate text-stone-200">
                {book.author}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <BookOpen className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Genre: <strong>{book.genre}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <Hash className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>ISBN: <code className="font-mono text-[11px]">{book.isbn}</code></span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <Clock className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Added to Collection: {format(new Date(book.addedAt), "MMMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
            Literary Synopsis
          </h4>
          <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
            {book.description}
          </p>
        </div>

        {/* Active Loan Details if Borrowed */}
        {!isAvailable && book.currentBorrow && (
          <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-3.5 space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
              Current Loan Details
            </div>
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <User className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>Patron: <strong>{book.currentBorrow.borrowerName}</strong></span>
            </div>
            {book.currentBorrow.borrowerEmail && (
              <div className="text-[11px] text-stone-500 pl-5.5">
                Email: {book.currentBorrow.borrowerEmail}
              </div>
            )}
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
              <Calendar className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                Due Date:{" "}
                <strong className="text-amber-800 dark:text-amber-200">
                  {format(new Date(book.currentBorrow.dueDate), "EEEE, MMMM d, yyyy")}
                </strong>
              </span>
            </div>
            {book.currentBorrow.notes && (
              <div className="text-[11px] text-stone-600 dark:text-stone-400 bg-white/70 dark:bg-stone-900/70 p-2 rounded border border-amber-200/50 dark:border-amber-900/40 italic">
                &ldquo;{book.currentBorrow.notes}&rdquo;
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between sm:justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close Details
          </Button>

          {isAvailable ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onBorrowClick(book);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm gap-1.5"
            >
              <BookmarkPlus className="size-3.5" />
              Borrow This Book
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onReturnClick(book);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Return to Shelf
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
