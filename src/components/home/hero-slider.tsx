"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { BookNookButton } from "@/components/ui/booknook-button";
import { RiArrowRightLine } from "react-icons/ri";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const SLIDES = [
  {
    id: "slide-1",
    image: "/images/hero/slide-1.jpg",
    eyebrow: "Your Community Library",
    title: "Share the Books on\nYour Shelf",
    body: "BookNook is a community-first reading sanctuary where every title finds a new reader. Add the books gathering dust on your shelf and let them travel to someone who will love them.",
    cta: "Browse the Collection",
    href: "/books",
  },
  {
    id: "slide-2",
    image: "/images/hero/slide-2.jpg",
    eyebrow: "Borrow for 7 Days",
    title: "Find Your Next\nFavourite Read",
    body: "Discover classics, new arrivals, science marvels, and children's tales. Borrow any available title for a week — free, simple, and back in a few taps when you're done.",
    cta: "See New Arrivals",
    href: "/books?sort=newest",
  },
  {
    id: "slide-3",
    image: "/images/hero/slide-3.jpg",
    eyebrow: "Grow the Stacks",
    title: "Every Shelf Tells\na Story",
    body: "Our catalogue grows with every member who contributes. Whether it's a dog-eared paperback or a pristine hardcover, the best libraries are built by communities, not algorithms.",
    cta: "Explore All Books",
    href: "/books",
  },
];

export function HeroSlider() {
  return (
    <section className="relative w-full overflow-hidden rounded-2xl" aria-label="Featured hero slides">
      <style>{`
        .hero-swiper .swiper-pagination {
          bottom: 20px;
        }
        .hero-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(143, 217, 168, 0.4);
          opacity: 1;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #8fd9a8;
          width: 28px;
          border-radius: 9999px;
        }
      `}</style>

      <Swiper
        className="hero-swiper"
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        speed={800}
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-[520px] sm:h-[600px] lg:h-[680px] w-full flex items-end">
              <div className="absolute inset-0 z-0">
                <Image
                  src={slide.image}
                  alt={slide.title.replace("\n", " ")}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a14] via-[#0e1a14]/60 to-[#0e1a14]/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0e1a14]/70 via-transparent to-transparent" />
              </div>
              <div className="relative z-10 px-6 sm:px-10 lg:px-16 pb-16 sm:pb-20 max-w-3xl">
                <span className="inline-block text-[#e0915a] text-[11px] font-bold uppercase tracking-widest mb-3">
                  {slide.eyebrow}
                </span>
                <h1 className="font-heading font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-[#e6f0ea] whitespace-pre-line mb-4">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-[#e6f0ea]/80 leading-relaxed max-w-xl mb-8">
                  {slide.body}
                </p>
                <Link href={slide.href} tabIndex={-1}>
                  <BookNookButton size="lg" className="gap-2.5 group">
                    {slide.cta}
                    <RiArrowRightLine className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </BookNookButton>
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
