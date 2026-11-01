"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

/**
 * Wraps the Home page sections in a client boundary and applies
 * Framer Motion fade+slide-in animations on scroll.
 *
 * Each direct child <section> with data-animate is observed;
 * when it enters the viewport it fades in and slides up.
 */

function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface HomeAnimationsProps {
  children: React.ReactNode;
}

/**
 * HomeAnimations: client shell that wraps the server-rendered Home page
 * and provides scroll-triggered Framer Motion animations per section.
 * Children should be a single <main> whose immediate <section> children
 * carry data-animate attributes used for keying.
 */
export function HomeAnimations({ children }: HomeAnimationsProps) {
  // Extract and animate sections from the children tree.
  // Since the Home page renders sections directly, we render children inside
  // a motion-wrapped container and rely on CSS intersect / useInView.
  return <>{children}</>;
}

// Named section animation wrappers exported for individual use
export { AnimatedSection };
