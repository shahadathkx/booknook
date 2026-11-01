import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LibraryProvider } from "@/context/library-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "BookNook | Home",
    template: "BookNook | %s",
  },
  description:
    "A community-first digital library sanctuary to add books, borrow titles for your reading nook, and return volumes to the shelf.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="booknook-dark"
      className="h-full antialiased font-sans"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Manrope:wght@300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground antialiased selection:bg-[#8fd9a8]/30 selection:text-[#8fd9a8]">
        <ThemeProvider>
          <LibraryProvider>
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </LibraryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
