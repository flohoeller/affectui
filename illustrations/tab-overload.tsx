"use client";

import { useId } from "react";

/*
 * Tab Overload – a small card illustration, in a single self-contained file.
 * Three overlapping browser windows; the front one is active with colored dots, an outline and a glow.
 * Hover a window behind it and the highlight moves over to that one.
 * The artwork is drawn on a 360 × 240 viewBox and fades out towards the right and bottom edge.
 */

export type TabOverloadProps = {
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

/** Offsets of the three windows (top-left corner of each frame) */
const windows = [
  { n: 1, x: 30, y: 68 },
  { n: 2, x: 125, y: 56 },
  { n: 3, x: 220, y: 44 },
] as const;

export function TabOverload({
  className,
  label = "Three overlapping browser windows full of placeholder content",
}: TabOverloadProps) {
  const id = "ui-to" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <div className={["ui-to", className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-tab-overload" precedence="default">
        {css}
      </style>
      <div className="ui-to-grid" aria-hidden="true" />
      <svg className="ui-to-art" viewBox="0 0 360 240" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-blob-h`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB89E" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#C8A8E5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#A8B5FF" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`${id}-blob-v`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FF6B5C" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFB89E" stopOpacity="0.3" />
          </linearGradient>
          <filter id={`${id}-blur`} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <linearGradient id={`${id}-stroke`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B5C0FF" />
            <stop offset="40%" stopColor="#D5BBEF" />
            <stop offset="75%" stopColor="#FFC5AB" />
            <stop offset="100%" stopColor="#FFB5BC" />
          </linearGradient>
        </defs>

        {/* Each window: glow → frame → content; the next window covers any overflow */}
        {windows.map(({ n, x, y }) => (
          <g key={n}>
            <g className={`ui-to-blobs ui-to-blobs-${n}`}>
              <ellipse
                cx={x + 70}
                cy={y + 8}
                rx="90"
                ry="14"
                fill={`url(#${id}-blob-h)`}
                filter={`url(#${id}-blur)`}
              />
              <ellipse
                cx={x + 8}
                cy={y + 96}
                rx="14"
                ry="90"
                fill={`url(#${id}-blob-v)`}
                filter={`url(#${id}-blur)`}
              />
            </g>
            <g className={`ui-to-tab ui-to-tab-${n}`} transform={`translate(${x} ${y})`}>
              {/* Outer gray frame, reaching well past the edges */}
              <rect className="ui-to-frame" width="380" height="300" rx="6" fill="#F4F5F7" stroke="#E4E7EC" strokeWidth="0.7" />
              <circle className="ui-to-dot" cx="14" cy="14" r="3" fill="#CCCCCC" />
              <circle className="ui-to-dot" cx="24" cy="14" r="3" fill="#CCCCCC" />
              <circle className="ui-to-dot" cx="34" cy="14" r="3" fill="#CCCCCC" />
              <rect className="ui-to-page" x="4" y="24" width="372" height="272" rx="5" fill="#FFFFFF" stroke="#E4E7EC" strokeWidth="0.7" />
            </g>
            <g className={`ui-to-content ui-to-content-${n}`} transform={`translate(${x} ${y})`}>
              <rect className="ui-to-bar" x="12" y="36" width="30" height="30" rx="4" fill="#EFF1F4" />
              <rect className="ui-to-bar" x="52" y="38" width="100" height="6" rx="2" fill="#EFF1F4" />
              <rect className="ui-to-bar" x="52" y="46" width="100" height="6" rx="2" fill="#EFF1F4" />
              <rect className="ui-to-bar" x="52" y="54" width="35" height="6" rx="2" fill="#EFF1F4" />
              <rect className="ui-to-bar" x="12" y="72" width="140" height="6" rx="2" fill="#EFF1F4" />
              <rect className="ui-to-bar" x="12" y="80" width="140" height="6" rx="2" fill="#EFF1F4" />
              <rect className="ui-to-bar" x="12" y="88" width="55" height="6" rx="2" fill="#EFF1F4" />
            </g>
          </g>
        ))}

        {/* Active-window decoration (colored dots + outline), shown on one window at a time */}
        {windows.map(({ n, x, y }) => (
          <g key={n} className={`ui-to-front ui-to-front-${n}`}>
            <circle cx={x + 14} cy={y + 14} r="3" fill="#FF6B5C" />
            <circle cx={x + 24} cy={y + 14} r="3" fill="#FFB89E" />
            <circle cx={x + 34} cy={y + 14} r="3" fill="#A8B5FF" />
            <path
              d={`M ${x} 240 L ${x} ${y + 6} A 6 6 0 0 1 ${x + 6} ${y} L ${n === 3 ? 360 : x + 95} ${y}`}
              fill="none"
              stroke={`url(#${id}-stroke)`}
              strokeWidth="0.8"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-to {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  /* Fade out towards the right and bottom edge */
  -webkit-mask-image:
    linear-gradient(to right, #000 70%, transparent 100%),
    linear-gradient(to bottom, #000 70%, transparent 100%);
  -webkit-mask-composite: source-in;
  mask-image:
    linear-gradient(to right, #000 70%, transparent 100%),
    linear-gradient(to bottom, #000 70%, transparent 100%);
  mask-composite: intersect;
}
.ui-to-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(28, 29, 31, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(28, 29, 31, 0.035) 1px, transparent 1px);
  background-size: 4.4444% 6.6667%;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 25%, transparent 75%);
  mask-image: radial-gradient(ellipse at center, #000 25%, transparent 75%);
  pointer-events: none;
}
.ui-to-art {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

/* Placeholder blocks shimmer softly */
.ui-to-bar { animation: ui-to-shimmer 2.4s ease-in-out infinite; }
@keyframes ui-to-shimmer {
  0%, 100% { fill: #EFF1F4; }
  50% { fill: #DDE1E5; }
}

/* The highlight follows the hovered window; the front window is active by default */
.ui-to-blobs,
.ui-to-front {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.ui-to-content {
  opacity: 0.2;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.ui-to-blobs-3,
.ui-to-front-3,
.ui-to-content-3 { opacity: 1; }

.ui-to-art:has(.ui-to-tab-1:hover) .ui-to-blobs-1,
.ui-to-art:has(.ui-to-tab-1:hover) .ui-to-front-1,
.ui-to-art:has(.ui-to-tab-1:hover) .ui-to-content-1,
.ui-to-art:has(.ui-to-tab-2:hover) .ui-to-blobs-2,
.ui-to-art:has(.ui-to-tab-2:hover) .ui-to-front-2,
.ui-to-art:has(.ui-to-tab-2:hover) .ui-to-content-2 { opacity: 1; }

.ui-to-art:has(.ui-to-tab-1:hover, .ui-to-tab-2:hover) .ui-to-blobs-3,
.ui-to-art:has(.ui-to-tab-1:hover, .ui-to-tab-2:hover) .ui-to-front-3 { opacity: 0; }
.ui-to-art:has(.ui-to-tab-1:hover, .ui-to-tab-2:hover) .ui-to-content-3 { opacity: 0.2; }

@media (prefers-reduced-motion: reduce) {
  .ui-to-bar { animation: none; }
  .ui-to-blobs, .ui-to-front, .ui-to-content { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-to-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
}
:where(.dark, [data-theme="dark"]) .ui-to-frame { fill: #1b1b1d; stroke: rgba(255, 255, 255, 0.1); }
:where(.dark, [data-theme="dark"]) .ui-to-dot { fill: #3a3a3f; }
:where(.dark, [data-theme="dark"]) .ui-to-page { fill: #232326; stroke: rgba(255, 255, 255, 0.08); }
:where(.dark, [data-theme="dark"]) .ui-to-bar { fill: #2e2e32; }
@media (prefers-reduced-motion: no-preference) {
  :where(.dark, [data-theme="dark"]) .ui-to-bar { animation-name: ui-to-shimmer-dark; }
}
@keyframes ui-to-shimmer-dark {
  0%, 100% { fill: #2e2e32; }
  50% { fill: #3a3a3f; }
}
`;
