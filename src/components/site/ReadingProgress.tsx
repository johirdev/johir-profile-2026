"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ReadingProgress({ color }: { color: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[70] h-1 origin-left" style={{ scaleX, background: color }} />;
}
