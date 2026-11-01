import type { Metadata } from "next";
import { Suspense } from "react";
import { BooksCatalogView } from "@/components/books/books-catalog-view";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "All Books",
  description:
    "Explore the complete BookNook library stacks. Search titles, filter categories, borrow volumes, and check out literary classics.",
};

export default function AllBooksPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-center">
          <Spinner size="lg" />
          <p className="text-xs text-muted-foreground">Opening library shelves...</p>
        </div>
      }
    >
      <BooksCatalogView />
    </Suspense>
  );
}
