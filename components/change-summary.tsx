"use client";

import type { ReactNode } from "react";

/*
 * Change Summary – what moved since last time, one metric per row, in a gray tray with a white card, in a single self-contained file.
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
      <style href="ui-change-summary" precedence="default">
        {css}
      </style>
      <section className={["ui-cs", className].filter(Boolean).join(" ")} aria-label={title}>
        <header className="ui-cs__head">
          <span className="ui-cs__title">
            <span className="ui-cs__icon">{icon ?? <ChangesIcon />}</span>
            <span className="ui-cs__title-text" dir="auto" title={title}>
              {title}
            </span>
          </span>
          {period && (
            <span className="ui-cs__period" dir="auto" title={period}>
              {period}
            </span>
          )}
        </header>
        {changes.length > 0 && (
        <dl className="ui-cs__card">
          {changes.map((c, i) => {
            // Anything but good or bad reads as neutral, so the mark always has its tint
            const tone = c.tone === "good" || c.tone === "bad" ? c.tone : "neutral";
            const direction = c.direction ?? (tone === "bad" ? "down" : "up");
            return (
              // The stagger stops after twelve rows, so a long list is all there at once
              <div key={`${i}-${c.label}`} className="ui-cs__row" style={{ animationDelay: `${120 + Math.min(i, 12) * 70}ms` }}>
                <dt className="ui-cs__label" dir="auto" title={c.label}>
                  {c.label}
                </dt>
                <dd className="ui-cs__change">
                  <span className="ui-cs__trend" data-tone={tone} aria-hidden="true">
                    {tone === "neutral" ? <DashIcon /> : <ArrowIcon down={direction === "down"} />}
                  </span>
                  <span className="ui-cs__text" dir="auto" title={c.change}>
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

/* ---------- Icons ---------- */

const ChangesIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M2.5 4h4M2.5 8h8M6.5 12h7M9.5 4h1" />
  </svg>
);

const ArrowIcon = ({ down }: { down?: boolean }) => (
  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {down ? <path d="M6 2.5v7M3 6.5l3 3 3-3" /> : <path d="M6 9.5v-7M3 5.5l3-3 3 3" />}
  </svg>
);

const DashIcon = () => (
  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <path d="M3 6h6" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-cs {
  --ui-cs-tray: var(--aui-subtle, #f0f0f0);
  --ui-cs-card: var(--aui-surface, #ffffff);
  --ui-cs-line: var(--aui-border, #f0f0f0);
  --ui-cs-ink: var(--aui-ink, #171717);
  --ui-cs-muted: var(--aui-muted, #737373);
  --ui-cs-accent: var(--aui-blue, #4fb0fe);
  --ui-cs-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  width: 100%;
  max-width: 480px;
  container-type: inline-size;
  /* Like the Chat Composer: a gray tray with the heading, the white card sits on top of it */
  background: var(--ui-cs-tray);
  /* The gray tray frames the white card on every side */
  padding: 6px;
  border-radius: calc(var(--aui-radius-lg, 16px) + 6px);
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  color: var(--ui-cs-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-cs *, .ui-cs *::before, .ui-cs *::after { box-sizing: border-box; }

.ui-cs__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 18px 10px;
  font-size: 14px;
  line-height: 20px;
}
.ui-cs__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-weight: 500;
  color: var(--ui-cs-accent);
}
.ui-cs__icon { display: grid; place-items: center; flex: none; width: 16px; height: 16px; overflow: hidden; }
/* A custom icon – an image too – fits the 16px tile */
.ui-cs__icon > :is(img, svg) { display: block; width: 16px; height: 16px; object-fit: contain; }
.ui-cs__title-text { min-width: 0; overflow-wrap: anywhere; }
/* The period shortens before it squeezes the title */
.ui-cs__period { flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; font-size: 13px; white-space: nowrap; text-overflow: ellipsis; color: var(--ui-cs-muted); }

.ui-cs__card {
  margin: 0;
  overflow: hidden;
  background: var(--ui-cs-card);
  border: 1px solid var(--aui-border, #e5e5e5);
  border-radius: var(--aui-radius-lg, 16px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.ui-cs__row {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  align-items: center;
  gap: 16px;
  min-height: 52px;
  padding: 0 20px;
  animation: ui-cs-in 520ms var(--ui-cs-ease) both;
  transition: background-color 140ms ease;
}
.ui-cs__row + .ui-cs__row { border-top: 1px solid var(--ui-cs-line); }
.ui-cs__row:hover { background: var(--aui-subtle, #fafafa); }
.ui-cs__label {
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  text-align: start;
}
.ui-cs__change {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-cs-muted);
}
/* The change keeps its numbers: it wraps up to three lines instead of being cut off */
.ui-cs__text { display: -webkit-box; overflow: hidden; white-space: pre-line; overflow-wrap: anywhere; text-align: start; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
/* Narrow: each metric stacks above its change, so the text wraps instead of being cut off */
@container (max-width: 400px) {
  .ui-cs__row { grid-template-columns: minmax(0, 1fr); gap: 4px; padding: 11px 16px; }
  .ui-cs__label { white-space: normal; }
  .ui-cs__change { align-items: flex-start; }
}
.ui-cs__trend {
  display: grid;
  place-items: center;
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 6px;
}
.ui-cs__trend[data-tone="good"] { background: #eef9f3; color: var(--aui-success, #1e8a4f); }
.ui-cs__trend[data-tone="bad"] { background: #fff0f0; color: var(--aui-red, #f04438); }
.ui-cs__trend[data-tone="neutral"] { background: var(--aui-subtle, #f5f5f5); color: var(--aui-muted, #8f8f8f); }

@keyframes ui-cs-in {
  from { opacity: 0; transform: translateY(4px); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-cs__row { animation: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-cs {
  --ui-cs-tray: var(--aui-subtle, #161618);
  --ui-cs-card: var(--aui-surface, #232326);
  --ui-cs-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-cs-ink: var(--aui-ink, #ededed);
  --ui-cs-muted: var(--aui-muted, #8f8f8f);
  --ui-cs-accent: var(--aui-blue, #4fb0fe);
}
:where(.dark, [data-theme="dark"]) .ui-cs__card {
  border-color: var(--aui-border, rgba(255, 255, 255, 0.08));
  box-shadow: var(--aui-shadow-card, 0 1px 2px rgba(0, 0, 0, 0.4));
}
:where(.dark, [data-theme="dark"]) .ui-cs__row:hover { background: var(--aui-subtle, #2a2a2d); }
:where(.dark, [data-theme="dark"]) .ui-cs__trend[data-tone="good"] { background: color-mix(in srgb, var(--aui-green, #7dcf9f) 18%, transparent); color: #41bd74; }
:where(.dark, [data-theme="dark"]) .ui-cs__trend[data-tone="bad"] { background: color-mix(in srgb, var(--aui-red, #ff6b5f) 16%, transparent); color: var(--aui-red, #ff6b5f); }
:where(.dark, [data-theme="dark"]) .ui-cs__trend[data-tone="neutral"] { background: var(--aui-subtle, #2a2a2d); color: var(--aui-muted, #8f8f8f); }
`;
