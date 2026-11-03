import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { fetchBookById } from "@/lib/books";
import { BookDetailView } from "@/components/books/book-detail-view";
import { Spinner } from "@/components/ui/spinner";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

async function getForwardedAuthHeaders(): Promise<Headers> {
  const incomingHeaders = await headers();
  const forwardedHeaders = new Headers();

  for (const name of ["cookie", "authorization"]) {
    const value = incomingHeaders.get(name);
    if (value) {
      forwardedHeaders.set(name, value);
    }
  }

  return forwardedHeaders;
}

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await fetchBookById(id, await getForwardedAuthHeaders());

  if (!book) {
    return {
      title: "Book Not Found",
      description: "The requested volume could not be located in the BookNook catalog.",
    };
  }

  return {
    title: book.title,
    description: book.description.slice(0, 160),
  };
}

async function BookDetailContent({ params }: BookPageProps) {
  const { id } = await params;
  const book = await fetchBookById(id, await getForwardedAuthHeaders());

  return <BookDetailView initialBook={book} bookId={id} />;
}

export default function BookDetailPage({ params }: BookPageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-28 flex flex-col items-center justify-center gap-4 text-center">
          <Spinner size="lg" />
          <p className="font-heading font-serif text-lg font-bold text-foreground">
            Opening Volume
          </p>
        </div>
      }
    >
      <BookDetailContent params={params} />
    </Suspense>
  );
}
