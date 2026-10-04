"use client";

import { useId, useSyncExternalStore } from "react";

/*
 * Lead Sourcing – a small card illustration, in a single self-contained file.
 * A ChatGPT tile in the middle, connected to Gmail on the left and Grok on the right,
 * with four empty tiles fading out around it. A colored shine runs along the connecting line.
 * The artwork is drawn on a 320 × 240 viewBox inside a 3 : 2 frame with a soft grid behind it.
 */

export type LeadSourcingProps = {
  className?: string;
  /** Accessible description of the scene */
  label?: string;
};

/** Diagonal tiles: corner, x, y and the inner corner they fade out from */
const TILES = [
  ["tl", 67, 27, 117, 77],
  ["tr", 203, 27, 203, 77],
  ["bl", 67, 163, 117, 163],
  ["br", 203, 163, 203, 163],
] as const;

export function LeadSourcing({
  className,
  label = "A ChatGPT tile connected to Gmail and Grok, surrounded by empty tiles",
}: LeadSourcingProps) {
  const id = useSvgId();
  const reducedMotion = useReducedMotion();

  return (
    <div className={["ui-ls", className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-lead-sourcing" precedence="default">
        {css}
      </style>
      <div className="ui-ls-grid" aria-hidden="true" />
      <svg className="ui-ls-art" viewBox="0 0 320 240" aria-hidden="true">
        <defs>
          {/* Drop shadow plus a thin light-gray inner edge at the bottom of each tile */}
          <filter id={`${id}-tile`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="dropBlur" />
            <feOffset in="dropBlur" dx="0" dy="3" result="dropOffset" />
            <feFlood className="ui-ls-drop" floodColor="#000000" floodOpacity="0.06" result="dropColor" />
            <feComposite in="dropColor" in2="dropOffset" operator="in" result="dropShadow" />
            <feOffset in="SourceAlpha" dx="0" dy="-4" result="alphaUp" />
            <feComposite in="SourceAlpha" in2="alphaUp" operator="out" result="bottomSliver" />
            <feFlood className="ui-ls-sliver" floodColor="#EAECEF" floodOpacity="1" result="innerColor" />
            <feComposite in="innerColor" in2="bottomSliver" operator="in" result="innerShadow" />
            <feMerge>
              <feMergeNode in="dropShadow" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="innerShadow" />
            </feMerge>
          </filter>
          <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <linearGradient id={`${id}-blob`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFA0AB" stopOpacity="0.6" />
            <stop offset="33%" stopColor="#FFB89E" stopOpacity="0.6" />
            <stop offset="66%" stopColor="#C8A8E5" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A8B5FF" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop className="ui-ls-gray" offset="0%" stopColor="#E4E7EC" />
            <stop offset="18%" stopColor="#FFB5BC" />
            <stop offset="40%" stopColor="#FFC5AB" />
            <stop offset="60%" stopColor="#D5BBEF" />
            <stop offset="82%" stopColor="#B5C0FF" />
            <stop className="ui-ls-gray" offset="100%" stopColor="#E4E7EC" />
          </linearGradient>
          {/* Gray line with a colored shine that sweeps across every 5 seconds */}
          <linearGradient id={`${id}-shine`} gradientUnits="userSpaceOnUse" x1="-195" y1="120" x2="195" y2="120">
            <stop className="ui-ls-gray" offset="0%" stopColor="#E4E7EC" />
            <stop className="ui-ls-gray" offset="43%" stopColor="#E4E7EC" />
            <stop offset="46%" stopColor="#FF6B5C" />
            <stop offset="48%" stopColor="#FFB89E" />
            <stop offset="50%" stopColor="#C8A8E5" />
            <stop offset="52%" stopColor="#A8B5FF" />
            <stop className="ui-ls-gray" offset="56%" stopColor="#E4E7EC" />
            <stop className="ui-ls-gray" offset="100%" stopColor="#E4E7EC" />
            {!reducedMotion && (
              <>
                <animate
                  attributeName="x1"
                  values="-195;125;125"
                  keyTimes="0;0.3;1"
                  dur="3.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="x2"
                  values="195;515;515"
                  keyTimes="0;0.3;1"
                  dur="3.6s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </linearGradient>
          {/* Empty tiles: built like the middle row, then masked so they fade out radially
              from their inner corner (towards the center) to the outer corner */}
          {TILES.map(([corner, x, y, ix, iy]) => (
            <g key={corner}>
              <radialGradient id={`${id}-fade-${corner}`} gradientUnits="userSpaceOnUse" cx={ix} cy={iy} r="78">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="38%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              <mask id={`${id}-mask-${corner}`} maskUnits="userSpaceOnUse" x={x - 16} y={y - 16} width="82" height="88">
                <rect x={x - 16} y={y - 16} width="82" height="88" fill={`url(#${id}-fade-${corner})`} />
              </mask>
            </g>
          ))}
          {/* Fades the line out at its far left and right ends */}
          <linearGradient id={`${id}-ends`} gradientUnits="userSpaceOnUse" x1="25" y1="120" x2="295" y2="120">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="22%" stopColor="#FFFFFF" />
            <stop offset="78%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
          <mask id={`${id}-ends-mask`} maskUnits="userSpaceOnUse" x="20" y="115" width="280" height="10">
            <rect x="20" y="115" width="280" height="10" fill={`url(#${id}-ends)`} />
          </mask>
        </defs>

        {/* Glow sitting on the bottom edge of the middle tile */}
        <ellipse cx="160" cy="152" rx="22" ry="8" fill={`url(#${id}-blob)`} filter={`url(#${id}-blur)`} />

        {/* Connecting line */}
        <line
          x1="25"
          y1="120"
          x2="295"
          y2="120"
          stroke={`url(#${id}-shine)`}
          strokeWidth="1.5"
          mask={`url(#${id}-ends-mask)`}
        />

        {/* Left tile: Gmail */}
        <rect
          x="45"
          y="95"
          width="50"
          height="50"
          rx="10"
          className="ui-ls-tile"
          fill="#FFFFFF"
          stroke="#E4E7EC"
          strokeWidth="0.5"
          filter={`url(#${id}-tile)`}
        />
        <GmailLogo x={58} y={110.45} width={24} />

        {/* Right tile: Grok */}
        <rect
          x="225"
          y="95"
          width="50"
          height="50"
          rx="10"
          className="ui-ls-tile"
          fill="#FFFFFF"
          stroke="#E4E7EC"
          strokeWidth="0.5"
          filter={`url(#${id}-tile)`}
        />
        <GrokLogo x={238} y={107} size={26} />

        {/* Four empty echo tiles on the diagonals – same 3D tile as the middle row, fading outwards */}
        {TILES.map(([corner, x, y]) => (
          <g key={corner} mask={`url(#${id}-mask-${corner})`}>
            <rect
              x={x}
              y={y}
              width="50"
              height="50"
              rx="10"
              className="ui-ls-tile"
              fill="#FFFFFF"
              stroke="#E4E7EC"
              strokeWidth="0.5"
              filter={`url(#${id}-tile)`}
            />
          </g>
        ))}

        {/* Middle tile: ChatGPT, with a colored bottom edge */}
        <rect
          x="128"
          y="88"
          width="64"
          height="64"
          rx="14"
          className="ui-ls-tile"
          fill="#FFFFFF"
          stroke="#E4E7EC"
          strokeWidth="0.5"
          filter={`url(#${id}-tile)`}
        />
        <path
          d="M128 138 A 14 14 0 0 0 142 152 L178 152 A 14 14 0 0 0 192 138"
          fill="none"
          stroke={`url(#${id}-edge)`}
          strokeWidth="0.5"
        />
        <ChatGPTLogo x={146} y={106} size={28} />
      </svg>
    </div>
  );
}

/** Unique ids for gradients, filters and masks, so several illustrations on one page don't clash */
const useSvgId = () => "ui-ls" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

/** True when the visitor asked for reduced motion (SVG <animate> ignores CSS media queries) */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const media = matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/* ---------- Logos (nested SVGs, placed in the 320 × 240 artboard) ---------- */

const GmailLogo = ({ x, y, width }: { x: number; y: number; width: number }) => {
  const id = useSvgId();
  return (
    <svg x={x} y={y} width={width} height={(width * 44.8722) / 56.4108} viewBox="0 0 56.4108 44.8722" fill="none">
      <path
        d="M44.2255 5.76727H56.4051V41.0239C56.4051 43.148 54.683 44.8701 52.5589 44.8701H46.1486C45.8961 44.8701 45.646 44.8204 45.4127 44.7237C45.1794 44.6271 44.9674 44.4854 44.7888 44.3069C44.6102 44.1283 44.4686 43.9163 44.3719 43.683C44.2753 43.4497 44.2255 43.1996 44.2255 42.947V5.76727Z"
        fill={`url(#${id}-0)`}
      />
      <path
        d="M12.1796 5.76727H0V41.0239C0 43.148 1.72213 44.8701 3.84618 44.8701H10.2565C10.509 44.8701 10.7591 44.8204 10.9924 44.7237C11.2257 44.6271 11.4377 44.4854 11.6163 44.3069C11.7949 44.1283 11.9365 43.9163 12.0332 43.683C12.1298 43.4497 12.1796 43.1996 12.1796 42.947V5.76727Z"
        fill="#FC413D"
      />
      <path
        d="M10.0085 1.42778C7.43377 -0.736342 3.5924 -0.403647 1.42828 2.17105C-0.735843 4.74543 -0.403148 8.58681 2.17155 10.7512L26.5557 31.2479C27.0178 31.6362 27.602 31.8492 28.2056 31.8492C28.8091 31.8492 29.3934 31.6362 29.8554 31.2479L54.2396 10.7509C56.814 8.58681 57.1467 4.74543 54.9825 2.17073C52.8184 -0.403648 48.977 -0.736342 46.4027 1.42778L28.2054 16.724L10.0085 1.42778Z"
        fill={`url(#${id}-1)`}
      />
      <defs>
        <linearGradient
          id={`${id}-0`}
          x1="50.3153"
          y1="5.76727"
          x2="50.3153"
          y2="44.8701"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#60D673" />
          <stop offset="0.17" stopColor="#42C868" />
          <stop offset="0.39" stopColor="#0EBC5F" />
          <stop offset="0.62" stopColor="#00A9BB" />
          <stop offset="0.86" stopColor="#3C90FF" />
          <stop offset="1" stopColor="#3186FF" />
        </linearGradient>
        <linearGradient
          id={`${id}-1`}
          x1="6.04194e-05"
          y1="6.45153"
          x2="56.4107"
          y2="6.45153"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.08" stopColor="#FF63A0" />
          <stop offset="0.3" stopColor="#FC413D" />
          <stop offset="0.5" stopColor="#FC413D" />
          <stop offset="0.65" stopColor="#FC413D" />
          <stop offset="0.72" stopColor="#FC5C30" />
          <stop offset="0.86" stopColor="#FEB10C" />
          <stop offset="0.91" stopColor="#FEC700" />
          <stop offset="0.96" stopColor="#FFDB0F" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-ls {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
}
.ui-ls-grid {
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
.ui-ls-art {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-ls-grid {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
}
:where(.dark, [data-theme="dark"]) .ui-ls-tile { fill: #232326; stroke: rgba(255, 255, 255, 0.08); }
:where(.dark, [data-theme="dark"]) .ui-ls-drop { flood-opacity: 0.4; }
:where(.dark, [data-theme="dark"]) .ui-ls-sliver { flood-color: #1a1a1c; }
:where(.dark, [data-theme="dark"]) .ui-ls-gray { stop-color: #3a3a3f; }
:where(.dark, [data-theme="dark"]) .ui-ls-mark { fill: #ededed; }
`;

/** ChatGPT mark, monochrome */
const ChatGPTLogo = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 68.614 68.002" overflow="visible">
    <path
      className="ui-ls-mark"
      fill="#171717"
      d="M26.3166 24.7525V18.2923C26.3166 17.7482 26.5208 17.3401 26.9966 17.0684L39.9853 9.5882C41.7533 8.56821 43.8615 8.09244 46.0372 8.09244C54.1973 8.09244 59.3658 14.4167 59.3658 21.1486C59.3658 21.6245 59.3658 22.1686 59.2976 22.7127L45.8331 14.8243C45.0172 14.3486 44.2009 14.3486 43.385 14.8243L26.3166 24.7525ZM56.6454 49.9134V34.4766C56.6454 33.5244 56.2371 32.8444 55.4213 32.3685L38.3529 22.4403L43.9291 19.244C44.405 18.9723 44.8131 18.9723 45.289 19.244L58.2776 26.7242C62.018 28.9005 64.5338 33.5244 64.5338 38.0122C64.5338 43.1802 61.4739 47.9406 56.6454 49.9128V49.9134ZM22.3045 36.3131L16.7284 33.0492C16.2526 32.7775 16.0484 32.3692 16.0484 31.8251V16.8649C16.0484 9.58891 21.6245 4.08038 29.1729 4.08038C32.0293 4.08038 34.6809 5.03262 36.9255 6.7326L23.5292 14.485C22.7134 14.9608 22.3052 15.6408 22.3052 16.5932V36.3137L22.3045 36.3131ZM34.307 43.2491L26.3166 38.7611V29.2412L34.307 24.7532L42.2968 29.2412V38.7611L34.307 43.2491ZM39.4411 63.9219C36.5848 63.9219 33.9333 62.9697 31.6886 61.2699L45.0848 53.5173C45.9007 53.0415 46.3089 52.3615 46.3089 51.4091V31.6886L51.9533 34.9525C52.4291 35.2242 52.6333 35.6324 52.6333 36.1766V51.1369C52.6333 58.4128 46.9889 63.9214 39.4411 63.9214V63.9219ZM23.3245 48.7576L10.3358 41.2775C6.59541 39.1011 4.07967 34.4773 4.07967 29.9894C4.07967 24.7532 7.2078 20.0612 12.0356 18.0889V33.5933C12.0356 34.5455 12.4439 35.2255 13.2597 35.7014L30.2605 45.5613L24.6844 48.7576C24.2086 49.0293 23.8003 49.0293 23.3245 48.7576ZM22.5769 59.9099C14.8926 59.9099 9.24834 54.1297 9.24834 46.9895C9.24834 46.4454 9.31651 45.9013 9.38411 45.3572L22.7804 53.1097C23.5962 53.5856 24.4127 53.5856 25.2284 53.1097L42.2968 43.2498V49.71C42.2968 50.2541 42.0927 50.6622 41.6168 50.9339L28.6283 58.4141C26.8601 59.4341 24.752 59.9099 22.5762 59.9099H22.5769ZM39.4411 68.0017C47.6694 68.0017 54.5372 62.1538 56.1019 54.4013C63.718 52.4291 68.6141 45.2889 68.6141 38.0129C68.6141 33.2526 66.5743 28.6288 62.9021 25.2966C63.2421 23.8685 63.4462 22.4403 63.4462 21.0129C63.4462 11.2887 55.5578 4.01207 46.4454 4.01207C44.6098 4.01207 42.8416 4.28375 41.0735 4.89614C38.0129 1.90392 33.7968 0 29.1729 0C20.9447 0 14.0769 5.84782 12.5122 13.6003C4.89614 15.5725 0 22.7127 0 29.9887C0 34.749 2.03983 39.3728 5.71204 42.705C5.37205 44.1331 5.16797 45.5613 5.16797 46.9889C5.16797 56.713 13.0563 63.9895 22.1686 63.9895C24.0044 63.9895 25.7725 63.7179 27.5407 63.1055C30.6005 66.0977 34.8166 68.0017 39.4411 68.0017Z"
    />
  </svg>
);

/** Grok mark, monochrome */
const GrokLogo = ({ x, y, size }: { x: number; y: number; size: number }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 33.4 32" overflow="visible">
    <path
      className="ui-ls-mark"
      fill="#171717"
      d="M12.8734 20.5407L23.9549 12.3506C24.4982 11.9491 25.2747 12.1057 25.5336 12.7294C26.896 16.0185 26.2873 19.9712 23.5766 22.6851C20.866 25.3989 17.0944 25.9941 13.6471 24.6386L9.88123 26.3843C15.2826 30.0806 21.8416 29.1665 25.9403 25.0601C29.1914 21.8051 30.1983 17.3683 29.2568 13.3673L29.2653 13.3758C27.9 7.49809 29.601 5.14871 33.0853 0.344576C33.1677 0.230667 33.2502 0.116757 33.3327 0L28.7476 4.59055V4.57631L12.8706 20.5436"
    />
    <path
      className="ui-ls-mark"
      fill="#171717"
      d="M10.5867 22.5312C6.70979 18.8234 7.37821 13.0852 10.6862 9.77618C13.1323 7.3271 17.14 6.32755 20.6385 7.79698L24.3959 6.05986C23.719 5.57005 22.8514 5.04322 21.8559 4.67301C17.3562 2.81914 11.969 3.7418 8.31115 7.40114C4.79271 10.9238 3.68626 16.3402 5.58628 20.9621C7.0056 24.4164 4.67893 26.8597 2.3352 29.3259C1.50465 30.2001 0.67126 31.0744 0 31.9999L10.5838 22.534"
    />
  </svg>
);
