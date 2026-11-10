"use client";

import type { ReactNode } from "react";

/*
 * Change Summary (Clean) – what moved since last time, one metric per row, in a single self-contained file.
 * Clean style: no tray – one white card with hairline shadows. The heading is the first row of the card,
 * each metric sits under a 0.5px line with a small tinted trend mark and quiet gray text.
 * The styles are injected below, so no extra files are needed.
 */

export type MetricChange = {
  label: string;
  /** What happened, in words, e.g. "Up 6.1% to 18.2K" */
  change: string;
  /** good: green arrow · bad: red arrow · neutral: gray dash */
  tone?: "good" | "bad" | "neutral";
  /** Direction of the arrow – defaults to up for good, down for bad */
  direction?: "up" | "down";
};

export type ChangeSummaryProps = {
  title?: string;
  /** Small text on the right of the heading, e.g. "This week" */
  period?: string;
  icon?: ReactNode;
  changes: MetricChange[];
  className?: string;
};

export function ChangeSummary({ title = "What's changed", period, icon, changes, className }: ChangeSummaryProps) {
  return (
    <>
      <style href="ui-change-summary-clean" precedence="default">
        {css}
      </style>
      <section className={["ui-csc", className].filter(Boolean).join(" ")} aria-label={title}>
        <header className="ui-csc__head">
          <span className="ui-csc__title">
            <span className="ui-csc__icon">{icon ?? <ChangesIcon />}</span>
            <span className="ui-csc__title-text" dir="auto" title={title}>
              {title}
            </span>
          </span>
          {period && (
            <span className="ui-csc__period" dir="auto" title={period}>
              {period}
            </span>
          )}
        </header>
        {changes.length > 0 && (
        <dl className="ui-csc__list">
          {changes.map((c, i) => {
            // Anything but good or bad reads as neutral, so the mark always has its tint
            const tone = c.tone === "good" || c.tone === "bad" ? c.tone : "neutral";
            const direction = c.direction ?? (tone === "bad" ? "down" : "up");
            return (
              // The stagger stops after twelve rows, so a long list is all there at once
              <div key={`${i}-${c.label}`} className="ui-csc__row" style={{ animationDelay: `${120 + Math.min(i, 12) * 70}ms` }}>
                <dt className="ui-csc__label" dir="auto" title={c.label}>
                  {c.label}
                </dt>
                <dd className="ui-csc__change">
                  <span className="ui-csc__trend" data-tone={tone} aria-hidden="true">
                    {tone === "neutral" ? <DashIcon /> : <ArrowIcon down={direction === "down"} />}
                  </span>
                  <span className="ui-csc__text" dir="auto" title={c.change}>
                    {c.change}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
        )}
      </section>
    </>
  );
}

/* ---------- Icons: thin lines, round caps ---------- */

const ChangesIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" aria-hidden="true">
    <path d="M2.5 4h4M2.5 8h8M6.5 12h7M9.5 4h1" />
  </svg>
);

const ArrowIcon = ({ down }: { down?: boolean }) => (
  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {down ? <path d="M6 2.5v7M3 6.5l3 3 3-3" /> : <path d="M6 9.5v-7M3 5.5l3-3 3 3" />}
  </svg>
);

const DashIcon = () => (
  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
    <path d="M3 6h6" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-csc */
.ui-csc {
  --ui-csc-card: var(--aui-surface, #ffffff);
  --ui-csc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-csc-strong: var(--aui-ink, #000000);
  --ui-csc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-csc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-csc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-csc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-csc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.015));
  --ui-csc-good: var(--aui-success, #1e8a4f);
  --ui-csc-good-fill: color-mix(in srgb, var(--aui-green, #5fc88a) 8%, transparent);
  --ui-csc-bad: var(--aui-red, #f04438);
  --ui-csc-bad-fill: color-mix(in srgb, var(--aui-red, #f04438) 8%, transparent);
  --ui-csc-neutral-fill: var(--aui-subtle, rgba(0, 0, 0, 0.04));
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-csc-shadow: var(--aui-shadow-card, 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  --ui-csc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  width: 100%;
  max-width: 480px;
  container-type: inline-size;
  overflow: hidden;
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--ui-csc-card);
  box-shadow: var(--ui-csc-shadow);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  color: var(--ui-csc-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-csc *, .ui-csc *::before, .ui-csc *::after { box-sizing: border-box; }
:where(.ui-csc) svg { display: block; flex: none; }

/* Heading row: icon + title, the period on the right */
.ui-csc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 44px;
  padding: 0 16px;
}
.ui-csc__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-weight: 500;
  white-space: nowrap;
  color: var(--ui-csc-strong);
}
.ui-csc__icon { display: grid; place-items: center; flex: none; width: 16px; height: 16px; overflow: hidden; color: var(--ui-csc-icon); }
/* A custom icon – an image too – fits the 16px tile */
.ui-csc__icon > :is(img, svg) { width: 16px; height: 16px; object-fit: contain; }
.ui-csc__title-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
/* The period shortens before it pushes the title out */
.ui-csc__period { flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; font-size: 12px; line-height: 16px; white-space: nowrap; text-overflow: ellipsis; color: var(--ui-csc-muted); }

/* One row per metric, each under a hairline */
.ui-csc__list { margin: 0; }
.ui-csc__row {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  align-items: center;
  gap: 16px;
  min-height: 48px;
  padding: 0 16px;
  border-top: 0.5px solid var(--ui-csc-line);
  animation: ui-csc-in 520ms var(--ui-csc-ease) both;
  transition: background-color 140ms ease;
}
.ui-csc__row:hover { background: var(--ui-csc-wash); }
.ui-csc__label {
  overflow: hidden;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  text-align: start;
  color: var(--ui-csc-ink);
}
.ui-csc__change {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin: 0;
  color: var(--ui-csc-text);
}
/* The change keeps its numbers: it wraps up to three lines instead of being cut off */
.ui-csc__text { display: -webkit-box; overflow: hidden; white-space: pre-line; overflow-wrap: anywhere; text-align: start; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }

/* Trend mark: a small tinted square, no strokes */
.ui-csc__trend {
  display: grid;
  place-items: center;
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 5px;
}
.ui-csc__trend[data-tone="good"] { background: var(--ui-csc-good-fill); color: var(--ui-csc-good); }
.ui-csc__trend[data-tone="bad"] { background: var(--ui-csc-bad-fill); color: var(--ui-csc-bad); }
.ui-csc__trend[data-tone="neutral"] { background: var(--ui-csc-neutral-fill); color: var(--ui-csc-icon); }

/* Narrow: each metric stacks above its change, so the text wraps instead of being cut off */
@container (max-width: 400px) {
  .ui-csc__head { padding: 0 14px; }
  .ui-csc__row { grid-template-columns: minmax(0, 1fr); gap: 4px; padding: 10px 14px; }
  .ui-csc__label { white-space: normal; }
  .ui-csc__change { align-items: flex-start; }
}
/* Touch screens: a little more room per row */
@media (pointer: coarse) {
  .ui-csc__row { min-height: 52px; }
}

@keyframes ui-csc-in {
  from { opacity: 0; transform: translateY(4px); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-csc__row { animation: none; transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-csc {
  --ui-csc-card: var(--aui-surface, #1c1c1e);
  --ui-csc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-csc-strong: var(--aui-ink, #ffffff);
  --ui-csc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-csc-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-csc-icon: var(--aui-muted, rgba(255, 255, 255, 0.5));
  --ui-csc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-csc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.025));
  --ui-csc-good: var(--aui-green, #5fc88a);
  --ui-csc-good-fill: color-mix(in srgb, var(--aui-green, #7dcf9f) 14%, transparent);
  --ui-csc-bad: var(--aui-red, #ff6b5f);
  --ui-csc-bad-fill: color-mix(in srgb, var(--aui-red, #ff6b5f) 14%, transparent);
  --ui-csc-neutral-fill: var(--aui-subtle, rgba(255, 255, 255, 0.08));
  --ui-csc-shadow: var(--aui-shadow-card, 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.4));
}
`;
