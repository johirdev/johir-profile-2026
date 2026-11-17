"use client";

import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** Leading text before the highlighted phrase, e.g. "The strategist behind" */
  children: ReactNode;
  /** Phrase rendered in the cyan accent color, e.g. "data-driven growth" */
  highlight: string;
  className?: string;
}

/** Centered H2 with a theme-aware base color and a cyan-highlighted phrase. */
export default function SectionHeading({
  children,
  highlight,
  className = "",
}: SectionHeadingProps) {
  const headingColor = "text-ink";

  return (
    <h2
      className={`max-w-2xl max-line-hight mx-auto text-2xl sm:text-4xl md:text-5xl font-extrabold  ${headingColor} leading-tight mb-3 sm:mb-5 tracking-tight  px-2 md:px-0 ${className}`}
    >
      {children} <span className="text-accent">{highlight}</span>
    </h2>
  );
}
