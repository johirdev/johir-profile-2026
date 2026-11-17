"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/** Fades + lifts its children into view once, when scrolled to. */
export default function Reveal({
  delay = 0,
  y = 24,
  className,
  children,
  as = "div",
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number; y?: number; as?: "div" | "li" | "article" }) {
  const Comp = as === "li" ? motion.li : as === "article" ? motion.article : motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...(rest as object)}
    >
      {children}
    </Comp>
  );
}
