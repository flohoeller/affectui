"use client";

import { useId } from "react";

/*
 * Empty Calendar – a small card illustration, in a single self-contained file.
 * Three stacked calendar cards with an "Empty" badge and a disabled "Join meeting" button.
 * Hover the front card to lift it, hover a back card to slide it further out.
 * The artwork is drawn on a 320 × 240 viewBox inside a 3 : 2 frame.
 */

export type EmptyCalendarProps = {
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

export function EmptyCalendar({
  className,
  label = "Stacked calendar cards marked empty, with a disabled join meeting button",
}: EmptyCalendarProps) {
  const id = "ui-ec" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <div className={["ui-ec", className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-empty-calendar" precedence="default">
        {css}
      </style>
      <svg className="ui-ec-art" viewBox="0 0 320 240" aria-hidden="true">
        <defs>
          <filter id={`${id}-blur`} x="-30%" y="-100%" width="160%" height="300%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow className="ui-ec-drop" dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.06" />
          </filter>
          <linearGradient id={`${id}-blob`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFA0AB" stopOpacity="0.25" />
            <stop offset="33%" stopColor="#FFB89E" stopOpacity="0.25" />
            <stop offset="66%" stopColor="#C8A8E5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#A8B5FF" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id={`${id}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop className="ui-ec-edge" offset="0%" stopColor="#E4E7EC" />
            <stop offset="18%" stopColor="#FFB5BC" />
            <stop offset="40%" stopColor="#FFC5AB" />
            <stop offset="60%" stopColor="#D5BBEF" />
            <stop offset="82%" stopColor="#B5C0FF" />
            <stop className="ui-ec-edge" offset="100%" stopColor="#E4E7EC" />
          </linearGradient>
        </defs>

        <g transform="translate(30 47) scale(0.814)">
          {/* Back cards – hover to slide them out further */}
          <g className="ui-ec-back ui-ec-back-left">
            <CalendarCard shadow={`url(#${id}-shadow)`} />
          </g>
          <g className="ui-ec-back ui-ec-back-right">
            <CalendarCard shadow={`url(#${id}-shadow)`} />
          </g>

          {/* Front card with a soft colored glow underneath */}
          <g className="ui-ec-front">
            <ellipse
              className="ui-ec-blob"
              cx="160"
              cy="152"
              rx="125"
              ry="35"
              fill={`url(#${id}-blob)`}
              filter={`url(#${id}-blur)`}
            />
            <CalendarCard shadow={`url(#${id}-shadow)`} />
            {/* Colored bottom edge, matching the glow */}
            <path
              d="M40 150 A 10 10 0 0 0 50 160 L270 160 A 10 10 0 0 0 280 150"
              fill="none"
              stroke={`url(#${id}-stroke)`}
              strokeWidth="0.5"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

/** One calendar card: title, "Empty" badge, placeholder lines and a disabled button */
function CalendarCard({ shadow }: { shadow: string }) {
  return (
    <>
      <rect className="ui-ec-card" x="40" y="20" width="240" height="140" rx="10" fill="#FFFFFF" stroke="#E4E7EC" strokeWidth="0.5" filter={shadow} />
      <text className="ui-ec-title" x="56" y="48" fontSize="13" fontWeight="500" fill="#8A8A8A">
        Calendar
      </text>
      <g transform="translate(218 34)">
        <rect className="ui-ec-badge" width="46" height="18" rx="5" fill="#FEF8EF" />
        <text x="23" y="12" textAnchor="middle" fontSize="9" fontWeight="600" letterSpacing="0.06em" fill="#FAB082">
          EMPTY
        </text>
      </g>
      <rect className="ui-ec-bar" x="56" y="64" width="208" height="7" rx="2" fill="#EFF1F4" />
      <rect className="ui-ec-bar" x="56" y="74" width="208" height="7" rx="2" fill="#EFF1F4" />
      <rect className="ui-ec-bar" x="56" y="84" width="168" height="7" rx="2" fill="#EFF1F4" />
      <g transform="translate(56 104)">
        <rect className="ui-ec-btn" width="208" height="40" rx="8" fill="#F4F4F6" stroke="#E4E7EC" strokeWidth="0.5" />
        {/* "Not available" icon + label, centered together */}
        <g
          className="ui-ec-btn-ink"
          transform="translate(64 14)"
          fill="none"
          stroke="#9A9AA3"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="5" />
          <line x1="2.5" y1="9.5" x2="9.5" y2="2.5" />
        </g>
        <text className="ui-ec-btn-label" x="84" y="24" fontSize="10" fontWeight="500" fill="#9A9AA3">
          Join meeting
        </text>
      </g>
    </>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-ec {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
}
.ui-ec-art {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

/* Placeholder lines shimmer softly */
.ui-ec-bar { animation: ui-ec-shimmer 2.4s ease-in-out infinite; }
@keyframes ui-ec-shimmer {
  0%, 100% { fill: #EFF1F4; }
  50% { fill: #DDE1E5; }
}

/* The glow under the front card breathes */
.ui-ec-blob {
  transform-origin: 160px 152px;
  animation: ui-ec-breathe 5s ease-in-out infinite;
}
@keyframes ui-ec-breathe {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

/* Front card: lifts and tilts on hover */
.ui-ec-front {
  transform-origin: 160px 90px;
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.ui-ec-front:hover { transform: translate(0, -8px) rotate(2deg); }

/* Back cards: fanned out, slide further on hover */
.ui-ec-back {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.35s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.ui-ec-back-left { transform: translate(-22px, 0) rotate(-3deg); }
.ui-ec-back-left:hover { transform: translate(-48px, 4px) rotate(-7deg); }
.ui-ec-back-right { transform: translate(22px, 0) rotate(3deg); }
.ui-ec-back-right:hover { transform: translate(48px, 4px) rotate(7deg); }

@media (prefers-reduced-motion: reduce) {
  .ui-ec-bar, .ui-ec-blob { animation: none; }
  .ui-ec-front, .ui-ec-back { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-ec-card { fill: #232326; stroke: rgba(255, 255, 255, 0.08); }
:where(.dark, [data-theme="dark"]) .ui-ec-drop { flood-opacity: 0.4; }
:where(.dark, [data-theme="dark"]) .ui-ec-edge { stop-color: #3a3a3f; }
:where(.dark, [data-theme="dark"]) .ui-ec-title { fill: #8f8f8f; }
:where(.dark, [data-theme="dark"]) .ui-ec-badge { fill: rgba(250, 176, 130, 0.16); }
:where(.dark, [data-theme="dark"]) .ui-ec-bar { fill: #2a2a2d; }
@media (prefers-reduced-motion: no-preference) {
  :where(.dark, [data-theme="dark"]) .ui-ec-bar { animation-name: ui-ec-shimmer-dark; }
}
:where(.dark, [data-theme="dark"]) .ui-ec-btn { fill: #2a2a2d; stroke: rgba(255, 255, 255, 0.08); }
:where(.dark, [data-theme="dark"]) .ui-ec-btn-ink { stroke: #6b6b70; }
:where(.dark, [data-theme="dark"]) .ui-ec-btn-label { fill: #6b6b70; }
@keyframes ui-ec-shimmer-dark {
  0%, 100% { fill: #2a2a2d; }
  50% { fill: #36363b; }
}
`;
