import { Suspense } from "react";
import type { Metadata } from "next";
import { MyBooksContent } from "@/components/my-books-content";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "My Books",
  description:
    "View your cataloged contributions, curated reading stack, and books you have added to BookNook.",
};

export default function MyBooksPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-28 flex flex-col items-center justify-center gap-4 text-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <MyBooksContent />
    </Suspense>
  );
}
