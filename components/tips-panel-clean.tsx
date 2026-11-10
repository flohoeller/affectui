"use client";

import { useState, type ReactNode } from "react";

/*
 * Tips Panel (clean style) – a panel of short tips, each with one action, in one white card, in a single self-contained file.
 * Taking an action marks the tip as done; only the tip list scrolls – the heading and the Close row stay in place.
 * The styles are injected below, so no extra files are needed.
 */

export type Tip = {
  id: string;
  title: string;
  /** Short explanation – may contain a <Kbd> */
  description: ReactNode;
  /** Button text */
  action: string;
  /** Text after the action was taken, e.g. "Enabled" */
  doneLabel?: string;
  /** Shows the action as the dark button – use once for the most important tip */
  primary?: boolean;
  onAction?: () => void;
};

export type TipsPanelProps = {
  title?: string;
  tips: Tip[];
  /** Shows the Close button in the footer */
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
};

export function TipsPanel({ title = "Tips", tips, onClose, closeLabel = "Close", className }: TipsPanelProps) {
  const [done, setDone] = useState<Set<string>>(new Set());
  // Tips that share an id still get their own key, so marking one never marks the other
  const seen = new Map<string, number>();
  const keyed = tips.map((tip) => {
    const n = seen.get(tip.id) ?? 0;
    seen.set(tip.id, n + 1);
    return { tip, key: n ? `${tip.id}#${n}` : tip.id };
  });
  // Only tips that are still in the list count
  const doneCount = keyed.filter((k) => done.has(k.key)).length;

  return (
    <>
      <style href="ui-tips-panel-clean" precedence="default">
        {css}
      </style>
      <section className={["ui-tpc", className].filter(Boolean).join(" ")} aria-label={title}>
        <header className="ui-tpc__head">
          <h3 className="ui-tpc__title" dir="auto">
            {title}
          </h3>
          <span className="ui-tpc__count" aria-live="polite">
            {count.format(doneCount)}/{count.format(tips.length)} done
          </span>
        </header>

        <div className="ui-tpc__body">
          <ul className="ui-tpc__grid">
            {keyed.map(({ tip, key }, i) => {
              const isDone = done.has(key);
              return (
                <li key={key} className="ui-tpc__tip" data-done={isDone || undefined} style={{ animationDelay: `${80 + Math.min(i, 12) * 50}ms` }}>
                  <p className="ui-tpc__tip-title" dir="auto">
                    {tip.title}
                  </p>
                  <p className="ui-tpc__tip-text" dir="auto">
                    {tip.description}
                  </p>
                  {isDone ? (
                    <span className="ui-tpc__done" role="status">
                      <CheckIcon />
                      {tip.doneLabel ?? "Done"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={["ui-tpc__btn", tip.primary && "ui-tpc__btn--primary"].filter(Boolean).join(" ")}
                      onClick={() => {
                        setDone((d) => new Set(d).add(key));
                        tip.onAction?.();
                      }}
                    >
                      {tip.action}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {onClose && (
          <footer className="ui-tpc__foot">
            <button type="button" className="ui-tpc__btn" onClick={onClose}>
              {closeLabel}
            </button>
          </footer>
        )}
      </section>
    </>
  );
}

const count = new Intl.NumberFormat("en");

/** Keyboard key for tip descriptions, e.g. <Kbd>⌘K</Kbd> */
export const Kbd = ({ children }: { children: ReactNode }) => <kbd className="ui-tpc__kbd">{children}</kbd>;

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" fill="currentColor" />
    <path d="m5.6 8.1 1.7 1.7 3.2-3.4" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-tpc */
.ui-tpc {
  --ui-tpc-card: var(--aui-surface, #ffffff);
  --ui-tpc-strong: var(--aui-ink, #000000);
  --ui-tpc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-tpc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-tpc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-tpc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-tpc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.015));
  --ui-tpc-hover: rgba(0, 0, 0, 0.03);
  --ui-tpc-ok: var(--aui-success, #1e8a4f);
  --ui-tpc-primary: var(--aui-primary, rgba(0, 0, 0, 0.88));
  --ui-tpc-primary-hover: rgba(0, 0, 0, 0.8);
  --ui-tpc-on-primary: var(--aui-on-primary, #fcfcfc);
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-tpc-shadow: var(--aui-shadow-card, 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  --ui-tpc-shadow-hover: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 1px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.07);
  --ui-tpc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  /* Height of the tip list before it scrolls */
  --ui-tpc-max-height: 420px;
  --ui-tpc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 760px;
  /* One white card – the edge is a shadow, not a border */
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--ui-tpc-card);
  box-shadow: var(--ui-tpc-shadow);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  color: var(--ui-tpc-ink);
  text-align: left;
  -webkit-font-smoothing: antialiased;
}
.ui-tpc *, .ui-tpc *::before, .ui-tpc *::after { box-sizing: border-box; }
:where(.ui-tpc) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.ui-tpc button:focus-visible { outline: 2px solid var(--ui-tpc-focus); outline-offset: 2px; }
:where(.ui-tpc) svg { display: block; flex: none; }

/* ----- Head ----- */
.ui-tpc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--ui-tpc-line);
}
.ui-tpc__title {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
  color: var(--ui-tpc-strong);
}
.ui-tpc__count {
  flex: none;
  font-size: 12px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  color: var(--ui-tpc-muted);
  white-space: nowrap;
}

/* ----- The tip list: the only part that scrolls ----- */
.ui-tpc__body {
  container-type: inline-size;
  max-height: var(--ui-tpc-max-height);
  overflow-y: auto;
  scrollbar-width: thin;
}
.ui-tpc__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 12px;
  list-style: none;
}
@container (max-width: 560px) { .ui-tpc__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 380px) { .ui-tpc__grid { grid-template-columns: minmax(0, 1fr); } }

/* Each tip is a quiet tile: a hairline drawn as an inset shadow */
.ui-tpc__tip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
  border-radius: calc(var(--aui-radius-lg, 10px) - 2px);
  box-shadow: inset 0 0 0 0.5px var(--ui-tpc-line);
  animation: ui-tpc-in 480ms var(--ui-tpc-ease) both;
  transition: background-color 260ms ease;
}
.ui-tpc__tip[data-done] { background: var(--ui-tpc-wash); }
/* Tips are shrink-to-fit flex items – max-width keeps long words and URLs inside the tile */
.ui-tpc__tip-title {
  max-width: 100%;
  margin: 0;
  overflow-wrap: anywhere;
  text-align: start;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-tpc-strong);
}
.ui-tpc__tip-text {
  flex: 1;
  max-width: 100%;
  overflow-wrap: anywhere;
  white-space: pre-line;
  text-align: start;
  margin: 2px 0 12px;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-tpc-text);
}
.ui-tpc__kbd {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--aui-radius-sm, 5px);
  background: var(--ui-tpc-card);
  box-shadow: var(--ui-tpc-shadow);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  color: var(--ui-tpc-ink);
  vertical-align: 1px;
}

/* Secondary: white with the card shadow */
/* A long label wraps inside the tile instead of leaving it; one line stays 28px */
.ui-tpc__btn {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: calc(var(--aui-radius, 7px) - 1px);
  background: var(--ui-tpc-card);
  box-shadow: var(--ui-tpc-shadow);
  font-size: 13px !important;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-tpc-strong);
  text-align: start;
  overflow-wrap: anywhere;
  transition: box-shadow 140ms ease, background-color 140ms ease, transform 160ms var(--ui-tpc-ease);
}
.ui-tpc__btn:hover { box-shadow: var(--ui-tpc-shadow-hover); }
.ui-tpc__btn:active { transform: scale(0.98); }
/* Primary: the dark chip */
.ui-tpc__btn--primary {
  background: var(--ui-tpc-primary);
  box-shadow: none;
  color: var(--ui-tpc-on-primary);
}
.ui-tpc__btn--primary:hover { background: var(--ui-tpc-primary-hover); box-shadow: none; }

.ui-tpc__done {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-height: 28px;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-tpc-ok);
  animation: ui-tpc-pop 360ms var(--ui-tpc-ease);
}

/* ----- The last row inside the card ----- */
.ui-tpc__foot {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  border-top: 0.5px solid var(--ui-tpc-line);
}

@keyframes ui-tpc-in {
  from { opacity: 0; transform: translateY(4px); }
}
@keyframes ui-tpc-pop {
  from { opacity: 0; transform: scale(0.94); }
}

@media (pointer: coarse) {
  .ui-tpc__btn, .ui-tpc__done { min-height: 34px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-tpc__tip, .ui-tpc__done { animation: none; }
  .ui-tpc__tip, .ui-tpc__btn { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tpc {
  --ui-tpc-card: var(--aui-surface, #1c1c1e);
  --ui-tpc-strong: var(--aui-ink, #ffffff);
  --ui-tpc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-tpc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-tpc-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-tpc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-tpc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.03));
  --ui-tpc-hover: rgba(255, 255, 255, 0.04);
  --ui-tpc-ok: var(--aui-green, #5fc88a);
  --ui-tpc-primary: var(--aui-primary, rgba(255, 255, 255, 0.9));
  --ui-tpc-primary-hover: rgba(255, 255, 255, 0.8);
  --ui-tpc-on-primary: var(--aui-on-primary, #1c1c1e);
  --ui-tpc-shadow: var(--aui-shadow-card, 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.4));
  --ui-tpc-shadow-hover: 0 0 0 0.5px rgba(255, 255, 255, 0.16), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-tpc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
:where(.dark, [data-theme="dark"]) .ui-tpc__btn:not(.ui-tpc__btn--primary) { background: var(--aui-surface, #232326); }
`;
