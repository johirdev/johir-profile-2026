"use client";

import React, { useCallback, useRef, useState } from "react";

interface Tilt3DProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Peak rotation in degrees at the far edge of the card. */
  max?: number;
  /** How far the card lifts toward the viewer while hovered, in px. */
  lift?: number;
  /** Renders the pointer-tracking specular highlight. */
  sheen?: boolean;
  children: React.ReactNode;
}

/**
 * Pointer-reactive 3D tilt.
 *
 * The transform itself lives in CSS (.tilt-3d in globals.css); this component
 * only writes --rx/--ry/--mx/--my. That keeps the work on the compositor —
 * no React re-render per mousemove — and means the media queries in CSS can
 * switch the effect off for touch devices and prefers-reduced-motion without
 * this component knowing about it.
 */
export default function Tilt3D({
  max = 8,
  lift = 14,
  sheen = true,
  className = "",
  children,
  onPointerMove,
  onPointerLeave,
  onPointerEnter,
  ...rest
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);

      const node = ref.current;
      if (!node || event.pointerType === "touch") return;

      const { clientX, clientY } = event;

      // Coalesce to one write per frame; pointermove can fire far faster.
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const px = (clientX - rect.left) / rect.width;
        const py = (clientY - rect.top) / rect.height;

        // Cursor above centre tips the top edge away, which is what reads
        // as "the card is facing me".
        node.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
        node.style.setProperty("--rx", `${(0.5 - py) * 2 * max}deg`);
        node.style.setProperty("--mx", `${px * 100}%`);
        node.style.setProperty("--my", `${py * 100}%`);
      });
    },
    [max, onPointerMove]
  );

  const handleEnter = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(event);
      if (event.pointerType === "touch") return;
      ref.current?.style.setProperty("--tz", `${lift}px`);
      setActive(true);
    },
    [lift, onPointerEnter]
  );

  const handleLeave = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(event);

      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }

      const node = ref.current;
      if (node) {
        node.style.setProperty("--rx", "0deg");
        node.style.setProperty("--ry", "0deg");
        node.style.setProperty("--tz", "0px");
      }
      setActive(false);
    },
    [onPointerLeave]
  );

  return (
    <div
      ref={ref}
      data-active={active}
      className={`tilt-3d ${className}`}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      {...rest}
    >
      {children}
      {sheen && <span aria-hidden="true" className="tilt-3d__sheen" />}
    </div>
  );
}
