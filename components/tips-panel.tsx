"use client";

import { useState, type ReactNode } from "react";

/*
 * Tips Panel – a panel of short tips, each with one action, in a gray tray with a white card, in a single self-contained file.
 * Taking an action marks the tip as done; the list scrolls inside the white card, framed by the gray tray.
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
      <style href="ui-tips-panel" precedence="default">
        {css}
      </style>
      <section className={["ui-tp", className].filter(Boolean).join(" ")} aria-label={title}>
        <header className="ui-tp__head">
          <h3 className="ui-tp__title" dir="auto">
            {title}
          </h3>
          <span className="ui-tp__count" aria-live="polite">
            {count.format(doneCount)}/{count.format(tips.length)} done
          </span>
        </header>

        <div className="ui-tp__card">
          <ul className="ui-tp__grid">
            {keyed.map(({ tip, key }, i) => {
              const isDone = done.has(key);
              return (
                <li key={key} className="ui-tp__tip" data-done={isDone || undefined} style={{ animationDelay: `${80 + Math.min(i, 12) * 50}ms` }}>
                  <p className="ui-tp__tip-title" dir="auto">
                    {tip.title}
                  </p>
                  <p className="ui-tp__tip-text" dir="auto">
                    {tip.description}
                  </p>
                  {isDone ? (
                    <span className="ui-tp__done" role="status">
                      <CheckIcon />
                      {tip.doneLabel ?? "Done"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={["ui-tp__btn", tip.primary && "ui-tp__btn--primary"].filter(Boolean).join(" ")}
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
          <footer className="ui-tp__foot">
            <button type="button" className="ui-tp__btn" onClick={onClose}>
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
export const Kbd = ({ children }: { children: ReactNode }) => <kbd className="ui-tp__kbd">{children}</kbd>;

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="currentColor" />
    <path d="m5 8.2 2 2 4-4.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-tp {
  --ui-tp-tray: var(--aui-subtle, #f0f0f0);
  --ui-tp-card: var(--aui-surface, #ffffff);
  --ui-tp-line: var(--aui-border, #ececec);
  --ui-tp-ink: var(--aui-ink, #171717);
  --ui-tp-muted: var(--aui-muted, #737373);
  --ui-tp-ok: var(--aui-blue, #4fb0fe);
  --ui-tp-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  /* Height of the tip list before it scrolls */
  --ui-tp-max-height: 420px;
  --ui-tp-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  width: 100%;
  max-width: 760px;
  /* Like the Chat Composer: a gray tray with heading and footer, the white card sits on top of it */
  background: var(--ui-tp-tray);
  /* The gray tray frames the white card on every side */
  padding: 6px;
  border-radius: calc(var(--aui-radius-lg, 16px) + 6px);
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  color: var(--ui-tp-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-tp *, .ui-tp *::before, .ui-tp *::after { box-sizing: border-box; }
.ui-tp button { margin: 0; font: inherit; cursor: pointer; }
.ui-tp button:focus-visible { outline: 2px solid var(--ui-tp-focus); outline-offset: 2px; }

.ui-tp__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 20px 12px;
}
.ui-tp__title {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.01em;
}
.ui-tp__count {
  flex: none;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--ui-tp-muted);
}

.ui-tp__card {
  container-type: inline-size;
  max-height: var(--ui-tp-max-height);
  overflow-y: auto;
  scrollbar-width: thin;
  background: var(--ui-tp-card);
  border: 1px solid var(--aui-border, #e5e5e5);
  border-radius: var(--aui-radius-lg, 16px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.ui-tp__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 14px;
  list-style: none;
}
@container (max-width: 560px) { .ui-tp__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 380px) { .ui-tp__grid { grid-template-columns: minmax(0, 1fr); } }

.ui-tp__tip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 16px 14px;
  border: 1px solid var(--ui-tp-line);
  border-radius: calc(var(--aui-radius-lg, 16px) - 2px);
  animation: ui-tp-in 480ms var(--ui-tp-ease) both;
  transition: background-color 260ms ease, border-color 260ms ease;
}
.ui-tp__tip[data-done] { background: var(--aui-subtle, #fafafa); }
/* Tips are shrink-to-fit flex items – max-width keeps long words and URLs inside the tile */
.ui-tp__tip-title {
  max-width: 100%;
  margin: 0;
  overflow-wrap: anywhere;
  text-align: start;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}
.ui-tp__tip-text {
  flex: 1;
  max-width: 100%;
  overflow-wrap: anywhere;
  white-space: pre-line;
  text-align: start;
  margin: 6px 0 14px;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-tp-muted);
}
.ui-tp__kbd {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: calc(var(--aui-radius-sm, 7px) - 1px);
  background: var(--aui-surface, #fff);
  box-shadow: 0 0 0 1px var(--aui-border, #e5e5e5), 0 1px 0 var(--aui-border, #e5e5e5);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  color: var(--ui-tp-ink);
  vertical-align: 1px;
}

/* A long label wraps inside the tile instead of leaving it; one line stays 30px */
.ui-tp__btn {
  max-width: 100%;
  min-height: 30px;
  padding: 5px 12px;
  border: 0;
  border-radius: calc(var(--aui-radius, 10px) - 1px);
  background: var(--aui-surface, #fff);
  box-shadow: 0 0 0 1px var(--aui-border, #e5e5e5), 0 1px 2px rgba(0, 0, 0, 0.04);
  font-size: 13px !important;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-tp-ink);
  text-align: start;
  overflow-wrap: anywhere;
  transition: background-color 160ms ease, transform 160ms ease;
}
.ui-tp__btn:hover { background: #f7f7f7; }
.ui-tp__btn:active { transform: scale(0.98); }
.ui-tp__btn--primary {
  background: linear-gradient(#323137, #201e25);
  box-shadow: 0 0 0 1px #0d0d0d, 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  color: #fff;
}
.ui-tp__btn--primary:hover { background: linear-gradient(#3b3a41, #26242b); }

.ui-tp__done {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-height: 30px;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 500;
  color: var(--ui-tp-ok);
  animation: ui-tp-pop 360ms var(--ui-tp-ease);
}

.ui-tp__foot { padding: 8px 10px 10px; }
.ui-tp:not(:has(.ui-tp__foot)) { padding-bottom: 8px; }

@keyframes ui-tp-in {
  from { opacity: 0; transform: translateY(4px); }
}
@keyframes ui-tp-pop {
  from { opacity: 0; transform: scale(0.94); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-tp__tip, .ui-tp__done { animation: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tp {
  --ui-tp-tray: var(--aui-subtle, #161618);
  --ui-tp-card: var(--aui-surface, #232326);
  --ui-tp-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-tp-ink: var(--aui-ink, #ededed);
  --ui-tp-muted: var(--aui-muted, #8f8f8f);
  --ui-tp-ok: var(--aui-blue, #4fb0fe);
  --ui-tp-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
:where(.dark, [data-theme="dark"]) .ui-tp__card {
  border-color: var(--aui-border, rgba(255, 255, 255, 0.08));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  color-scheme: dark;
}
:where(.dark, [data-theme="dark"]) .ui-tp__tip[data-done] { background: var(--aui-subtle, #2a2a2d); }
:where(.dark, [data-theme="dark"]) .ui-tp__kbd {
  background: var(--aui-surface, #2a2a2d);
  box-shadow: 0 0 0 1px var(--aui-border, rgba(255, 255, 255, 0.1)), 0 1px 0 var(--aui-border, rgba(255, 255, 255, 0.1));
}
:where(.dark, [data-theme="dark"]) .ui-tp__btn {
  background: var(--aui-surface, #2a2a2d);
  box-shadow: 0 0 0 1px var(--aui-border, rgba(255, 255, 255, 0.1)), 0 1px 2px rgba(0, 0, 0, 0.4);
}
:where(.dark, [data-theme="dark"]) .ui-tp__btn:hover { background: #313135; }
/* The dark primary button inverts, like on the site */
:where(.dark, [data-theme="dark"]) .ui-tp__btn--primary {
  background: linear-gradient(#f4f4f5, #e4e4e7);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 #ffffff;
  color: #121213;
}
:where(.dark, [data-theme="dark"]) .ui-tp__btn--primary:hover { background: linear-gradient(#ffffff, #ececef); }
`;
