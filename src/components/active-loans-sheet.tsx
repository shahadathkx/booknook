"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/context/library-context";
import { Book } from "@/types/book";
import { format } from "date-fns";
import { RotateCcw, User, Calendar, BookOpen, AlertCircle } from "lucide-react";

interface ActiveLoansSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnClick: (book: Book) => void;
}

export function ActiveLoansSheet({
  open,
  onOpenChange,
  onReturnClick,
}: ActiveLoansSheetProps) {
  const { books, borrowedCount } = useLibrary();
  const [nowTime, setNowTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setNowTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const borrowedBooks = books.filter((b) => b.status === "borrowed");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <BookOpen className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Circulation Desk</span>
          </div>
          <SheetTitle className="text-xl font-serif text-stone-900 dark:text-stone-50">
            Active Loans ({borrowedCount})
          </SheetTitle>
          <SheetDescription className="text-stone-600 dark:text-stone-400 text-xs">
            Volumes currently checked out by patrons. Click return to check any volume back into the library.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3.5">
          {borrowedBooks.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
              <BookOpen className="size-8 mx-auto text-stone-400 mb-2 opacity-60" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                All Books Are on the Shelves
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                There are currently no active loans checked out from BookNook.
              </p>
            </div>
          ) : (
            borrowedBooks.map((book) => {
              const borrow = book.currentBorrow;
              const isOverdue =
                borrow &&
                nowTime !== null &&
                new Date(borrow.dueDate).getTime() < nowTime;

              return (
                <div
                  key={book.id}
                  className="rounded-xl border border-stone-200 dark:border-stone-800 bg-card p-3.5 shadow-xs hover:border-amber-400/50 transition-colors"
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-12 h-16 shrink-0 rounded-md bg-gradient-to-br ${book.coverTheme.gradientClass} shadow-xs border border-white/20 flex flex-col justify-between p-1`}
                    >
                      <span className="text-[7px] font-serif block truncate font-bold text-amber-200">
                        {book.title}
                      </span>
                      <span className="text-[6px] opacity-75 block truncate text-stone-200 text-right">
                        {book.author}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-semibold text-stone-900 dark:text-stone-100 text-xs truncate">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        by {book.author}
                      </p>

                      {borrow && (
                        <div className="mt-2 space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                            <User className="size-3 text-amber-600 shrink-0" />
                            <span className="truncate">
                              Reader: <strong>{borrow.borrowerName}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                            <Calendar className="size-3 text-amber-600 shrink-0" />
                            <span>
                              Due: <strong>{format(new Date(borrow.dueDate), "MMM d, yyyy")}</strong>
                            </span>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold text-[10px]">
                                <AlertCircle className="size-2.5" /> Overdue
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                        <Button
                          size="xs"
                          onClick={() => {
                            onOpenChange(false);
                            onReturnClick(book);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1"
                        >
                          <RotateCcw className="size-3" />
                          Return to Shelf
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
