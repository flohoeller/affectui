"use client";

import { useId } from "react";

/*
 * Enrichment Orbit – a small card illustration, in a single self-contained file.
 * A Grok tile inside two rings; colored comets run around the rings in opposite directions
 * and three small data nodes orbit the outer ring, staying upright as they travel.
 * The artwork is drawn on a 320 × 240 viewBox inside a 3 : 2 frame.
 */

export type EnrichmentOrbitProps = {
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

/** Start offsets of the three orbiting nodes (120° apart on a 22 s orbit) */
const nodeDelays = ["0s", "-7.33s", "-14.66s"];

export function EnrichmentOrbit({
  className,
  label = "A Grok tile with data nodes orbiting around it",
}: EnrichmentOrbitProps) {
  const id = "ui-eo" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <div className={["ui-eo", className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-enrichment-orbit" precedence="default">
        {css}
      </style>
      <svg className="ui-eo-art" viewBox="0 0 320 240" aria-hidden="true">
        <defs>
          {/* Drop shadow plus a thin light-gray inner edge at the bottom */}
          <filter id={`${id}-tile`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="dropBlur" />
            <feOffset in="dropBlur" dx="0" dy="3" result="dropOffset" />
            <feFlood className="ui-eo-drop" floodColor="#000000" floodOpacity="0.06" result="dropColor" />
            <feComposite in="dropColor" in2="dropOffset" operator="in" result="dropShadow" />
            <feOffset in="SourceAlpha" dx="0" dy="-4" result="alphaUp" />
            <feComposite in="SourceAlpha" in2="alphaUp" operator="out" result="sliver" />
            <feFlood className="ui-eo-sliver" floodColor="#EAECEF" floodOpacity="1" result="innerColor" />
            <feComposite in="innerColor" in2="sliver" operator="in" result="innerShadow" />
            <feMerge>
              <feMergeNode in="dropShadow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="innerShadow" />
            </feMerge>
          </filter>
          <filter id={`${id}-node`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="dropBlur" />
            <feOffset in="dropBlur" dx="0" dy="2" result="dropOffset" />
            <feFlood className="ui-eo-drop" floodColor="#000000" floodOpacity="0.07" result="dropColor" />
            <feComposite in="dropColor" in2="dropOffset" operator="in" result="dropShadow" />
            <feOffset in="SourceAlpha" dx="0" dy="-3" result="alphaUp" />
            <feComposite in="SourceAlpha" in2="alphaUp" operator="out" result="sliver" />
            <feFlood className="ui-eo-sliver" floodColor="#EAECEF" floodOpacity="1" result="innerColor" />
            <feComposite in="innerColor" in2="sliver" operator="in" result="innerShadow" />
            <feMerge>
              <feMergeNode in="dropShadow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="innerShadow" />
            </feMerge>
          </filter>
          {/* Comet gradient, fading out at both ends */}
          <linearGradient id={`${id}-comet`}>
            <stop offset="0%" stopColor="#FF6B5C" stopOpacity="0" />
            <stop offset="22%" stopColor="#FFB89E" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#C8A8E5" stopOpacity="0.9" />
            <stop offset="78%" stopColor="#A8B5FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#A8B5FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Two concentric rings */}
        <g className="ui-eo-rings" fill="none" stroke="#E4E7EC" strokeWidth="1.2">
          <circle cx="160" cy="120" r="56" strokeOpacity="0.45" />
          <circle cx="160" cy="120" r="80" />
        </g>

        {/* Comets running around each ring in opposite directions */}
        <g className="ui-eo-spin">
          <path
            fill="none"
            stroke={`url(#${id}-comet)`}
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M114.1 54.5 A80 80 0 0 1 205.9 54.5"
          />
        </g>
        <g className="ui-eo-spin ui-eo-reverse">
          <path
            fill="none"
            stroke={`url(#${id}-comet)`}
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M120.4 80.4 A56 56 0 0 1 199.6 80.4"
          />
        </g>

        {/* Central Grok tile */}
        <rect className="ui-eo-tile" x="134" y="94" width="52" height="52" rx="12" fill="#FFFFFF" stroke="#E4E7EC" strokeWidth="0.5" filter={`url(#${id}-tile)`} />
        <GrokLogo x={147} y={107} size={26} />

        {/* Three nodes orbiting the outer ring, 120° apart; the inner group turns back so the icons stay upright */}
        {nodeDelays.map((delay) => (
          <g key={delay} className="ui-eo-orbit" style={{ animationDelay: delay }}>
            <g className="ui-eo-upright" style={{ animationDelay: delay }}>
              <circle className="ui-eo-tile" cx="160" cy="40" r="17" fill="#FFFFFF" stroke="#E4E7EC" strokeWidth="0.5" filter={`url(#${id}-node)`} />
              <g transform="translate(154 34) scale(0.0288)" className="ui-eo-icon" fill="#6B6F76" fillOpacity="0.55">
                <path d="M278 88C278 115.614 300.386 138 328 138H366C393.614 138 416 160.386 416 188V228C416 255.614 393.614 278 366 278H328C300.386 278 278 300.386 278 328V366C278 393.614 255.614 416 228 416H188C160.386 416 138 393.614 138 366V328C138 300.386 115.614 278 88 278H50C22.3858 278 0 255.614 0 228V188C0 160.386 22.3858 138 50 138H88C115.614 138 138 115.614 138 88V50C138 22.3858 160.386 0 188 0H228C255.614 0 278 22.3858 278 50V88ZM140 226C140 253.614 162.386 276 190 276H226C253.614 276 276 253.614 276 226V190C276 162.386 253.614 140 226 140H190C162.386 140 140 162.386 140 190V226Z" />
              </g>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ---------- Logo (nested SVG, placed in the 320 × 240 artboard) ---------- */

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-eo {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
}
.ui-eo-art {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

/* Comets: one full turn around the center every 7 s */
.ui-eo-spin {
  transform-origin: 160px 120px;
  animation: ui-eo-turn 7s linear infinite;
}
.ui-eo-reverse { animation-direction: reverse; }

/* Nodes: one orbit every 22 s, turned back around their own center to stay upright */
.ui-eo-orbit {
  transform-origin: 160px 120px;
  animation: ui-eo-turn 22s linear infinite;
}
.ui-eo-upright {
  transform-box: fill-box;
  transform-origin: center;
  animation: ui-eo-turn 22s linear infinite reverse;
}
@keyframes ui-eo-turn {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Reduced motion: everything stays put, the nodes keep their staggered spots on the ring */
@media (prefers-reduced-motion: reduce) {
  .ui-eo-spin, .ui-eo-orbit, .ui-eo-upright { animation-play-state: paused; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-eo-rings { stroke: rgba(255, 255, 255, 0.14); }
:where(.dark, [data-theme="dark"]) .ui-eo-tile { fill: #232326; stroke: rgba(255, 255, 255, 0.08); }
:where(.dark, [data-theme="dark"]) .ui-eo-drop { flood-opacity: 0.4; }
:where(.dark, [data-theme="dark"]) .ui-eo-sliver { flood-color: #1a1a1c; }
:where(.dark, [data-theme="dark"]) .ui-eo-icon { fill: #c4c4c4; }
:where(.dark, [data-theme="dark"]) .ui-eo-mark { fill: #ededed; }
`;

/** Grok mark, monochrome */
const GrokLogo = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 33.4 32" overflow="visible">
    <path className="ui-eo-mark" fill="#171717" d="M12.8734 20.5407L23.9549 12.3506C24.4982 11.9491 25.2747 12.1057 25.5336 12.7294C26.896 16.0185 26.2873 19.9712 23.5766 22.6851C20.866 25.3989 17.0944 25.9941 13.6471 24.6386L9.88123 26.3843C15.2826 30.0806 21.8416 29.1665 25.9403 25.0601C29.1914 21.8051 30.1983 17.3683 29.2568 13.3673L29.2653 13.3758C27.9 7.49809 29.601 5.14871 33.0853 0.344576C33.1677 0.230667 33.2502 0.116757 33.3327 0L28.7476 4.59055V4.57631L12.8706 20.5436" />
    <path className="ui-eo-mark" fill="#171717" d="M10.5867 22.5312C6.70979 18.8234 7.37821 13.0852 10.6862 9.77618C13.1323 7.3271 17.14 6.32755 20.6385 7.79698L24.3959 6.05986C23.719 5.57005 22.8514 5.04322 21.8559 4.67301C17.3562 2.81914 11.969 3.7418 8.31115 7.40114C4.79271 10.9238 3.68626 16.3402 5.58628 20.9621C7.0056 24.4164 4.67893 26.8597 2.3352 29.3259C1.50465 30.2001 0.67126 31.0744 0 31.9999L10.5838 22.534" />
  </svg>
);
