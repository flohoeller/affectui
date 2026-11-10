"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Progress Tracker – a checklist with a progress bar, in a single self-contained file.
 * The styles are injected below, so no extra files are needed.
 * Clean style: one white card with hairline shadows, quiet gray type, a thin blue bar
 * and blue checks.
 */

export type ProgressStep = {
  id: string;
  label: string;
  done?: boolean;
  /** Small icon on the right, e.g. the app the step belongs to */
  icon?: ReactNode;
};

export type ProgressTrackerProps = {
  title?: string;
  steps: ProgressStep[];
  /** Ticks the open steps one after another, then starts over – stops as soon as someone interacts */
  autoPlay?: boolean;
  /** Pause between two automatic steps, in ms */
  interval?: number;
  onChange?: (steps: ProgressStep[]) => void;
  className?: string;
};

export function ProgressTracker({
  title = "Getting started",
  steps: initial,
  autoPlay = false,
  interval = 2200,
  onChange,
  className,
}: ProgressTrackerProps) {
  const [done, setDone] = useState(() => new Set(initial.filter((s) => s.done).map((s) => s.id)));
  const [playing, setPlaying] = useState(autoPlay);

  // Steps added later bring their own done state; steps that go away no longer count
  const seen = useRef(new Set(initial.map((s) => s.id)));
  const ids = initial.map((s) => s.id).join("|");
  useEffect(() => {
    const fresh = initial.filter((s) => !seen.current.has(s.id));
    fresh.forEach((s) => seen.current.add(s.id));
    if (fresh.some((s) => s.done)) setDone((prev) => new Set([...prev, ...fresh.filter((s) => s.done).map((s) => s.id)]));
  }, [ids]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = initial.length;
  const count = initial.filter((s) => done.has(s.id)).length;
  const progress = total ? count / total : 0;

  const toggle = (id: string) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDone(next);
    onChange?.(initial.map((s) => ({ ...s, done: next.has(s.id) })));
  };

  // Auto play: tick the next open step; when all are done, start over
  useEffect(() => {
    if (!playing) return;
    const open = initial.find((s) => !done.has(s.id));
    const t = window.setTimeout(
      () => {
        if (open) toggle(open.id);
        else setDone(new Set(initial.filter((s) => s.done).map((s) => s.id)));
      },
      open ? interval : interval * 2,
    );
    return () => clearTimeout(t);
  }, [playing, done]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={["ui-progressc", className].filter(Boolean).join(" ")}
      data-complete={count === total || undefined}
      onPointerDown={() => setPlaying(false)}
      onKeyDown={() => setPlaying(false)}
    >
      {/* React 19 hoists this into <head> once, no matter how many trackers render */}
      <style href="ui-progress-tracker-clean" precedence="default">
        {css}
      </style>

      <div className="ui-progressc__head">
        <h3 className="ui-progressc__title" dir="auto" title={title}>
          {title}
        </h3>
        <span className="ui-progressc__count" aria-hidden="true">
          <span className="ui-progressc__digit" key={count}>
            {num.format(count)}
          </span>
          /{num.format(total)}
        </span>
      </div>

      <div
        className="ui-progressc__bar"
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={count}
        aria-valuetext={`${num.format(count)} of ${num.format(total)} done`}
      >
        <span className="ui-progressc__fill" style={{ transform: `scaleX(${progress})` }}>
          {/* A new key replays the shine each time progress grows */}
          <span className="ui-progressc__shine" key={count} />
        </span>
      </div>

      <ul className="ui-progressc__list">
        {initial.map((step, index) => {
          const checked = done.has(step.id);
          return (
            <li key={step.id} style={{ animationDelay: `${180 + Math.min(index, 12) * 90}ms` }}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                className="ui-progressc__step"
                onClick={() => toggle(step.id)}
              >
                <span className="ui-progressc__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M6.5 12.5l3.5 3.5 7.5-8" pathLength={1} />
                  </svg>
                </span>
                <span className="ui-progressc__label" title={step.label || undefined}>
                  {/* An empty label keeps the row's height */}
                  <span dir="auto">{step.label || "\u00a0"}</span>
                </span>
                {step.icon && (
                  <span className="ui-progressc__icon" aria-hidden="true">
                    {step.icon}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// 1284 → "1,284"
const num = new Intl.NumberFormat("en");

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-progressc (see Theming in the docs) */
.ui-progressc {
  --ui-pgc-card: var(--aui-surface, #ffffff);
  --ui-pgc-strong: var(--aui-ink, #000000);
  --ui-pgc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-pgc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-pgc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.27));
  --ui-pgc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-pgc-ring: var(--aui-border-strong, rgba(0, 0, 0, 0.2));
  --ui-pgc-track: rgba(0, 0, 0, 0.06);
  --ui-pgc-hover: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-pgc-accent: rgba(0, 96, 226, 0.765);
  --ui-pgc-on-accent: #ffffff;
  --ui-pgc-shine: rgba(255, 255, 255, 0.82);
  --ui-pgc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-pgc-shadow: var(--aui-shadow-card, 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  --ui-pgc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  container-type: inline-size;
  box-sizing: border-box;
  width: 100%;
  max-width: 340px;
  padding: 14px 6px 6px;
  background: var(--ui-pgc-card);
  border-radius: var(--aui-radius-lg, 10px);
  box-shadow: var(--ui-pgc-shadow);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(--ui-pgc-ink);
  text-align: left;
  -webkit-font-smoothing: antialiased;
}
.ui-progressc *,
.ui-progressc *::before,
.ui-progressc *::after {
  box-sizing: border-box;
}
:where(.ui-progressc) button {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  cursor: pointer;
}

/* Header: the title and a quiet counter */
.ui-progressc__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 0 10px;
}
.ui-progressc__title {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--ui-pgc-strong);
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
}
.ui-progressc__count {
  font-size: 12px;
  line-height: 16px;
  color: var(--ui-pgc-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* The number rolls in from below whenever it changes */
.ui-progressc__digit {
  display: inline-block;
  color: var(--ui-pgc-ink);
  animation: ui-progressc-roll 560ms var(--ui-pgc-ease);
}

/* A thin blue bar on a gray track */
.ui-progressc__bar {
  position: relative;
  height: 4px;
  margin: 10px 10px 8px;
  border-radius: 2px;
  background: var(--ui-pgc-track);
  overflow: hidden;
}
.ui-progressc__fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--ui-pgc-accent);
  transform-origin: 0 50%;
  overflow: hidden;
  transition: transform 1100ms var(--ui-pgc-ease);
}
/* A light band – always lighter than the bar – sweeps across */
.ui-progressc__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 30%, var(--ui-pgc-shine) 50%, transparent 70%) 0 0 / 220% 100%
    no-repeat;
  animation: ui-progressc-shine 1400ms ease-out both;
}

.ui-progressc__list {
  display: grid;
  /* One column that never grows past the card, so long labels shorten instead of pushing rows out */
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}
/* On mount the card settles in, then the rows fade up one after another */
.ui-progressc {
  animation: ui-progressc-in 520ms var(--ui-pgc-ease) both;
}
.ui-progressc__list > li {
  position: relative;
  animation: ui-progressc-row-in 640ms var(--ui-pgc-ease) both;
}

.ui-progressc__step {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 6px 10px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  background: transparent;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  transition: background-color 90ms ease-out;
}
.ui-progressc__step:hover {
  background: var(--ui-pgc-hover);
}
.ui-progressc__step:focus-visible {
  outline: 2px solid var(--ui-pgc-focus);
  outline-offset: -2px;
}

/* Checkbox: a hairline ring that fills blue and pops, then the tick draws itself */
.ui-progressc__check {
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--ui-pgc-ring);
  transition:
    background-color 220ms var(--ui-pgc-ease),
    box-shadow 220ms var(--ui-pgc-ease);
}
.ui-progressc__check svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: var(--ui-pgc-on-accent);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 120ms ease-in;
}
.ui-progressc__step[aria-checked="true"] .ui-progressc__check {
  background: var(--ui-pgc-accent);
  box-shadow: inset 0 0 0 1px transparent;
  animation: ui-progressc-pop 560ms var(--ui-pgc-ease);
}
.ui-progressc__step[aria-checked="true"] .ui-progressc__check svg {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 420ms var(--ui-pgc-ease) 160ms;
}

/* Label: grays out while a thin line strikes through it */
.ui-progressc__label {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 300ms ease;
}
.ui-progressc__label > span {
  background: linear-gradient(var(--ui-pgc-faint), var(--ui-pgc-faint)) 0 60% / 0% 1px no-repeat;
  transition: background-size 380ms var(--ui-pgc-ease);
}
.ui-progressc__step[aria-checked="true"] .ui-progressc__label {
  color: var(--ui-pgc-muted);
}
.ui-progressc__step[aria-checked="true"] .ui-progressc__label > span {
  background-size: 100% 1px;
  transition: background-size 620ms var(--ui-pgc-ease) 220ms;
}

.ui-progressc__icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  color: var(--ui-pgc-icon);
  transition: opacity 300ms ease;
}
/* Any icon – an svg or an image of any shape – fits its 16px tile */
.ui-progressc__icon {
  overflow: hidden;
}
.ui-progressc__icon > :is(svg, img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ui-progressc__step[aria-checked="true"] .ui-progressc__icon {
  opacity: 0.45;
}

/* Touch screens: taller rows */
@media (pointer: coarse) {
  .ui-progressc__step {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}
/* Narrow cards: a little less inset */
@container (max-width: 300px) {
  .ui-progressc__head { padding: 0 8px; }
  .ui-progressc__bar { margin-left: 8px; margin-right: 8px; }
  .ui-progressc__step { padding-left: 8px; padding-right: 8px; }
}

@keyframes ui-progressc-pop {
  0% { transform: scale(0.9); }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
@keyframes ui-progressc-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
@keyframes ui-progressc-row-in {
  from {
    opacity: 0;
    filter: blur(3px);
    transform: translateY(8px);
  }
}
@keyframes ui-progressc-roll {
  from { opacity: 0; transform: translateY(60%); }
  to { opacity: 1; transform: none; }
}
@keyframes ui-progressc-shine {
  from { background-position: 120% 0; opacity: 1; }
  to { background-position: -20% 0; opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-progressc,
  .ui-progressc *,
  .ui-progressc *::before,
  .ui-progressc *::after {
    animation: none !important;
    transition-duration: 1ms !important;
    transition-delay: 0ms !important;
  }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-progressc {
  --ui-pgc-card: var(--aui-surface, #1c1c1e);
  --ui-pgc-strong: var(--aui-ink, #ffffff);
  --ui-pgc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-pgc-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-pgc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.3));
  --ui-pgc-icon: var(--aui-muted, rgba(255, 255, 255, 0.5));
  --ui-pgc-ring: var(--aui-border-strong, rgba(255, 255, 255, 0.24));
  --ui-pgc-track: rgba(255, 255, 255, 0.08);
  --ui-pgc-hover: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-pgc-accent: var(--aui-blue, #4fb0fe);
  --ui-pgc-on-accent: #ffffff;
  --ui-pgc-shine: #ffffff;
  --ui-pgc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  --ui-pgc-shadow: var(--aui-shadow-card, 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.4));
}
`;
