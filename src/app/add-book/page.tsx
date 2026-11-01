import { Suspense } from "react";
import type { Metadata } from "next";
import { AddBookForm } from "@/components/books/add-book-form";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Add a Book",
  description:
    "Catalog and add a new volume to the BookNook community library with cover artwork and circulation copies.",
};

export default function AddBookPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-28 flex flex-col items-center justify-center gap-4 text-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <AddBookForm />
    </Suspense>
  );
}
