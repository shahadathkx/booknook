"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "@/types/book";
import { BookNookButton } from "@/components/ui/booknook-button";
import { RiArrowRightLine, RiUser3Line } from "react-icons/ri";

interface CatalogBookCardProps {
  book: Book;
}

export function CatalogBookCard({ book }: CatalogBookCardProps) {
  const [imageError, setImageError] = useState(false);
  const copies =
    typeof book.availableCopies === "number"
      ? book.availableCopies
      : book.status === "available"
      ? 1
      : 0;
  const isAvailable = copies > 0;
  const categoryName = book.category || book.genre || "Fiction";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCoverUrl = book.coverImage || (book as any).image;
  const coverUrl = imageError ? null : rawCoverUrl;

  return (
    <article className="group flex aspect-square flex-col rounded-3xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#8fd9a8]/50 h-full relative">
      <div className="relative h-[38%] w-full overflow-hidden bg-[#15251d] shrink-0">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`Cover illustration of ${book.title}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={typeof coverUrl === "string" && coverUrl.startsWith("http")}
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${
              book.coverTheme?.gradientClass ||
              "from-slate-900 via-indigo-950 to-blue-900 text-amber-100"
            } flex items-center justify-center p-6 text-center`}
          >
            <div>
              <span className="font-heading font-serif text-lg font-bold block mb-1 text-amber-200">
                {book.title}
              </span>
              <span className="text-xs opacity-75">{book.author}</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        <div className="absolute top-3 right-3 z-10">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm flex items-center gap-1.5 ${
              isAvailable
                ? "bg-[#8fd9a8]/20 text-[#8fd9a8] border border-[#8fd9a8]/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isAvailable ? "bg-[#8fd9a8] animate-pulse" : "bg-rose-400"
              }`}
            />
            {isAvailable ? `${copies} Available` : "Checked Out"}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3 gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#e0915a] bg-[#e0915a]/10 px-2 py-0.5 rounded-full border border-[#e0915a]/25 truncate">
            {categoryName}
          </span>
          {book.publishedYear && (
            <span className="text-[11px] text-muted-foreground font-medium">
              {book.publishedYear}
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1">
          <Link href={`/books/${book.id}`}>
            <h3 className="font-heading font-serif font-bold text-foreground text-base leading-snug line-clamp-1 group-hover:text-[#8fd9a8] transition-colors">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <RiUser3Line className="size-3.5 text-[#8fd9a8]/80 shrink-0" />
            <span className="truncate">{book.author}</span>
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 line-clamp-2">
            {book.description}
          </p>
        </div>

        <div className="pt-2 border-t border-border/60">
          <Link href={`/books/${book.id}`} className="block w-full">
            <BookNookButton
              variant="outline"
              size="sm"
              className="w-full justify-center gap-1.5 text-xs group-hover:border-[#8fd9a8] group-hover:bg-[#8fd9a8] group-hover:text-[#0e1a14] transition-all"
            >
              <span>View Details</span>
              <RiArrowRightLine className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </BookNookButton>
          </Link>
        </div>
      </div>
    </article>
  );
}
