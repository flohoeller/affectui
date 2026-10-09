"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * Thinking Loader – a small "the model is working" pill, in a single self-contained file.
 * A spinner of eight rays and a label with a light sweeping over it. The label walks through
 * phases (Thinking → Searching the web → …): the old one rolls up and blurs out, the new one
 * rolls in, and the pill glides to its new width. When done, the spinner turns into a check
 * and the label settles on "Thought for 6s".
 * The styles are injected below, so no extra files are needed.
 */

export type ThinkingLoaderProps = {
  /** Labels to walk through, one after another */
  phases?: string[];
  /** Time per phase, in ms */
  interval?: number;
  /** Show a specific phase instead of advancing on a timer – e.g. from your stream events */
  phase?: number;
  /** Start over after the last phase instead of holding it */
  loop?: boolean;
  /** Finished: the spinner turns into a check and the label into doneLabel */
  done?: boolean;
  /** Label once done – a string, or a function that gets the seconds since the loader started */
  doneLabel?: string | ((seconds: number) => string);
  size?: "sm" | "md";
  /** "pill" = bordered capsule, "plain" = just the spinner and the label, e.g. inside a chat bubble */
  variant?: "pill" | "plain";
  className?: string;
};

const DEFAULT_PHASES = ["Thinking", "Searching the web", "Reading sources", "Writing response"];
const RAYS = Array.from({ length: 8 }, (_, i) => i);

export function ThinkingLoader({
  phases = DEFAULT_PHASES,
  interval = 2200,
  phase,
  loop = false,
  done = false,
  doneLabel = (s) => `Thought for ${s}s`,
  size = "md",
  variant = "pill",
  className,
}: ThinkingLoaderProps) {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(() => Date.now());
  const [seconds, setSeconds] = useState<number | null>(null);

  // Read the clock in the same render that turns done on – and restart it when work starts again
  const elapsed = seconds ?? Math.max(1, Math.round((Date.now() - started) / 1000));
  if (done && seconds === null) setSeconds(elapsed);
  if (!done && seconds !== null) {
    setSeconds(null);
    setStarted(Date.now());
    setStep(0);
  }

  // Advance through the phases on a timer – unless the phase is controlled
  useEffect(() => {
    if (done || phase !== undefined || phases.length < 2) return;
    const id = window.setInterval(() => {
      setStep((s) => (s + 1 < phases.length ? s + 1 : loop ? 0 : s));
    }, interval);
    return () => window.clearInterval(id);
  }, [done, phase, phases.length, interval, loop]);

  const index = Math.min(Math.max(phase ?? step, 0), Math.max(phases.length - 1, 0));
  const label = done ? (typeof doneLabel === "function" ? doneLabel(elapsed) : doneLabel) : (phases[index] ?? "");

  // The label on screen and the one rolling out – swapped during render so both animate in the same frame
  const [shown, setShown] = useState({ key: 0, text: label });
  const [leaving, setLeaving] = useState<{ key: number; text: string } | null>(null);
  if (label !== shown.text) {
    setLeaving(shown);
    setShown({ key: shown.key + 1, text: label });
  }

  // The text box takes the width of the incoming label, so the pill glides to its new size
  const box = useRef<HTMLSpanElement>(null);
  const current = useRef<HTMLSpanElement>(null);
  const measured = useRef(false);
  useLayoutEffect(() => {
    const b = box.current;
    const c = current.current;
    if (!b || !c) return;
    if (!measured.current) b.style.transition = "none";
    // offsetWidth is in layout pixels, so it stays right inside a CSS zoom or transform (+1 covers rounding)
    b.style.width = `${c.offsetWidth + 1}px`;
    if (!measured.current) {
      b.getBoundingClientRect();
      b.style.transition = "";
      measured.current = true;
    }
  }, [shown.key]);

  return (
    <span
      className={["ui-tl", className].filter(Boolean).join(" ")}
      data-size={size}
      data-variant={variant}
      data-done={done || undefined}
      role="status"
      aria-live="polite"
    >
      {/* React 19 hoists this into <head> once, no matter how many loaders render */}
      <style href="ui-thinking-loader" precedence="default">
        {css}
      </style>

      <span className="ui-tl__icon" aria-hidden="true">
        <svg className="ui-tl__spinner" viewBox="0 0 16 16">
          {RAYS.map((i) => (
            <line
              key={i}
              x1="8"
              y1="1.75"
              x2="8"
              y2="4.75"
              transform={`rotate(${i * 45} 8 8)`}
              style={{ animationDelay: `${(i - 8) * 100}ms` }}
            />
          ))}
        </svg>
        <svg className="ui-tl__check" viewBox="0 0 16 16">
          <path d="M3.5 8.4 6.6 11.3 12.5 4.9" pathLength={1} />
        </svg>
      </span>

      <span ref={box} className="ui-tl__text">
        {leaving && (
          <span
            key={leaving.key}
            className="ui-tl__label ui-tl__label--out"
            aria-hidden="true"
            onAnimationEnd={() => setLeaving(null)}
          >
            {leaving.text}
          </span>
        )}
        <span
          key={shown.key}
          ref={current}
          className={["ui-tl__label", shown.key > 0 && "ui-tl__label--in", !done && "ui-tl__shine"].filter(Boolean).join(" ")}
          data-text={shown.text}
        >
          {shown.text}
        </span>
      </span>
    </span>
  );
}

const css = /* css */ `
.ui-tl {
  --ui-tl-ink: #171717;
  --ui-tl-text: #6b6b6b;
  --ui-tl-ray: #171717;
  --ui-tl-bg: #ffffff;
  --ui-tl-line: #e7e7e7;
  --ui-tl-shine: rgba(23, 23, 23, 0.95);
  --ui-tl-done: #171717;
  --ui-tl-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --ui-tl-h: 34px;
  --ui-tl-font: 14px;
  --ui-tl-icon: 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  height: var(--ui-tl-h);
  padding: 0 15px 0 12px;
  border-radius: 999px;
  background: var(--ui-tl-bg);
  box-shadow: inset 0 0 0 1px var(--ui-tl-line), 0 1px 2px rgba(0, 0, 0, 0.04);
  color: var(--ui-tl-text);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: var(--ui-tl-font);
  font-weight: 450;
  line-height: 1;
  letter-spacing: -0.006em;
  vertical-align: middle;
  -webkit-font-smoothing: antialiased;
}
.ui-tl[data-size="sm"] {
  --ui-tl-h: 28px;
  --ui-tl-font: 13px;
  --ui-tl-icon: 13px;
  gap: 7px;
  padding: 0 12px 0 10px;
}
.ui-tl[data-variant="plain"] {
  padding: 0;
  background: none;
  box-shadow: none;
}

/* Spinner and check share one square and swap with a little scale */
.ui-tl__icon {
  position: relative;
  flex: none;
  width: var(--ui-tl-icon);
  height: var(--ui-tl-icon);
}
.ui-tl__icon svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transition: opacity 240ms ease, transform 420ms var(--ui-tl-ease);
}
.ui-tl__spinner line {
  stroke: var(--ui-tl-ray);
  stroke-width: 1.6;
  stroke-linecap: round;
  opacity: 0.18;
  animation: ui-tl-ray 800ms linear infinite;
}
.ui-tl__check {
  opacity: 0;
  transform: scale(0.6);
  fill: none;
  stroke: var(--ui-tl-done);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ui-tl__check path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}
.ui-tl[data-done] .ui-tl__spinner {
  opacity: 0;
  transform: scale(0.6) rotate(-45deg);
}
.ui-tl[data-done] .ui-tl__check {
  opacity: 1;
  transform: none;
}
.ui-tl[data-done] .ui-tl__check path {
  animation: ui-tl-draw 360ms var(--ui-tl-ease) 120ms forwards;
}

/* The text box glides to the width of the incoming label; labels roll through it */
.ui-tl__text {
  position: relative;
  display: block;
  height: 1.3em;
  overflow: hidden;
  transition: width 460ms var(--ui-tl-ease);
}
.ui-tl__label {
  position: absolute;
  top: 0;
  left: 0;
  line-height: 1.3em;
  white-space: nowrap;
}
.ui-tl[data-done] .ui-tl__label {
  color: var(--ui-tl-ink);
}
.ui-tl__label--in {
  animation: ui-tl-in 460ms var(--ui-tl-ease) both;
}
.ui-tl__label--out {
  animation: ui-tl-out 320ms var(--ui-tl-ease) both;
}

/* A soft light sweeping over the label while it works */
.ui-tl__shine::after {
  content: attr(data-text);
  content: attr(data-text) / "";
  position: absolute;
  inset: 0;
  white-space: nowrap;
  color: transparent;
  background: linear-gradient(90deg, transparent 38%, var(--ui-tl-shine) 50%, transparent 62%) 100% 0 / 300% 100% no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ui-tl-sweep 1.8s linear infinite;
  pointer-events: none;
}

@keyframes ui-tl-ray {
  0% { opacity: 1; }
  100% { opacity: 0.18; }
}
@keyframes ui-tl-in {
  from { opacity: 0; transform: translateY(70%); filter: blur(3px); }
  to { opacity: 1; transform: none; filter: none; }
}
@keyframes ui-tl-out {
  from { opacity: 1; transform: none; filter: none; }
  to { opacity: 0; transform: translateY(-70%); filter: blur(3px); }
}
@keyframes ui-tl-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes ui-tl-sweep {
  from { background-position: 100% 0; }
  to { background-position: 0% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-tl *,
  .ui-tl *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
  .ui-tl__spinner line { opacity: 0.6; }
  .ui-tl__shine::after { display: none; }
  .ui-tl__check path { stroke-dashoffset: 0; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tl {
  --ui-tl-ink: #ededed;
  --ui-tl-text: #8f8f8f;
  --ui-tl-ray: #ededed;
  --ui-tl-bg: #161618;
  --ui-tl-line: rgba(255, 255, 255, 0.1);
  --ui-tl-shine: rgba(255, 255, 255, 0.95);
  --ui-tl-done: #ededed;
}
`;
