"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/*
 * Integration Flow – an animated product scene, in a single self-contained file.
 * A "Data Analysis" hub on the left, integration pills rotating along a dashed arc on the right.
 * The pill in the centre charges up, a beam sweeps over to the hub, the hub lights up, then the
 * pills move on. Drawn on a 2400 × 1490 stage and scaled to the width of its container.
 */

export type IntegrationItem = {
  /** Shown as the second line of the pill, e.g. "Slack" */
  name: string;
  /** Logo, drawn into a 64 × 64 box inside the round badge (an <svg> fills the box) */
  icon: ReactNode;
  /** First line of the pill */
  title?: string;
  /** Single-color logo: white on the passing pills, black (white in dark mode) in the centre */
  mono?: boolean;
};

export type IntegrationFlowProps = {
  className?: string;
  /** Accessible description of the scene */
  label?: string;
  /** Integrations that rotate through the pills (5 or more look best) */
  items?: IntegrationItem[];
};

/* Sequence timing (ms) – STEP and SWEEP mirror --ui-if-step and --ui-if-sweep in the CSS */
const STEP = 900; // pill travel
const SETTLE = 320; // pause once the new pill has landed in the centre
const CHARGE = 620; // centre pill loads up before firing
const SWEEP = 1100; // beam travel, right to left
const GAP = 260; // pause after the sweep, before the next pill moves

const W = 2400;
const PILLS = [0, 1, 2, 3, 4, 5];
const BLOBS = [283, 292, 291, 287, 288, 284, 289, 293, 290, 285, 286, 294, 296, 295];

// useLayoutEffect measures before the first paint; on the server it simply never runs
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function IntegrationFlow({
  className,
  label = "Integrations like Slack, Okta and Snowflake sending data into a central data analysis hub",
  items,
}: IntegrationFlowProps) {
  const root = useRef<HTMLDivElement>(null);
  const uid = "ui-if" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [scale, setScale] = useState(0);
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [chargeOut, setChargeOut] = useState(false);
  const [chargeIn, setChargeIn] = useState(false);
  const [sweep, setSweep] = useState(0);

  // Scale the 2400 × 1490 stage to the container width
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / W);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The cycle is strictly sequential: pill lands → settle → charge → beam fires → hub receives → gap → next pill
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const loop = () => {
      setChargeOut(true); // centre pill fades up
      later(() => {
        setSweep((n) => n + 1); // …and fires
        setChargeOut(false);
        later(() => setChargeIn(true), SWEEP * 0.55); // hub fades up as the beam reaches it
        later(() => setChargeIn(false), SWEEP + 150);
        later(() => {
          setStep((s) => s + 1); // pills move on
          setExiting(true);
          later(() => setExiting(false), STEP); // the exiting pill jumps back up to the staging slot
          later(loop, STEP + SETTLE);
        }, SWEEP + GAP);
      }, CHARGE);
    };
    later(loop, 700);
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const list = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const n = list.length;

  return (
    <div ref={root} className={["ui-if", className].filter(Boolean).join(" ")} role="img" aria-label={label}>
      {/* React 19 hoists this into <head> once, no matter how many instances render */}
      <style href="ui-integration-flow" precedence="default">
        {css}
      </style>
      <div
        className="ui-if-stage"
        aria-hidden="true"
        style={{ transform: `scale(${scale})`, visibility: scale > 0 ? undefined : "hidden" }}
      >
        <Defs id={uid} />
        <div className="ui-if-artboard">
          <div className="ui-if-blobs">
            {BLOBS.map((b) => (
              <div key={b} className={`ui-if-blob ui-if-blob--${b}`} />
            ))}
          </div>

          <svg className="ui-if-orbit" viewBox="0 0 4052 4154" preserveAspectRatio="none" fill="none">
            <g stroke={`url(#${uid}-orbit)`} strokeWidth="12" strokeDasharray="40 40" strokeDashoffset="20">
              <path d="M6 2077A2020 2071 0 0 1 2026 6" />
              <path d="M6 2077A2020 2071 0 0 0 2026 4148" />
            </g>
          </svg>

          {/* Charged-state glows, behind the cards so their backdrop blur picks them up */}
          <div className={"ui-if-glow ui-if-glow--out" + (chargeOut ? " ui-if-on" : "")} />
          <div className={"ui-if-glow ui-if-glow--in" + (chargeIn ? " ui-if-on" : "")} />

          <div className={"ui-if-link" + (sweep > 0 ? " ui-if-sweeping" : "")}>
            <span key={`g${sweep}`} className="ui-if-beam ui-if-beam--glow" />
            <span key={`c${sweep}`} className="ui-if-beam ui-if-beam--core" />
          </div>

          <div className={"ui-if-card ui-if-card--light ui-if-hub" + (chargeIn ? " ui-if-charged" : "")}>
            <span className="ui-if-bg ui-if-bg--charge ui-if-bg--charge-in" />
            <span className="ui-if-label ui-if-label--right">
              <span className="ui-if-title">Data Analysis</span>
              <span className="ui-if-sub">Centralized Data Processing</span>
            </span>
            <span className="ui-if-badge">
              <Ring id={uid} kind="light" />
              <svg className="ui-if-ring" viewBox="0 0 118.639 118.639" overflow="visible">
                <path className="ui-if-hub-icon" d="M71.6334 38.9418C71.7204 38.6914 71.7305 38.4207 71.6625 38.1645C71.5944 37.9082 71.4513 37.6782 71.2515 37.5039C68.4543 35.0908 64.9512 33.6478 61.2659 33.3908C55.4731 32.9703 51.8844 34.5218 50.0719 35.6745C49.8912 35.7907 49.7412 35.9486 49.6342 36.1348C49.5273 36.3211 49.4667 36.5303 49.4575 36.7448C49.4482 36.9594 49.4907 37.173 49.5812 37.3678C49.6717 37.5626 49.8076 37.7327 49.9776 37.864L64.741 49.3383C65.0427 49.5723 65.396 49.7309 65.7713 49.8008C66.1467 49.8707 66.5333 49.85 66.899 49.7403C67.2648 49.6306 67.599 49.4351 67.8739 49.1702C68.1488 48.9052 68.3565 48.5784 68.4796 48.217L71.6334 38.9418ZM35.2432 72.9999C34.9502 73.1984 34.7269 73.4838 34.6047 73.8159C34.4824 74.148 34.4674 74.51 34.5617 74.8511C35.1248 76.869 36.7971 81.0668 41.5459 84.8851C46.2922 88.7034 51.9085 89.1167 54.3083 89.0587C54.6589 89.052 54.9986 88.9349 55.2789 88.724C55.5591 88.5131 55.7658 88.2193 55.8694 87.8842L65.3307 57.9344C66.0146 55.7715 63.5907 53.959 61.7105 55.2229L35.2432 72.9999ZM42.1597 41.3948C41.9304 41.3047 41.6842 41.2659 41.4384 41.2809C41.1925 41.296 40.9529 41.3645 40.7363 41.4818C38.9866 42.4339 34.5013 45.3726 32.1861 51.4046C30.4026 56.0543 31.0309 61.1969 31.5215 63.7127C31.6834 64.5343 32.551 65.008 33.3292 64.7035L61.7226 53.6183C63.7502 52.828 63.7574 49.9618 61.7347 49.1595L42.1597 41.3948ZM84.2774 62.8572C85.099 63.413 86.2204 62.9224 86.3629 61.9388C86.7399 59.3409 87.0638 54.8169 85.5606 51.4046C83.5548 46.8564 80.1521 44.0531 78.5354 42.9124C78.2869 42.7393 77.9876 42.6546 77.6853 42.6716C77.383 42.6887 77.0952 42.8067 76.8679 43.0067L69.7024 49.3625C69.4297 49.6048 69.2158 49.9061 69.0771 50.2435C68.9385 50.5809 68.8786 50.9455 68.9022 51.3096C68.9257 51.6736 69.032 52.0275 69.213 52.3442C69.394 52.661 69.6448 52.9322 69.9465 53.1373L84.2774 62.8572ZM64.2553 87.1133C64.1828 87.9591 64.9005 88.6599 65.7439 88.5681C68.4579 88.2781 74.0379 87.2003 78.2139 83.2079C81.1159 80.4078 83.1261 76.8128 83.9922 72.8743C84.0433 72.6294 84.0395 72.3762 83.9809 72.133C83.9224 71.8898 83.8107 71.6626 83.6539 71.4678L71.1259 56.0108C69.7677 54.336 67.0634 55.1625 66.8749 57.3085L64.2553 87.1133Z" fill="black" />
              </svg>
            </span>
          </div>

          {/*
            Six pills move through six phases: 3 is the centre, 1, 2, 4 and 5 are the passing slots,
            0 is the invisible staging slot above the frame and 6 the invisible exit below it.
          */}
          <div className={"ui-if-pills" + (chargeOut ? " ui-if-charged" : "")}>
            {PILLS.map((i) => {
              const raw = (i + step) % 6;
              const phase = raw === 0 && exiting && step > 0 ? 6 : raw;
              const item = list[(((phase - 1 - step) % n) + n) % n];
              return (
                <div
                  key={i}
                  className="ui-if-card ui-if-card--icon-left ui-if-pill"
                  data-phase={phase}
                  data-fill={item.mono ? "black" : "color"}
                >
                  <span className="ui-if-bg ui-if-bg--ghost" />
                  <span className="ui-if-bg ui-if-bg--light" />
                  <span className="ui-if-bg ui-if-bg--charge ui-if-bg--charge-out" />
                  <span className="ui-if-badge">
                    <Ring id={uid} kind="ghost" />
                    <Ring id={uid} kind="light" />
                    <span className="ui-if-icon">{item.icon}</span>
                  </span>
                  <span className="ui-if-label">
                    <span className="ui-if-title">{item.title ?? "API Integration"}</span>
                    <span className="ui-if-sub">{item.name}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* White fade over everything, in stage coordinates */}
        <div className="ui-if-fade" />
      </div>
    </div>
  );
}

/* ---------- Badge rings and shared SVG definitions ---------- */

function Ring({ id, kind }: { id: string; kind: "ghost" | "light" }) {
  return (
    <svg className={`ui-if-ring ui-if-ring--${kind}`} viewBox="0 0 118.639 118.639" overflow="visible">
      {/* In dark mode the CSS swaps in a softer rim through --ui-if-ring-dark */}
      <g
        filter={`url(#${id}-${kind}-shadow)`}
        style={{ "--ui-if-ring-dark": `url(#${id}-dark-shadow)` } as CSSProperties}
      >
        <circle
          cx="59.3193"
          cy="59.3193"
          r="59.3193"
          fill={`url(#${id}-${kind}-fill)`}
          fillOpacity={kind === "ghost" ? 0.2 : 1}
        />
      </g>
    </svg>
  );
}

/** Inner shadows from the design: a soft dark one from the top, a light rim from the bottom */
function RingShadow({ id, dark, light }: { id: string; dark: number; light: number }) {
  return (
    <filter
      id={id}
      x="0"
      y="-2"
      width="118.639"
      height="122.639"
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feFlood floodOpacity="0" result="bg" />
      <feBlend mode="normal" in="SourceGraphic" in2="bg" result="shape" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
      <feOffset dy="4" />
      <feGaussianBlur stdDeviation="1" />
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
      <feColorMatrix type="matrix" values={`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${dark} 0`} />
      <feBlend mode="normal" in2="shape" result="inner1" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
      <feOffset dy="-2" />
      <feGaussianBlur stdDeviation="2" />
      <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
      <feColorMatrix className="ui-if-rim" type="matrix" values={`0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${light} 0`} />
      <feBlend mode="normal" in2="inner1" />
    </filter>
  );
}

function RingFill({ id, kind }: { id: string; kind: "ghost" | "light" }) {
  return (
    <radialGradient
      id={id}
      cx="0"
      cy="0"
      r="1"
      gradientUnits="userSpaceOnUse"
      gradientTransform="translate(59.3193 4.82032) rotate(90) scale(113.818)"
    >
      <stop className={`ui-if-stop-${kind}-a`} stopColor="white" stopOpacity="0.4" />
      <stop className={`ui-if-stop-${kind}-b`} offset="1" stopColor="white" stopOpacity="0.8" />
    </radialGradient>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <svg className="ui-if-defs" width="0" height="0">
      <defs>
        <RingShadow id={`${id}-ghost-shadow`} dark={0.05} light={0.3} />
        <RingShadow id={`${id}-light-shadow`} dark={0.15} light={1} />
        <RingShadow id={`${id}-dark-shadow`} dark={0.35} light={0.16} />
        <RingFill id={`${id}-ghost-fill`} kind="ghost" />
        <RingFill id={`${id}-light-fill`} kind="light" />
        {/* Dashed orbit: white, strongest on the left and fading out towards both ends */}
        <radialGradient id={`${id}-orbit`} cx="0" cy="2077" r="1733" gradientUnits="userSpaceOnUse">
          <stop className="ui-if-orbit-stop" stopColor="white" stopOpacity="0.6" />
          <stop className="ui-if-orbit-stop" offset="0.2" stopColor="white" stopOpacity="0.576" />
          <stop className="ui-if-orbit-stop" offset="0.4" stopColor="white" stopOpacity="0.504" />
          <stop className="ui-if-orbit-stop" offset="0.6" stopColor="white" stopOpacity="0.384" />
          <stop className="ui-if-orbit-stop" offset="0.8" stopColor="white" stopOpacity="0.216" />
          <stop className="ui-if-orbit-stop" offset="0.9" stopColor="white" stopOpacity="0.114" />
          <stop className="ui-if-orbit-stop" offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ---------- Default integrations ----------
   Each logo is drawn in badge coordinates (the 118.639px circle); the viewBox frames the
   64 × 64 icon box at 27.32 / 27.32, so every logo lands exactly where it sits in the design. */

const box = "27.32 27.32 64 64";

function ClickUpLogo() {
  const id = "ui-if-cu" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg viewBox={box} fill="none">
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="52.8291" x2="54.0439" y2="52.8291" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8930FD" />
          <stop offset="1" stopColor="#49CCF9" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="1.17896" y1="15.7514" x2="52.9612" y2="15.7514" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF02F0" />
          <stop offset="1" stopColor="#FFC800" />
        </linearGradient>
      </defs>
      <g transform="translate(32.5 27.32)" fillRule="evenodd" clipRule="evenodd">
        <path d="M9.53667e-07 49.2194L9.95256 41.6328C15.2737 48.4413 20.8905 51.651 27.0985 51.651C33.3066 51.651 38.8248 48.5386 43.8504 41.7301L54 49.1222C46.708 58.8486 37.6423 64.0036 27.0985 64.0036C16.6533 64.0036 7.48905 58.8486 9.53667e-07 49.2194Z" fill={`url(#${id}a)`} />
        <path d="M27.0997 16.4377L9.36243 31.5137L1.18359 22.079L27.1982 9.53674e-07L53.0157 22.079L44.7383 31.4164L27.0997 16.4377Z" fill={`url(#${id}b)`} />
      </g>
    </svg>
  );
}

const DEFAULT_ITEMS: IntegrationItem[] = [
  {
    name: "Okta",
    mono: true,
    icon: (
      <svg viewBox={box} fill="none">
        <path transform="translate(28 28)" fillRule="evenodd" clipRule="evenodd" fill="white" d="M34.6 0.4L33.3 16.4C32.7 16.3 32.1 16.3 31.4 16.3C30.6 16.3 29.8 16.4 29.1 16.5L28.4 8.8C28.4 8.6 28.6 8.3 28.8 8.3H30.1L29.5 0.5C29.5 0.3 29.7 0 29.9 0H34.2C34.5 0 34.7 0.2 34.6 0.4ZM23.8 1.2C23.7 1 23.5 0.8 23.3 0.9L19.3 2.4C19 2.5 18.9 2.8 19 3L22.3 10.1L21.1 10.6C20.9 10.7 20.8 10.9 20.9 11.2L24.2 18.2C25.4 17.5 26.7 17 28.1 16.7L23.8 1.2ZM14 5.7L23.3 18.8C22.1 19.6 21.1 20.5 20.2 21.5L14.5 16C14.3 15.8 14.3 15.5 14.5 15.4L15.5 14.6L10 9C9.8 8.8 9.8 8.5 10 8.4L13.3 5.7C13.5 5.4 13.8 5.5 14 5.7ZM6.2 13.2C6 13.1 5.7 13.1 5.6 13.3L3.5 17C3.4 17.2 3.5 17.5 3.7 17.6L10.8 21L10.1 22.1C10 22.3 10.1 22.6 10.3 22.7L17.4 25.9C17.9 24.6 18.6 23.4 19.4 22.3L6.2 13.2ZM0.9 23.3C0.9 23.1 1.2 22.9 1.4 23L16.9 27C16.5 28.3 16.3 29.7 16.2 31.1L8.4 30.5C8.2 30.5 8 30.3 8 30L8.2 28.7L0.6 28C0.4 28 0.2 27.8 0.2 27.5L0.9 23.3ZM0.4 33.8C0.1 33.8 0 34 0 34.3L0.8 38.5C0.8 38.7 1.1 38.9 1.3 38.8L8.9 36.8L9.1 38.1C9.1 38.3 9.4 38.5 9.6 38.4L17.1 36.3C16.7 35 16.4 33.6 16.3 32.2L0.4 33.8ZM2.9 44.9C2.8 44.7 2.9 44.4 3.1 44.3L17.6 37.4C18.1 38.7 18.9 39.9 19.8 41L13.5 45.5C13.3 45.6 13 45.6 12.9 45.4L12 44.3L5.5 48.8C5.3 48.9 5 48.9 4.9 48.7L2.9 44.9ZM20.4 41.9L9.1 53.3C8.9 53.5 8.9 53.8 9.1 53.9L12.4 56.6C12.6 56.8 12.9 56.7 13 56.5L17.6 50.1L18.6 51C18.8 51.2 19.1 51.1 19.2 50.9L23.6 44.5C22.4 43.8 21.3 42.9 20.4 41.9ZM18.2 60.1C18 60 17.9 59.8 18 59.5L24.6 45C25.8 45.6 27.2 46.1 28.5 46.4L26.5 53.9C26.4 54.1 26.2 54.3 26 54.2L24.8 53.7L22.7 61.3C22.6 61.5 22.4 61.7 22.2 61.6L18.2 60.1ZM29.6 46.6L28.3 62.6C28.3 62.8 28.5 63.1 28.7 63.1H33C33.2 63.1 33.4 62.9 33.4 62.6L32.8 54.8H34.1C34.3 54.8 34.5 54.6 34.5 54.3L33.8 46.6C33 46.7 32.3 46.8 31.5 46.8C30.9 46.7 30.2 46.7 29.6 46.6ZM45.1 3.4C45.2 3.2 45.1 2.9 44.9 2.8L40.9 1.3C40.7 1.2 40.4 1.4 40.4 1.6L38.3 9.2L37.1 8.7C36.9 8.6 36.6 8.8 36.6 9L34.6 16.5C36 16.8 37.3 17.3 38.5 17.9L45.1 3.4ZM53.9 9.7L42.6 21.1C41.7 20.1 40.6 19.2 39.4 18.5L43.8 12.1C43.9 11.9 44.2 11.9 44.4 12L45.4 12.9L50 6.5C50.1 6.3 50.4 6.3 50.6 6.4L53.9 9.1C54 9.3 54 9.6 53.9 9.7ZM59.9 18.7C60.1 18.6 60.2 18.3 60.1 18.1L58 14.4C57.9 14.2 57.6 14.1 57.4 14.3L50.9 18.8L50.2 17.7C50.1 17.5 49.8 17.4 49.6 17.6L43.3 22C44.2 23.1 44.9 24.3 45.5 25.6L59.9 18.7ZM62.2 24.5L62.9 28.7C62.9 28.9 62.8 29.2 62.5 29.2L46.6 30.7C46.5 29.3 46.2 27.9 45.8 26.6L53.3 24.5C53.5 24.4 53.8 24.6 53.8 24.8L54 26.1L61.6 24.1C61.9 24.1 62.1 24.3 62.2 24.5ZM61.5 40C61.7 40.1 62 39.9 62 39.7L62.7 35.5C62.7 35.3 62.6 35 62.3 35L54.5 34.3L54.7 33C54.7 32.8 54.6 32.5 54.3 32.5L46.5 31.9C46.5 33.3 46.2 34.7 45.8 36L61.5 40ZM57.4 49.6C57.3 49.8 57 49.9 56.8 49.7L43.6 40.6C44.4 39.5 45.1 38.3 45.6 37L52.7 40.2C52.9 40.3 53 40.6 52.9 40.8L52.2 42L59.3 45.4C59.5 45.5 59.6 45.8 59.5 46L57.4 49.6ZM39.7 44.2L49 57.3C49.1 57.5 49.4 57.5 49.6 57.4L52.9 54.7C53.1 54.5 53.1 54.3 52.9 54.1L47.4 48.5L48.4 47.7C48.6 47.5 48.6 47.3 48.4 47.1L42.9 41.6C42 42.6 40.9 43.5 39.7 44.2ZM39.7 62C39.5 62.1 39.2 61.9 39.2 61.7L35 46.3C36.4 46 37.7 45.5 38.9 44.8L42.2 51.8C42.3 52 42.2 52.3 42 52.4L40.8 52.9L44.1 60C44.2 60.2 44.1 60.5 43.9 60.6L39.7 62Z" />
      </svg>
    ),
  },
  {
    name: "Snowflake",
    icon: (
      <svg viewBox={box} fill="none">
        <path transform="translate(29 30)" fillRule="evenodd" clipRule="evenodd" fill="#29B5E8" d="M58.8218 26.2249L51.6354 30.3657L58.8218 34.4715C59.2515 34.7199 59.6281 35.0505 59.9301 35.4445C60.2321 35.8384 60.4535 36.288 60.5818 36.7675C60.71 37.247 60.7425 37.7471 60.6775 38.2392C60.6125 38.7313 60.4511 39.2057 60.2028 39.6355C59.9544 40.0652 59.6237 40.4419 59.2298 40.7438C58.8359 41.0458 58.3863 41.2672 57.9068 41.3955C57.4273 41.5237 56.9272 41.5563 56.4351 41.4912C55.943 41.4262 55.4685 41.2649 55.0388 41.0165L42.1627 33.5989C41.5725 33.2574 41.0855 32.7631 40.753 32.1679C40.4205 31.5727 40.2548 30.8988 40.2734 30.2173C40.2834 29.9221 40.3289 29.6291 40.4086 29.3446C40.6722 28.3908 41.2986 27.5779 42.1539 27.0801L55.03 19.6887C55.4617 19.4392 55.9383 19.2774 56.4325 19.2123C56.9268 19.1473 57.429 19.1804 57.9105 19.3096C58.392 19.4389 58.8432 19.6619 59.2384 19.9658C59.6336 20.2696 59.965 20.6485 60.2137 21.0805C60.4633 21.5089 60.6255 21.9825 60.6906 22.474C60.7557 22.9655 60.7226 23.4651 60.5931 23.9437C60.4636 24.4223 60.2404 24.8704 59.9363 25.262C59.6322 25.6536 59.2534 25.9809 58.8218 26.2249ZM52.0194 46.2961L39.1476 38.8916C38.5717 38.5611 37.9194 38.387 37.2554 38.3867C36.5915 38.3864 35.939 38.5599 35.3628 38.8899C34.7866 39.2199 34.3069 39.6949 33.9711 40.2678C33.6354 40.8406 33.4555 41.4914 33.4491 42.1553V56.9469C33.4825 57.9297 33.8964 58.8611 34.6034 59.5445C35.3104 60.228 36.2553 60.61 37.2387 60.61C38.222 60.61 39.1669 60.228 39.874 59.5445C40.581 58.8611 40.9948 57.9297 41.0282 56.9469V48.6566L48.232 52.7974C48.6618 53.0461 49.1363 53.2077 49.6285 53.273C50.1207 53.3383 50.6209 53.306 51.1007 53.178C51.5804 53.0499 52.0302 52.8286 52.4244 52.5268C52.8186 52.2249 53.1495 51.8483 53.3982 51.4186C53.6469 50.9889 53.8085 50.5143 53.8737 50.0221C53.939 49.5299 53.9067 49.0297 53.7787 48.55C53.6507 48.0702 53.4294 47.6204 53.1275 47.2262C52.8257 46.832 52.4491 46.5011 52.0194 46.2524V46.2961ZM37.1841 31.8274L31.8173 37.1288C31.6337 37.2995 31.3957 37.3999 31.1453 37.4124H29.5702C29.3204 37.3974 29.0832 37.2973 28.8982 37.1288L23.5619 31.8099C23.395 31.6278 23.2963 31.3934 23.2826 31.1467V29.5759C23.2971 29.3281 23.3956 29.0926 23.5619 28.9083L28.8982 23.5894C29.0836 23.4222 29.3208 23.3236 29.5702 23.3102H31.1453C31.3951 23.3218 31.6328 23.4206 31.8173 23.5894L37.1667 28.9083C37.3317 29.093 37.4287 29.3285 37.4416 29.5759V31.1467C37.4295 31.3929 37.3323 31.6273 37.1667 31.8099L37.1841 31.8274ZM32.9081 30.3526C32.8875 30.0982 32.7814 29.8583 32.607 29.6719L31.0581 28.1404C30.8724 27.9734 30.6354 27.8749 30.3861 27.8611H30.3294C30.0812 27.8741 29.8453 27.9728 29.6618 28.1404L28.1128 29.6719C27.9465 29.8593 27.8495 30.098 27.8379 30.3482V30.4049C27.8489 30.6514 27.9462 30.8862 28.1128 31.0681L29.6705 32.5953C29.8544 32.7622 30.0901 32.8608 30.3381 32.8746H30.3948C30.6441 32.8608 30.8812 32.7623 31.0668 32.5953L32.6158 31.0551C32.7831 30.8727 32.8831 30.6388 32.8994 30.3918L32.9081 30.3526ZM8.69612 14.4352L21.5722 21.8179C22.1488 22.1483 22.8017 22.3221 23.4661 22.3221C24.1306 22.3221 24.7835 22.1483 25.36 21.8179C25.9366 21.4875 26.4166 21.0121 26.7526 20.4388C27.0885 19.8655 27.2686 19.2143 27.2751 18.5498V3.77132C27.2417 2.78852 26.8279 1.85713 26.1208 1.17369C25.4138 0.490242 24.4689 0.10821 23.4855 0.10821C22.5022 0.10821 21.5573 0.490242 20.8503 1.17369C20.1432 1.85713 19.7294 2.78852 19.696 3.77132V12.0616L12.4835 7.91645C12.0537 7.66777 11.5792 7.50617 11.087 7.44088C10.5948 7.37558 10.0946 7.40788 9.61483 7.53591C9.13511 7.66394 8.6853 7.88521 8.29109 8.18708C7.89688 8.48895 7.56599 8.86551 7.31731 9.29526C7.06863 9.72501 6.90703 10.1995 6.84174 10.6917C6.77644 11.1839 6.80874 11.6842 6.93677 12.1639C7.0648 12.6436 7.28607 13.0934 7.58794 13.4876C7.88981 13.8818 8.26637 14.2127 8.69612 14.4614V14.4352ZM36.9529 22.3241C37.7132 22.3842 38.4739 22.2123 39.1345 21.831L52.0063 14.4134C52.436 14.1647 52.8126 13.8338 53.1145 13.4396C53.4163 13.0454 53.6376 12.5956 53.7656 12.1159C53.8937 11.6362 53.926 11.1359 53.8607 10.6437C53.7954 10.1515 53.6338 9.67701 53.3851 9.24726C53.1364 8.81751 52.8055 8.44096 52.4113 8.13909C52.0171 7.83722 51.5673 7.61595 51.0876 7.48791C50.1187 7.22934 49.0868 7.36622 48.2189 7.86846L41.0151 12.0485V3.75822C40.9818 2.77543 40.5679 1.84404 39.8609 1.1606C39.1538 0.477152 38.2089 0.0951197 37.2256 0.0951197C36.2422 0.0951197 35.2973 0.477152 34.5903 1.1606C33.8833 1.84404 33.4694 2.77543 33.4361 3.75822V18.5498C33.4349 19.5075 33.7973 20.4299 34.4502 21.1305C35.103 21.8311 35.9975 22.2577 36.9529 22.3241ZM23.7713 38.3985C23.0109 38.3367 22.2497 38.5087 21.5897 38.8916L8.69612 46.2786C7.8282 46.7809 7.19535 47.6073 6.93677 48.5761C6.67819 49.545 6.81508 50.5769 7.31731 51.4448C7.81955 52.3127 8.64599 52.9456 9.61483 53.2041C10.5837 53.4627 11.6156 53.3258 12.4835 52.8236L19.696 48.6828V56.9731C19.7294 57.9559 20.1432 58.8873 20.8503 59.5707C21.5573 60.2542 22.5022 60.6362 23.4855 60.6362C24.4689 60.6362 25.4138 60.2542 26.1208 59.5707C26.8279 58.8873 27.2417 57.9559 27.2751 56.9731V42.1553C27.2731 41.2025 26.9108 40.2856 26.261 39.5888C25.6111 38.892 24.7217 38.4668 23.7713 38.3985ZM20.2807 31.4739C20.5292 30.6566 20.4918 29.7789 20.1745 28.9857C19.8572 28.1925 19.2791 27.5311 18.5354 27.1106L5.67235 19.6974C4.80363 19.1998 3.77339 19.066 2.80638 19.3251C1.83937 19.5842 1.01408 20.2153 0.510558 21.0805C0.26128 21.5088 0.099386 21.9822 0.0342402 22.4734C-0.0309056 22.9646 0.00199007 23.4638 0.131024 23.9422C0.260059 24.4206 0.48267 24.8687 0.785982 25.2605C1.08929 25.6523 1.46728 25.9801 1.89809 26.2249L9.08445 30.3657L1.89809 34.4715C1.46834 34.7193 1.09161 35.0494 0.789414 35.4428C0.487216 35.8362 0.265466 36.2853 0.136824 36.7644C0.00818249 37.2435 -0.0248309 37.7433 0.0396687 38.2352C0.104168 38.727 0.264918 39.2014 0.512739 39.6311C0.760561 40.0609 1.0906 40.4376 1.48401 40.7398C1.87743 41.042 2.32651 41.2638 2.80563 41.3924C3.28474 41.521 3.7845 41.5541 4.27637 41.4896C4.76825 41.4251 5.2426 41.2643 5.67235 41.0165L18.5354 33.5989C19.3637 33.1364 19.9858 32.377 20.2763 31.4739H20.2807ZM60.9249 6.94344H60.3446V7.65466H60.9205C61.1867 7.65466 61.3568 7.53248 61.3568 7.30559C61.3568 7.0787 61.1998 6.94344 60.9205 6.94344H60.9249ZM59.6421 6.28894H60.9511C61.6579 6.28894 62.1291 6.67728 62.1291 7.27941C62.1314 7.44702 62.089 7.6122 62.0061 7.75792C61.9233 7.90365 61.8031 8.02464 61.6579 8.10844L62.1684 8.84147V8.98983H61.431L60.9205 8.2917H60.3446V8.98983H59.6377L59.6421 6.28894ZM63.2636 7.69393C63.2848 7.36361 63.2372 7.03249 63.1238 6.72152C63.0104 6.41056 62.8337 6.12652 62.6048 5.8874C62.376 5.64828 62.0999 5.45928 61.7942 5.33237C61.4885 5.20546 61.1598 5.1434 60.8289 5.15012C59.3846 5.15012 58.4247 6.19295 58.4247 7.69393C58.4247 9.12509 59.3846 10.2334 60.8289 10.2334C61.16 10.2413 61.4891 10.1803 61.7953 10.0541C62.1015 9.92799 62.3781 9.73949 62.6075 9.50064C62.8369 9.2618 63.0141 8.97782 63.1278 8.66677C63.2415 8.35572 63.2893 8.02442 63.268 7.69393H63.2636ZM63.8657 7.69393C63.8657 9.39125 62.7313 10.8093 60.8114 10.8093C58.8916 10.8093 57.8051 9.37816 57.8051 7.69393C57.8051 6.00969 58.9265 4.57853 60.8114 4.57853C62.6964 4.57853 63.8614 5.99224 63.8614 7.69393H63.8657Z" />
      </svg>
    ),
  },
  {
    name: "Slack",
    icon: (
      <svg viewBox={box} fill="none">
        <g transform="translate(29.96 30.32)" fill="#36C5F0">
          <path d="M21.504 12.2723C18.1268 12.2723 15.3679 9.51339 15.3679 6.13614C15.3679 2.75888 18.1268 0 21.504 0C24.8813 0 27.6402 2.75888 27.6402 6.13614V12.2723H21.504Z" />
          <path d="M21.5003 15.3679C24.8775 15.3679 27.6364 18.1268 27.6364 21.504C27.6364 24.8813 24.8775 27.6402 21.5003 27.6402H6.13614C2.75888 27.6402 0 24.8813 0 21.504C0 18.1268 2.75888 15.3679 6.13614 15.3679H21.5003Z" />
        </g>
        <g transform="translate(60.73 30.32)" fill="#2EB67D">
          <path d="M15.3485 21.504C15.3485 18.1268 18.1074 15.3679 21.4847 15.3679C24.8619 15.3679 27.6208 18.1268 27.6208 21.504C27.6208 24.8813 24.8619 27.6402 21.4847 27.6402H15.3485V21.504Z" />
          <path d="M12.2723 21.5003C12.2723 24.8775 9.51339 27.6364 6.13613 27.6364C2.75888 27.6364 0 24.8775 0 21.5003V6.13614C0 2.75888 2.75888 0 6.13613 0C9.51339 0 12.2723 2.75888 12.2723 6.13614V21.5003Z" />
        </g>
        <g transform="translate(29.96 61.09)" fill="#E01E5A">
          <path d="M12.2723 6.13613C12.2723 9.51339 9.51339 12.2723 6.13614 12.2723C2.75888 12.2723 0 9.51339 0 6.13613C0 2.75888 2.75888 0 6.13614 0H12.2723V6.13613Z" />
          <path d="M15.3679 6.13613C15.3679 2.75888 18.1268 0 21.504 0C24.8813 0 27.6402 2.75888 27.6402 6.13613V21.5003C27.6402 24.8775 24.8813 27.6364 21.504 27.6364C18.1268 27.6364 15.3679 24.8775 15.3679 21.5003V6.13613Z" />
        </g>
        <g transform="translate(60.73 61.09)" fill="#ECB22E">
          <path d="M6.13613 15.3615C9.51339 15.3615 12.2723 18.1203 12.2723 21.4976C12.2723 24.8748 9.51339 27.6337 6.13613 27.6337C2.75888 27.6337 0 24.8748 0 21.4976V15.3615H6.13613Z" />
          <path d="M6.13613 12.2723C2.75888 12.2723 0 9.51339 0 6.13613C0 2.75888 2.75888 0 6.13613 0H21.5003C24.8775 0 27.6364 2.75888 27.6364 6.13613C27.6364 9.51339 24.8775 12.2723 21.5003 12.2723H6.13613Z" />
        </g>
      </svg>
    ),
  },
  { name: "ClickUp", icon: <ClickUpLogo /> },
  {
    name: "Zendesk",
    mono: true,
    icon: (
      <svg viewBox={box} fill="white">
        <g transform="translate(27.1 34.8)">
          <path d="M29.4728 12.766V48.3541H0L29.4728 12.766Z" />
          <path d="M29.4735 0C29.4735 8.13261 22.8855 14.7207 14.7529 14.7207C6.62027 14.7207 0.0322266 8.13261 0.0322266 0H29.4735Z" />
          <path d="M34.3277 48.3523C34.3277 40.2197 40.9158 33.6316 49.0484 33.6316C57.181 33.6316 63.769 40.2197 63.769 48.3523H34.3277Z" />
          <path d="M34.3277 35.588V0H63.8006L34.3277 35.588Z" />
        </g>
      </svg>
    ),
  },
];

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-if {
  /* Stage background and the color the bottom fades into */
  --ui-if-bg: #ffffff;
  --ui-if-fade: #ffffff;
  /* Sequence timing, in sync with STEP and SWEEP in the component */
  --ui-if-step: .9s;
  --ui-if-sweep: 1.1s;
  --ui-if-step-ease: cubic-bezier(.65, .02, .25, 1);
  --ui-if-sweep-ease: cubic-bezier(.55, .06, .25, 1);
  position: relative;
  width: 100%;
  aspect-ratio: 2400 / 1490;
  overflow: hidden;
  background: var(--ui-if-bg);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.ui-if *, .ui-if *::before, .ui-if *::after { box-sizing: border-box; margin: 0; padding: 0; }
.ui-if-defs { position: absolute; width: 0; height: 0; overflow: hidden; }

/* Output stage, 2400 × 1490, scaled to the container from the top left */
.ui-if-stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 2400px;
  height: 1490px;
  overflow: hidden;
  transform-origin: 0 0;
}

/* Design artboard (1800 × 1200), scaled 4/3 to cover the stage and cropped 55px top and bottom */
.ui-if-artboard {
  position: absolute;
  left: 0;
  top: -55px;
  width: 1800px;
  height: 1200px;
  transform: scale(1.33333333);
  transform-origin: 0 0;
}

/* ---------- Background: 14 soft gradient blobs, each drifting and fading on its own timing ---------- */
.ui-if-blobs {
  position: absolute;
  left: -886.5361px;
  top: -811.2378px;
  width: 3316.08px;
  height: 2907.21px;
}
.ui-if-blob {
  position: absolute;
  transform: rotate(var(--rot));
  animation: ui-if-drift var(--dur) var(--delay) infinite linear,
             ui-if-breathe var(--fdur) var(--fdelay) infinite ease-in-out;
}
/* Travel and turn only (no scale or skew, which makes the huge layers re-rasterize).
   A square path: every leg has the same length, so the drift speed stays even. */
@keyframes ui-if-drift {
  0%, 100% { transform: rotate(var(--rot)) translate(0, 0); }
  25%      { transform: rotate(calc(var(--rot) + var(--r1))) translate(var(--dx), var(--dy)); }
  50%      { transform: rotate(var(--rot)) translate(calc(var(--dx) - var(--dy)), calc(var(--dy) + var(--dx))); }
  75%      { transform: rotate(calc(var(--rot) - var(--r1))) translate(calc(var(--dy) * -1), var(--dx)); }
}
@keyframes ui-if-breathe {
  0%, 100% { opacity: var(--o-lo); }
  50%      { opacity: var(--o-hi); }
}
.ui-if-blob--283 {
  left: 311.0px; top: 264.6px; width: 1931.3px; height: 2152.1px; --rot: -19.45deg;
  --dx: 237px; --dy: -187px; --r1: 16deg; --dur: 16s; --delay: -3s;
  --o-lo: .82; --o-hi: 1; --fdur: 16s; --fdelay: -2s;
  background: radial-gradient(closest-side, rgba(255,155,74,0.534) 0%, rgba(255,155,74,0.516) 10%, rgba(255,155,74,0.463) 20%, rgba(255,155,74,0.386) 30%, rgba(255,155,74,0.299) 40%, rgba(255,155,74,0.215) 50%, rgba(255,155,74,0.144) 60%, rgba(255,155,74,0.089) 70%, rgba(255,155,74,0.051) 80%, rgba(255,155,74,0.027) 90%, rgba(255,155,74,0.000) 100%);
}
.ui-if-blob--292 {
  left: 220.8px; top: 437.4px; width: 1277.4px; height: 1421.8px; --rot: -19.45deg;
  --dx: -204px; --dy: 253px; --r1: -19deg; --dur: 16s; --delay: -5s;
  --o-lo: .80; --o-hi: .98; --fdur: 16s; --fdelay: -4s;
  background: radial-gradient(closest-side, rgba(255,155,74,0.835) 0%, rgba(255,155,74,0.805) 10%, rgba(255,155,74,0.722) 20%, rgba(255,155,74,0.602) 30%, rgba(255,155,74,0.467) 40%, rgba(255,155,74,0.336) 50%, rgba(255,155,74,0.224) 60%, rgba(255,155,74,0.139) 70%, rgba(255,155,74,0.079) 80%, rgba(255,155,74,0.042) 90%, rgba(255,155,74,0.000) 100%);
}
.ui-if-blob--291 {
  left: 1461.9px; top: 542.4px; width: 2011.2px; height: 1925.0px; --rot: -19.45deg;
  --dx: 270px; --dy: 204px; --r1: 14deg; --dur: 16s; --delay: -8s;
  --o-lo: .84; --o-hi: 1; --fdur: 16s; --fdelay: -6s;
  background: radial-gradient(closest-side, rgba(255,155,74,0.465) 0%, rgba(255,155,74,0.448) 10%, rgba(255,155,74,0.402) 20%, rgba(255,155,74,0.334) 30%, rgba(255,155,74,0.258) 40%, rgba(255,155,74,0.185) 50%, rgba(255,155,74,0.122) 60%, rgba(255,155,74,0.074) 70%, rgba(255,155,74,0.042) 80%, rgba(255,155,74,0.022) 90%, rgba(255,155,74,0.000) 100%);
}
.ui-if-blob--287 {
  left: 194.0px; top: -179.4px; width: 1931.3px; height: 2152.1px; --rot: -19.45deg;
  --dx: -248px; --dy: -165px; --r1: -15deg; --dur: 16s; --delay: -6s;
  --o-lo: .86; --o-hi: 1; --fdur: 16s; --fdelay: -3s;
  background: radial-gradient(closest-side, rgba(255,155,74,0.534) 0%, rgba(255,155,74,0.516) 10%, rgba(255,155,74,0.463) 20%, rgba(255,155,74,0.386) 30%, rgba(255,155,74,0.299) 40%, rgba(255,155,74,0.215) 50%, rgba(255,155,74,0.144) 60%, rgba(255,155,74,0.089) 70%, rgba(255,155,74,0.051) 80%, rgba(255,155,74,0.027) 90%, rgba(255,155,74,0.000) 100%);
}
.ui-if-blob--288 {
  left: -163.0px; top: -179.4px; width: 1931.3px; height: 2152.1px; --rot: -19.45deg;
  --dx: 187px; --dy: 264px; --r1: 18deg; --dur: 16s; --delay: -11s;
  --o-lo: .82; --o-hi: 1; --fdur: 16s; --fdelay: -8s;
  background: radial-gradient(closest-side, rgba(255,134,134,0.534) 0%, rgba(255,134,134,0.516) 10%, rgba(255,134,134,0.463) 20%, rgba(255,134,134,0.386) 30%, rgba(255,134,134,0.299) 40%, rgba(255,134,134,0.215) 50%, rgba(255,134,134,0.144) 60%, rgba(255,134,134,0.089) 70%, rgba(255,134,134,0.051) 80%, rgba(255,134,134,0.027) 90%, rgba(255,134,134,0.000) 100%);
}
.ui-if-blob--284 {
  left: 551.0px; top: -182.4px; width: 1931.3px; height: 2152.1px; --rot: -19.45deg;
  --dx: -280px; --dy: 182px; --r1: -17deg; --dur: 16s; --delay: -9s;
  --o-lo: .84; --o-hi: 1; --fdur: 16s; --fdelay: -5s;
  background: radial-gradient(closest-side, rgba(255,98,98,0.534) 0%, rgba(255,98,98,0.516) 10%, rgba(255,98,98,0.463) 20%, rgba(255,98,98,0.386) 30%, rgba(255,98,98,0.299) 40%, rgba(255,98,98,0.215) 50%, rgba(255,98,98,0.144) 60%, rgba(255,98,98,0.089) 70%, rgba(255,98,98,0.051) 80%, rgba(255,98,98,0.027) 90%, rgba(255,98,98,0.000) 100%);
}
.ui-if-blob--289 {
  left: 737.5px; top: 384.6px; width: 1913.4px; height: 2152.1px; --rot: -39.83deg;
  --dx: 209px; --dy: -258px; --r1: 20deg; --dur: 16s; --delay: -2s;
  --o-lo: .86; --o-hi: 1; --fdur: 16s; --fdelay: -7s;
  background: radial-gradient(closest-side, rgba(255,80,72,0.520) 0%, rgba(255,80,72,0.502) 10%, rgba(255,80,72,0.450) 20%, rgba(255,80,72,0.376) 30%, rgba(255,80,72,0.292) 40%, rgba(255,80,72,0.211) 50%, rgba(255,80,72,0.141) 60%, rgba(255,80,72,0.088) 70%, rgba(255,80,72,0.050) 80%, rgba(255,80,72,0.027) 90%, rgba(255,80,72,0.000) 100%);
}
.ui-if-blob--293 {
  left: 977.3px; top: 245.8px; width: 1913.4px; height: 2152.1px; --rot: -39.83deg;
  --dx: -226px; --dy: 220px; --r1: -13deg; --dur: 16s; --delay: -7s;
  --o-lo: .80; --o-hi: 1; --fdur: 8s; --fdelay: -3s;
  background: radial-gradient(closest-side, rgba(255,255,255,0.520) 0%, rgba(255,255,255,0.502) 10%, rgba(255,255,255,0.450) 20%, rgba(255,255,255,0.376) 30%, rgba(255,255,255,0.292) 40%, rgba(255,255,255,0.211) 50%, rgba(255,255,255,0.141) 60%, rgba(255,255,255,0.088) 70%, rgba(255,255,255,0.050) 80%, rgba(255,255,255,0.027) 90%, rgba(255,255,255,0.000) 100%);
}
.ui-if-blob--290 {
  left: 1662.3px; top: -188.5px; width: 1790.4px; height: 2279.7px; --rot: -19.45deg;
  --dx: 258px; --dy: -204px; --r1: 16deg; --dur: 16s; --delay: -4s;
  --o-lo: .82; --o-hi: .98; --fdur: 16s; --fdelay: -4s;
  background: radial-gradient(closest-side, rgba(255,153,151,0.443) 0%, rgba(255,153,151,0.428) 10%, rgba(255,153,151,0.386) 20%, rgba(255,153,151,0.325) 30%, rgba(255,153,151,0.256) 40%, rgba(255,153,151,0.188) 50%, rgba(255,153,151,0.129) 60%, rgba(255,153,151,0.082) 70%, rgba(255,153,151,0.049) 80%, rgba(255,153,151,0.027) 90%, rgba(255,153,151,0.000) 100%);
}
.ui-if-blob--285 {
  left: 1122.1px; top: -196.0px; width: 1876.8px; height: 2311.5px; --rot: -19.45deg;
  --dx: -182px; --dy: -242px; --r1: -18deg; --dur: 16s; --delay: -10s;
  --o-lo: .86; --o-hi: 1; --fdur: 16s; --fdelay: -9s;
  background: radial-gradient(closest-side, rgba(245,89,86,0.536) 0%, rgba(245,89,86,0.517) 10%, rgba(245,89,86,0.465) 20%, rgba(245,89,86,0.389) 30%, rgba(245,89,86,0.303) 40%, rgba(245,89,86,0.219) 50%, rgba(245,89,86,0.148) 60%, rgba(245,89,86,0.092) 70%, rgba(245,89,86,0.054) 80%, rgba(245,89,86,0.029) 90%, rgba(245,89,86,0.000) 100%);
}
.ui-if-blob--286 {
  left: 835.8px; top: -412.0px; width: 1596.4px; height: 2186.1px; --rot: -84.58deg;
  --dx: 292px; --dy: 165px; --r1: 12deg; --dur: 16s; --delay: -5s;
  --o-lo: .84; --o-hi: 1; --fdur: 16s; --fdelay: -3s;
  background: radial-gradient(closest-side, rgba(245,89,86,0.766) 0%, rgba(245,89,86,0.739) 10%, rgba(245,89,86,0.662) 20%, rgba(245,89,86,0.551) 30%, rgba(245,89,86,0.426) 40%, rgba(245,89,86,0.305) 50%, rgba(245,89,86,0.202) 60%, rgba(245,89,86,0.124) 70%, rgba(245,89,86,0.070) 80%, rgba(245,89,86,0.036) 90%, rgba(245,89,86,0.000) 100%);
}
.ui-if-blob--294 {
  left: 144.7px; top: 959.3px; width: 1596.4px; height: 2186.1px; --rot: 37.72deg;
  --dx: -215px; --dy: -226px; --r1: -21deg; --dur: 16s; --delay: -7s;
  --o-lo: .82; --o-hi: 1; --fdur: 8s; --fdelay: -6s;
  background: radial-gradient(closest-side, rgba(245,89,86,0.766) 0%, rgba(245,89,86,0.739) 10%, rgba(245,89,86,0.662) 20%, rgba(245,89,86,0.551) 30%, rgba(245,89,86,0.426) 40%, rgba(245,89,86,0.305) 50%, rgba(245,89,86,0.202) 60%, rgba(245,89,86,0.124) 70%, rgba(245,89,86,0.070) 80%, rgba(245,89,86,0.036) 90%, rgba(245,89,86,0.000) 100%);
}
.ui-if-blob--296 {
  left: 1553.2px; top: 914.1px; width: 1596.4px; height: 2186.1px; --rot: -63.15deg;
  --dx: 242px; --dy: 198px; --r1: 14deg; --dur: 16s; --delay: -12s;
  --o-lo: .80; --o-hi: .98; --fdur: 16s; --fdelay: -11s;
  background: radial-gradient(closest-side, rgba(223,43,43,0.766) 0%, rgba(223,43,43,0.739) 10%, rgba(223,43,43,0.662) 20%, rgba(223,43,43,0.551) 30%, rgba(223,43,43,0.426) 40%, rgba(223,43,43,0.305) 50%, rgba(223,43,43,0.202) 60%, rgba(223,43,43,0.124) 70%, rgba(223,43,43,0.070) 80%, rgba(223,43,43,0.036) 90%, rgba(223,43,43,0.000) 100%);
}
.ui-if-blob--295 {
  left: 539.4px; top: 719.0px; width: 1596.4px; height: 2515.3px; --rot: 37.72deg;
  --dx: -264px; --dy: 176px; --r1: -16deg; --dur: 16s; --delay: -8s;
  --o-lo: .86; --o-hi: 1; --fdur: 16s; --fdelay: -5s;
  background: radial-gradient(closest-side, rgba(251,112,56,0.770) 0%, rgba(251,112,56,0.742) 10%, rgba(251,112,56,0.665) 20%, rgba(251,112,56,0.554) 30%, rgba(251,112,56,0.428) 40%, rgba(251,112,56,0.307) 50%, rgba(251,112,56,0.203) 60%, rgba(251,112,56,0.124) 70%, rgba(251,112,56,0.070) 80%, rgba(251,112,56,0.037) 90%, rgba(251,112,56,0.000) 100%);
}

/* ---------- Connection beam: sweeps from the centre pill to the hub, clipped to the gap ---------- */
.ui-if-link {
  position: absolute;
  left: 779.639px;
  top: 597px;
  width: 240.361px;
  height: 3px;
  clip-path: inset(-80px 0px -80px 0px);
}
.ui-if-beam {
  position: absolute;
  left: 0;
  width: 150px;
  opacity: 0;
  transform: translateX(240px);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 40%,
              rgba(255, 255, 255, 1) 55%, rgba(255, 255, 255, 0.08) 100%);
}
.ui-if-beam--core { top: 0; height: 3px; }
.ui-if-beam--glow { top: -2px; height: 5px; filter: blur(3px); }
.ui-if-sweeping .ui-if-beam--core { animation: ui-if-sweep var(--ui-if-sweep) var(--ui-if-sweep-ease) both; }
.ui-if-sweeping .ui-if-beam--glow { animation: ui-if-sweep-glow var(--ui-if-sweep) var(--ui-if-sweep-ease) both; }
@keyframes ui-if-sweep {
  0%   { transform: translateX(241px); opacity: 0; }
  18%  { opacity: 1; }
  72%  { opacity: 1; }
  100% { transform: translateX(-155px); opacity: 0; }
}
@keyframes ui-if-sweep-glow {
  0%   { transform: translateX(241px); opacity: 0; filter: blur(3px); }
  18%  { opacity: .9; filter: blur(7.1px); }
  72%  { opacity: .9; filter: blur(7.1px); }
  100% { transform: translateX(-155px); opacity: 0; filter: blur(3px); }
}

/* ---------- Dashed orbit ---------- */
.ui-if-orbit {
  position: absolute;
  left: 1100.25px;
  top: -178.5px;
  width: 1519.5px;
  height: 1557.75px;
  display: block;
  overflow: visible;
  pointer-events: none;
}

/* ---------- Bottom fade, in stage coordinates ---------- */
.ui-if-fade {
  position: absolute;
  left: 0;
  /* Runs a little past the bottom edge and is solid before it, so no sliver of the blobs shows at small scales */
  bottom: -12px;
  width: 2400px;
  height: 612px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--ui-if-fade) 0%, transparent) 0%, var(--ui-if-fade) 94%);
  pointer-events: none;
}

/* ---------- Charged state: a blurred white silhouette behind the card plus a white sheen on it ---------- */
.ui-if-glow {
  position: absolute;
  top: 520.6797px;
  height: 158.639px;
  border-radius: 3600px;
  filter: blur(21.94px);
  opacity: 0;
  pointer-events: none;
  transition: opacity .55s ease-out;
}
.ui-if-glow.ui-if-on { opacity: 1; transition: opacity .5s ease-in; }
.ui-if-glow--out {
  left: 1020px;
  width: 492.639px;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
}
.ui-if-glow--in {
  left: 137px;
  width: 642.639px;
  background: linear-gradient(270deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
}

/* ---------- Card ---------- */
.ui-if-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 20px;
  border-radius: 3600px;
  -webkit-backdrop-filter: blur(26.55px);
  backdrop-filter: blur(26.55px);
}
.ui-if-card--icon-left { padding: 20px 80px 20px 20px; }
.ui-if-hub { left: 137px; top: 520.6797px; padding: 20px 20px 20px 60px; }
.ui-if-card--light {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 16px 36px 0 rgba(0, 0, 0, 0.06);
}

.ui-if-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  transition: opacity var(--ui-if-step) var(--ui-if-step-ease);
}
.ui-if-bg--charge { opacity: 0; box-shadow: none; transition: opacity .55s ease-out; }
.ui-if-bg--charge-out { background: linear-gradient(90deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%); }
.ui-if-bg--charge-in { background: linear-gradient(270deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%); }
/* Of the rotating pills only the one in the centre reacts */
.ui-if-pills.ui-if-charged .ui-if-pill[data-phase="3"] .ui-if-bg--charge,
.ui-if-hub.ui-if-charged .ui-if-bg--charge { opacity: 1; transition: opacity .5s ease-in; }

/* ---------- Badge ---------- */
.ui-if-badge {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 118.639px;
  height: 118.639px;
}
.ui-if-ring {
  position: absolute;
  inset: 0;
  width: 118.639px;
  height: 118.639px;
  display: block;
  overflow: visible;
}
.ui-if-icon {
  position: absolute;
  left: 27.32px;
  top: 27.32px;
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
}
.ui-if-icon > svg { display: block; width: 100%; height: 100%; overflow: visible; }

/* ---------- Label ---------- */
.ui-if-label {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  flex: 0 0 auto;
  white-space: nowrap;
  width: 254px;
}
.ui-if-label--right {
  align-items: flex-end;
  justify-content: center;
  text-align: right;
  width: 424px;
}
/* Inter runs ~10% wider than the SF Pro of the design: slightly smaller and tighter, so the cards keep their exact widths */
.ui-if-title { display: block; font-size: 37px; line-height: 40px; letter-spacing: -0.02em; font-weight: 400; }
.ui-if-sub { display: block; font-size: 33.5px; line-height: 36px; letter-spacing: -0.02em; font-weight: 380; }
.ui-if-hub .ui-if-title { color: rgba(0, 0, 0, 0.8); }
.ui-if-hub .ui-if-sub { color: rgba(0, 0, 0, 0.4); }

/* ---------- Rotating pills: all share the centre slot and move by transform ---------- */
.ui-if-pill {
  left: 1020px;
  top: 520.6797px;
  will-change: transform;
  transition: transform var(--ui-if-step) var(--ui-if-step-ease), opacity var(--ui-if-step) var(--ui-if-step-ease);
}
/* The staging slot is reached by an invisible jump from the exit, so it never animates */
.ui-if-pill[data-phase="0"] { transform: translate(480px, -845.68px); opacity: 0; transition: none; }
.ui-if-pill[data-phase="1"] { transform: translate(240px, -562.68px); opacity: 1; }
.ui-if-pill[data-phase="2"] { transform: translate(80px, -279.68px); opacity: 1; }
.ui-if-pill[data-phase="3"] { transform: translate(0px, 0px); opacity: 1; }
.ui-if-pill[data-phase="4"] { transform: translate(80px, 279.32px); opacity: 1; }
.ui-if-pill[data-phase="5"] { transform: translate(240px, 558.32px); opacity: 1; }
.ui-if-pill[data-phase="6"] { transform: translate(480px, 838.32px); opacity: 0; }

/* Backgrounds cross-fade between the passing (ghost) and the centre (light) styling */
.ui-if-bg--ghost {
  opacity: 1;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.08) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.ui-if-bg--light {
  opacity: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 16px 36px 0 rgba(0, 0, 0, 0.06);
}
.ui-if-pill[data-phase="3"] .ui-if-bg--ghost { opacity: 0; }
.ui-if-pill[data-phase="3"] .ui-if-bg--light { opacity: 1; }

.ui-if-pill .ui-if-ring { transition: opacity var(--ui-if-step) var(--ui-if-step-ease); }
.ui-if-pill .ui-if-ring--ghost { opacity: 1; }
.ui-if-pill .ui-if-ring--light { opacity: 0; }
.ui-if-pill[data-phase="3"] .ui-if-ring--ghost { opacity: 0; }
.ui-if-pill[data-phase="3"] .ui-if-ring--light { opacity: 1; }

.ui-if-pill .ui-if-title,
.ui-if-pill .ui-if-sub { transition: color var(--ui-if-step) var(--ui-if-step-ease); }
.ui-if-pill .ui-if-title { color: rgba(255, 255, 255, 0.8); }
.ui-if-pill .ui-if-sub { color: rgba(255, 255, 255, 0.4); }
.ui-if-pill[data-phase="3"] .ui-if-title { color: rgba(0, 0, 0, 0.8); }
.ui-if-pill[data-phase="3"] .ui-if-sub { color: rgba(0, 0, 0, 0.4); }

/* Logos: knocked out to white while passing; in the centre back to their own colors,
   single-color logos turn black. The same filter list everywhere so it interpolates. */
.ui-if-pill .ui-if-icon {
  filter: brightness(0) invert(1);
  transition: filter var(--ui-if-step) var(--ui-if-step-ease);
}
.ui-if-pill[data-phase="3"] .ui-if-icon { filter: brightness(1) invert(0); }
.ui-if-pill[data-phase="3"][data-fill="black"] .ui-if-icon { filter: brightness(0) invert(0); }

/* ---------- Reduced motion: the centre state, standing still, with the beam drawn in ---------- */
@media (prefers-reduced-motion: reduce) {
  .ui-if-pill, .ui-if-bg, .ui-if-ring, .ui-if-icon, .ui-if-title, .ui-if-sub { transition: none; }
  .ui-if-blob { animation: none; }
  .ui-if-beam { opacity: 1; transform: translateX(45px); }
}

/* ---------- Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> ---------- */
:where(.dark, [data-theme="dark"]) .ui-if { --ui-if-bg: #1f1f21; --ui-if-fade: #1f1f21; }
:where(.dark, [data-theme="dark"]) .ui-if-blobs { opacity: .8; }
:where(.dark, [data-theme="dark"]) .ui-if-blob--293 { display: none; }
:where(.dark, [data-theme="dark"]) .ui-if-orbit-stop { stop-color: #ffd9cc; }
:where(.dark, [data-theme="dark"]) .ui-if-glow { filter: blur(21.94px) opacity(.45); }
:where(.dark, [data-theme="dark"]) .ui-if-card--light,
:where(.dark, [data-theme="dark"]) .ui-if-bg--light {
  background: linear-gradient(180deg, rgba(38, 38, 41, 0.86) 0%, rgba(38, 38, 41, 0.62) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 16px 36px 0 rgba(0, 0, 0, 0.28);
}
:where(.dark, [data-theme="dark"]) .ui-if-bg--ghost {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}
:where(.dark, [data-theme="dark"]) .ui-if-bg--charge-out { background: linear-gradient(90deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 100%); }
:where(.dark, [data-theme="dark"]) .ui-if-bg--charge-in { background: linear-gradient(270deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 100%); }
:where(.dark, [data-theme="dark"]) .ui-if-stop-light-a { stop-color: #ffffff; stop-opacity: .06; }
:where(.dark, [data-theme="dark"]) .ui-if-stop-light-b { stop-color: #ffffff; stop-opacity: .14; }
:where(.dark, [data-theme="dark"]) .ui-if-ring--light g { filter: var(--ui-if-ring-dark); }
:where(.dark, [data-theme="dark"]) .ui-if-hub-icon { fill: rgba(255, 255, 255, 0.92); }
:where(.dark, [data-theme="dark"]) .ui-if-hub .ui-if-title,
:where(.dark, [data-theme="dark"]) .ui-if-pill[data-phase="3"] .ui-if-title { color: rgba(255, 255, 255, 0.92); }
:where(.dark, [data-theme="dark"]) .ui-if-hub .ui-if-sub,
:where(.dark, [data-theme="dark"]) .ui-if-pill[data-phase="3"] .ui-if-sub { color: rgba(255, 255, 255, 0.5); }
:where(.dark, [data-theme="dark"]) .ui-if-pill[data-phase="3"][data-fill="black"] .ui-if-icon { filter: brightness(0) invert(1); }
`;
