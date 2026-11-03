import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getNewArrivals } from "@/lib/books";
import { HeroSlider } from "@/components/home/hero-slider";
import { NewArrivalCard } from "@/components/home/new-arrival-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { AnimatedSection } from "@/components/home/home-animations";
import { BookNookButton } from "@/components/ui/booknook-button";
import {
  RiBookOpenLine,
  RiBookmarkLine,
  RiArrowGoBackLine,
  RiLeafLine,
  RiFlaskLine,
  RiHistoryLine,
  RiStarLine,
  RiArrowRightLine,
} from "react-icons/ri";

export const metadata: Metadata = {
  title: "Home",
  description:
    "BookNook — a community-first digital library. Add books, borrow titles for 7 days, return them from your borrows page. Discover new arrivals, fiction, science, history and more.",
};

const HOW_IT_WORKS_STEPS = [
  {
    step: "Step 1",
    icon: RiBookOpenLine,
    title: "Find a Book",
    description:
      "Browse the catalogue by category, author, or keyword. Filter by availability so you only see titles ready to borrow today.",
  },
  {
    step: "Step 2",
    icon: RiBookmarkLine,
    title: "Borrow It for 7 Days",
    description:
      "Hit Borrow, enter your name and email, and the book is reserved for you. You have a full seven days to read at your own pace.",
  },
  {
    step: "Step 3",
    icon: RiArrowGoBackLine,
    title: "Return from My Borrows",
    description:
      "Head to My Borrows in the navbar, find the title, and tap Return. The book is immediately available for the next reader.",
  },
];

const TOP_CATEGORIES = [
  {
    label: "Fiction",
    icon: RiLeafLine,
    description: "Stories that move the soul",
    color: "from-emerald-950 to-teal-900",
    border: "border-emerald-800/40 hover:border-[#8fd9a8]/50",
    query: "Fiction",
  },
  {
    label: "Science",
    icon: RiFlaskLine,
    description: "The universe demystified",
    color: "from-blue-950 to-indigo-900",
    border: "border-blue-800/40 hover:border-blue-400/50",
    query: "Science",
  },
  {
    label: "History",
    icon: RiHistoryLine,
    description: "The world that shaped us",
    color: "from-amber-950 to-orange-950",
    border: "border-amber-800/40 hover:border-amber-400/50",
    query: "History",
  },
  {
    label: "Kids",
    icon: RiStarLine,
    description: "Adventures without limits",
    color: "from-pink-950 to-rose-950",
    border: "border-pink-800/40 hover:border-pink-400/50",
    query: "Kids",
  },
];

export default async function HomePage() {
  const newArrivals = await getNewArrivals(6);

  return (
    <main className="flex-1 flex flex-col">
      { }
      <AnimatedSection>
        <section
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8"
          aria-label="Featured library slides"
        >
          <HeroSlider />
        </section>
      </AnimatedSection>

      { }
      <AnimatedSection delay={0.05}>
        <section
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
          aria-labelledby="new-arrivals-heading"
        >
          <div className="flex items-end justify-between gap-4 mb-8">
            <SectionHeading
              eyebrow="Fresh From the Stacks"
              title="New Arrivals"
              description="The latest titles added to the BookNook community catalogue, ready to borrow right now."
              id="new-arrivals-heading"
            />
            <Link href="/books?sort=newest" className="shrink-0 hidden sm:block">
              <BookNookButton variant="outline" size="sm" className="gap-1.5">
                See All
                <RiArrowRightLine className="size-3.5" />
              </BookNookButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {newArrivals.map((book, idx) => (
              <NewArrivalCard key={book.id || String(idx)} book={book} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/books">
              <BookNookButton size="lg" className="gap-2.5">
                See All Books
                <RiArrowRightLine className="size-4" />
              </BookNookButton>
            </Link>
          </div>
        </section>
      </AnimatedSection>

      { }
      <AnimatedSection delay={0.05}>
        <section
          className="w-full bg-[#0a1510] border-y border-[#1f362b]"
          aria-labelledby="how-it-works-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <SectionHeading
              eyebrow="Simple Process"
              title="How Borrowing Works"
              description="Three simple steps between you and your next great read."
              align="center"
              id="how-it-works-heading"
              className="max-w-xl mx-auto"
            />

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {HOW_IT_WORKS_STEPS.map(({ step, icon: Icon, title, description }, i) => (
                <div
                  key={step}
                  className="relative group flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-[#1f362b] bg-[#0e1a14] hover:border-[#8fd9a8]/30 transition-colors duration-300"
                >
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#e0915a] mb-4">
                    {step}
                  </span>
                  <div className="size-14 rounded-full bg-[#8fd9a8]/10 border border-[#8fd9a8]/20 flex items-center justify-center mb-5 group-hover:bg-[#8fd9a8]/20 transition-colors duration-300">
                    <Icon className="size-6 text-[#8fd9a8]" />
                  </div>
                  <h3 className="font-heading font-serif text-lg font-bold text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                  {i < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10">
                      <div className="w-6 h-px bg-[#1f362b]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      { }
      <AnimatedSection delay={0.05}>
        <section
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
          aria-labelledby="categories-heading"
        >
          <SectionHeading
            eyebrow="Browse by Genre"
            title="Top Categories"
            description="Jump straight to the section that excites you most."
            align="center"
            id="categories-heading"
            className="max-w-xl mx-auto mb-10"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TOP_CATEGORIES.map(({ label, icon: Icon, description, color, border, query }) => (
              <Link
                key={label}
                href={`/books?category=${encodeURIComponent(query)}`}
                id={`category-${label.toLowerCase()}`}
                className={`group flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br ${color} border ${border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                <div className="size-12 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors duration-300">
                  <Icon className="size-5 text-white/90" />
                </div>
                <span className="font-heading font-serif font-bold text-lg text-white leading-tight">
                  {label}
                </span>
                <span className="text-xs text-white/60 mt-1">{description}</span>
              </Link>
            ))}
          </div>
        </section>
      </AnimatedSection>
    </main>
  );
}
