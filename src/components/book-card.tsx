"use client";

import React from "react";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { BookNookButton } from "@/components/ui/booknook-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  RiBookmarkLine,
  RiRestartLine,
  RiInformationLine,
  RiUserLine,
  RiCalendarLine,
} from "react-icons/ri";

interface BookCardProps {
  book: Book;
  onBorrowClick: (book: Book) => void;
  onReturnClick: (book: Book) => void;
  onDetailsClick: (book: Book) => void;
}

export function BookCard({
  book,
  onBorrowClick,
  onReturnClick,
  onDetailsClick,
}: BookCardProps) {
  const isAvailable = book.status === "available";
  const currentBorrow = book.currentBorrow;

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#8fd9a8]/50 flex flex-col justify-between overflow-hidden">
      { }
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8fd9a8]/20 via-[#8fd9a8]/60 to-[#8fd9a8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        { }
        <div className="flex gap-4 items-start">
          { }
          <div
            onClick={() => onDetailsClick(book)}
            className={`cursor-pointer w-20 h-28 shrink-0 rounded-lg bg-gradient-to-br ${book.coverTheme.gradientClass} shadow-md border border-white/20 p-2 flex flex-col justify-between relative overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg`}
          >
            {/* Book Spine Simulation */}
            <div className="absolute left-0 inset-y-0 w-2 bg-black/25 border-r border-white/10" />
            <div className="pl-1.5 border-b border-white/20 pb-1">
              <span className="text-[9px] font-heading font-serif font-bold text-amber-200 leading-tight block line-clamp-2">
                {book.title}
              </span>
            </div>
            <div className="pl-1.5 text-right">
              <span className="text-[7.5px] opacity-80 block truncate text-stone-200">
                {book.author}
              </span>
            </div>
          </div>

          {/* Book Meta & Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <Badge
                variant="outline"
                className="text-[10px] font-medium border-border text-muted-foreground"
              >
                {book.genre}
              </Badge>

              {/* Status Indicator */}
              <Badge
                variant="outline"
                className={`text-[10px] py-0 px-2 font-medium ${
                  isAvailable
                    ? "bg-[#8fd9a8]/15 text-[#8fd9a8] border-[#8fd9a8]/30"
                    : "bg-[#e0915a]/15 text-[#e0915a] border-[#e0915a]/30"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full mr-1 ${
                    isAvailable ? "bg-[#8fd9a8] animate-pulse" : "bg-[#e0915a]"
                  }`}
                />
                {isAvailable ? "Available" : "On Loan"}
              </Badge>
            </div>

            <h3
              onClick={() => onDetailsClick(book)}
              className="cursor-pointer font-heading font-serif font-bold text-foreground text-base leading-snug line-clamp-1 hover:text-[#8fd9a8] transition-colors"
            >
              {book.title}
            </h3>

            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              by <span className="font-medium text-foreground">{book.author}</span>
            </p>

            <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
              <span>{book.publishedYear}</span>
              <span>•</span>
              <span className="font-mono truncate">ISBN {book.isbn}</span>
            </div>
          </div>
        </div>

        {/* Synopsis Snippet */}
        <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {book.description}
        </p>

        {/* Loan Indicator if Borrowed */}
        {!isAvailable && currentBorrow && (
          <div className="mt-3 rounded-lg border border-[#e0915a]/30 bg-[#e0915a]/10 p-2 text-[11px] text-[#e0915a] space-y-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <RiUserLine className="size-3 text-[#e0915a] shrink-0" />
              <span className="truncate">
                Borrowed by <strong>{currentBorrow.borrowerName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <RiCalendarLine className="size-3 text-[#e0915a] shrink-0" />
              <span>Due: {format(new Date(currentBorrow.dueDate), "MMM d, yyyy")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer: Reusing ONE consistent button style */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onDetailsClick(book)}
          className="rounded-full text-muted-foreground hover:text-foreground text-xs gap-1"
        >
          <RiInformationLine className="size-3.5" />
          Details
        </Button>

        {isAvailable ? (
          <BookNookButton
            size="sm"
            onClick={() => onBorrowClick(book)}
            className="text-xs py-1 px-3.5 gap-1"
          >
            <RiBookmarkLine className="size-3.5" />
            <span>Borrow Book</span>
          </BookNookButton>
        ) : (
          <Button
            size="xs"
            onClick={() => onReturnClick(book)}
            className="rounded-full bg-[#1a382a] hover:bg-[#254b38] text-[#8fd9a8] border border-[#8fd9a8]/40 font-medium text-xs shadow-xs gap-1 transition-all"
          >
            <RiRestartLine className="size-3.5" />
            <span>Return Book</span>
          </Button>
        )}
      </div>
    </div>
  );
}
