"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/*
 * Grid Background – a fine line grid behind your content, in a single self-contained file.
 * The grid drifts slowly by one cell per loop and fades out towards the edges through a radial mask.
 * On first view it can be uncovered by a circle that grows from the center.
 * Reduced motion: the grid stays still and appears without the reveal.
 */

export type GridDirection = "up" | "down" | "left" | "right" | "diagonal";

export type GridBackgroundProps = {
  /** Content rendered above the grid */
  children?: ReactNode;
  /** Cell size in px */
  size?: number;
  /** Line color – defaults to a faint black, or a faint white in dark mode */
  color?: string;
  /** Seconds per cell; 0 keeps the grid still */
  speed?: number;
  /** Drift direction; "diagonal" runs from top right to bottom left */
  direction?: GridDirection;
  /** Uncover the grid with a growing circle when it first comes into view */
  reveal?: boolean;
  /** Radius of the edge fade, in % of the distance to the corners */
  fade?: number;
  className?: string;
};

const offsets: Record<GridDirection, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
  diagonal: [-1, 1],
};

export function GridBackground({
  children,
  size = 48,
  color,
  speed = 3,
  direction = "diagonal",
  reveal = true,
  fade = 70,
  className,
}: GridBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!reveal);

  // Reveal once the grid scrolls into view (right away with reduced motion or without IntersectionObserver)
  useEffect(() => {
    if (!reveal) return setShown(true);
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reveal]);

  const [dx, dy] = offsets[direction] ?? offsets.diagonal;
  const style = {
    "--ui-gb-size": `${size}px`,
    "--ui-gb-dx": `${dx * size}px`,
    "--ui-gb-dy": `${dy * size}px`,
    "--ui-gb-speed": `${Math.max(speed, 0)}s`,
    "--ui-gb-fade": `${fade}%`,
    ...(color ? { "--ui-gb-line": color } : {}),
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={["ui-gb", className].filter(Boolean).join(" ")}
      style={style}
      data-reveal={reveal ? "" : undefined}
      data-shown={shown ? "" : undefined}
      data-static={speed > 0 ? undefined : ""}
    >
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-grid-background" precedence="default">
        {css}
      </style>
      <div className="ui-gb-grid" aria-hidden="true">
        <div className="ui-gb-reveal">
          <div className="ui-gb-lines" />
        </div>
      </div>
      <div className="ui-gb-content">{children}</div>
    </div>
  );
}

const css = /* css */ `
@property --ui-gb-r {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

.ui-gb {
  --ui-gb-color: rgba(0, 0, 0, 0.07);
  --ui-gb-ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

/* Edge fade: a still radial mask, so the drifting lines dissolve towards the sides */
.ui-gb-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 20%, transparent var(--ui-gb-fade));
  mask-image: radial-gradient(ellipse at center, #000 20%, transparent var(--ui-gb-fade));
}

/* Reveal: a circle from the center grows until it reaches the corners */
.ui-gb-reveal {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.ui-gb[data-reveal] .ui-gb-reveal {
  --ui-gb-r: 0%;
  -webkit-mask-image: radial-gradient(circle farthest-corner at center, #000 var(--ui-gb-r), transparent calc(var(--ui-gb-r) + 12%));
  mask-image: radial-gradient(circle farthest-corner at center, #000 var(--ui-gb-r), transparent calc(var(--ui-gb-r) + 12%));
}
.ui-gb[data-reveal][data-shown] .ui-gb-reveal {
  animation: ui-gb-reveal 1.6s var(--ui-gb-ease) forwards;
}

/* The lines: one cell larger on every side, so a shift by one cell loops seamlessly */
.ui-gb-lines {
  position: absolute;
  inset: calc(var(--ui-gb-size) * -1);
  background-image:
    linear-gradient(to right, var(--ui-gb-line, var(--ui-gb-color)) 1px, transparent 1px),
    linear-gradient(to bottom, var(--ui-gb-line, var(--ui-gb-color)) 1px, transparent 1px);
  background-size: var(--ui-gb-size) var(--ui-gb-size);
  animation: ui-gb-drift var(--ui-gb-speed) linear infinite;
}
.ui-gb[data-static] .ui-gb-lines {
  animation: none;
}

.ui-gb-content {
  position: relative;
  z-index: 1;
  height: 100%;
}

@keyframes ui-gb-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(var(--ui-gb-dx), var(--ui-gb-dy), 0); }
}
@keyframes ui-gb-reveal {
  from { --ui-gb-r: 0%; }
  to { --ui-gb-r: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-gb-lines { animation: none; }
  .ui-gb[data-reveal] .ui-gb-reveal { -webkit-mask-image: none; mask-image: none; animation: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-gb {
  --ui-gb-color: rgba(255, 255, 255, 0.07);
}
`;
