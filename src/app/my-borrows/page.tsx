import { Suspense } from "react";
import type { Metadata } from "next";
import { MyBorrowsContent } from "@/components/my-borrows-content";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "My Borrows",
  description:
    "Track active book loans, review due dates, and return volumes to the BookNook library shelves.",
};

export default function MyBorrowsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-28 flex flex-col items-center justify-center gap-4 text-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <MyBorrowsContent />
    </Suspense>
  );
}
