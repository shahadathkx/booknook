"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "@/types/book";
import { RiArrowRightLine } from "react-icons/ri";

interface NewArrivalCardProps {
  book: Book;
}

export function NewArrivalCard({ book }: NewArrivalCardProps) {
  const isAvailable = book.status === "available";

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#8fd9a8]/40 h-full">
      {/* Cover image with fixed aspect ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1a2f25] shrink-0">
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${book.coverTheme?.gradientClass} flex items-center justify-center p-4`}
          >
            <span className="font-heading font-serif text-center text-sm font-bold text-amber-200 leading-tight">
              {book.title}
            </span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${isAvailable ? "bg-[#8fd9a8]/20 text-[#8fd9a8] border border-[#8fd9a8]/30" : "bg-[#e0915a]/20 text-[#e0915a] border border-[#e0915a]/30"}`}
          >
            {isAvailable ? "Available" : "On Loan"}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category badge */}
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#e0915a] bg-[#e0915a]/10 px-2 py-0.5 rounded-full w-fit border border-[#e0915a]/20">
          {book.genre}
        </span>

        <div className="flex-1">
          <h3 className="font-heading font-serif font-bold text-foreground text-base leading-snug line-clamp-2 group-hover:text-[#8fd9a8] transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            by <span className="font-medium text-foreground/80">{book.author}</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">
            {book.description}
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/books/${book.id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8fd9a8] hover:text-[#7bc895] transition-colors group/link"
        >
          View Details
          <RiArrowRightLine className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
