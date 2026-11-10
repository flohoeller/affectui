"use client";

import { useState } from "react";

/*
 * Decision Inbox (clean style) – open decisions with two quick answers each, in one white card, in a single self-contained file.
 * A heading row with the count sits at the top of the card; every decision is a row under a hairline.
 * Answering a decision confirms it briefly, then folds it away and the count goes down.
 * The styles are injected below, so no extra files are needed.
 */

export type Decision = {
  id: string;
  title: string;
  /** Short context under the title */
  detail?: string;
  /** Main answer, shown as the dark button */
  primary: string;
  /** Other answer, shown as the light button */
  secondary: string;
  /** Starts folded to one muted line – click to open */
  collapsed?: boolean;
};

export type DecisionInboxProps = {
  decisions: Decision[];
  /** Called with the decision and the chosen answer */
  onDecide?: (decision: Decision, answer: "primary" | "secondary") => void;
  className?: string;
};

type State = { open: boolean; answered?: string; gone?: boolean };

export function DecisionInbox({ decisions, onDecide, className }: DecisionInboxProps) {
  const [state, setState] = useState<Record<string, State>>(() =>
    Object.fromEntries(decisions.map((d) => [d.id, { open: !d.collapsed }])),
  );
  const patch = (id: string, next: Partial<State>) => setState((s) => ({ ...s, [id]: { ...s[id], ...next } }));

  const open = decisions.filter((d) => !state[d.id]?.answered).length;
  // 1284 → "1,284"
  const count = new Intl.NumberFormat("en").format(open);

  const decide = (d: Decision, answer: "primary" | "secondary") => {
    patch(d.id, { answered: answer === "primary" ? d.primary : d.secondary });
    onDecide?.(d, answer);
    // Show the confirmation for a moment, then fold the row away and open the next folded one
    window.setTimeout(() => {
      setState((s) => {
        const next = { ...s, [d.id]: { ...s[d.id], gone: true } };
        const folded = decisions.find((x) => x.id !== d.id && !next[x.id]?.open && !next[x.id]?.answered);
        if (folded) next[folded.id] = { ...next[folded.id], open: true };
        return next;
      });
    }, 1100);
  };

  return (
    <>
      <style href="ui-decision-inbox-clean" precedence="default">
        {css}
      </style>
      <section className={["ui-dic", className].filter(Boolean).join(" ")} data-clear={open === 0 || undefined}>
        <header className="ui-dic__head" aria-live="polite">
          {open > 0 ? (
            <>
              <AlertIcon />
              <span>
                {count} {open === 1 ? "needs" : "need"} your input
              </span>
            </>
          ) : (
            <>
              <DoneIcon />
              <span>All caught up</span>
            </>
          )}
        </header>

        <div className="ui-dic__card">
          {decisions.map((d) => {
            const s = state[d.id] ?? { open: true };
            return (
              <div key={d.id} className="ui-dic__row" data-gone={s.gone || undefined} inert={s.gone}>
                <div className="ui-dic__row-inner">
                  <div className="ui-dic__item" data-open={s.open || undefined} data-answered={s.answered ? true : undefined}>
                    {s.open ? (
                      <p className="ui-dic__title" dir="auto">
                        {d.title}
                      </p>
                    ) : (
                      <button type="button" className="ui-dic__title ui-dic__title--folded" dir="auto" title={d.title} onClick={() => patch(d.id, { open: true })}>
                        {d.title}
                      </button>
                    )}
                    <div className="ui-dic__body" data-open={s.open || undefined}>
                      <div className="ui-dic__body-inner">
                        {d.detail && (
                          <p className="ui-dic__detail" dir="auto">
                            {d.detail}
                          </p>
                        )}
                        <div className="ui-dic__actions">
                          {s.answered ? (
                            <span className="ui-dic__done" role="status">
                              <DoneIcon />
                              <span dir="auto">{s.answered}</span>
                            </span>
                          ) : (
                            <>
                              <button type="button" className="ui-dic__btn ui-dic__btn--primary" dir="auto" onClick={() => decide(d, "primary")}>
                                {d.primary}
                              </button>
                              <button type="button" className="ui-dic__btn" dir="auto" onClick={() => decide(d, "secondary")}>
                                {d.secondary}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <p className="ui-dic__empty">Nothing waiting on you – new decisions show up here.</p>
        </div>
      </section>
    </>
  );
}

/* ---------- Icons ---------- */

// Solid glyphs – the cut-out mark takes the card color, so it works in dark mode too
const AlertIcon = () => (
  <svg className="ui-dic__glyph" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M6.7 2.3a1.5 1.5 0 0 1 2.6 0l5.4 9.4A1.5 1.5 0 0 1 13.4 14H2.6a1.5 1.5 0 0 1-1.3-2.3Z" fill="currentColor" />
    <path className="ui-dic__cut" d="M8 5.8v3.2" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    <circle className="ui-dic__cut-dot" cx="8" cy="11.3" r="0.8" />
  </svg>
);

const DoneIcon = () => (
  <svg className="ui-dic__glyph" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" fill="currentColor" />
    <path className="ui-dic__cut" d="m5.3 8.2 1.8 1.8 3.6-3.8" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-dic */
.ui-dic {
  --ui-dic-card: var(--aui-surface, #ffffff);
  --ui-dic-strong: var(--aui-ink, #000000);
  --ui-dic-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-dic-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-dic-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-dic-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.27));
  --ui-dic-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-dic-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-dic-alert: var(--aui-amber, #e8b000);
  --ui-dic-ok: var(--aui-success, #1e8a4f);
  --ui-dic-ok-bg: color-mix(in srgb, var(--aui-green, #5fc88a) 8%, transparent);
  --ui-dic-solid: var(--aui-primary, rgba(0, 0, 0, 0.88));
  --ui-dic-solid-hover: rgba(0, 0, 0, 0.8);
  --ui-dic-on-solid: var(--aui-on-primary, #fcfcfc);
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-dic-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-dic-shadow-hover: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 1px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.07);
  --ui-dic-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-dic-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  container-type: inline-size;
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  /* One white card – the edge is a shadow, not a border */
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--ui-dic-card);
  box-shadow: var(--aui-shadow-card, var(--ui-dic-shadow));
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(--ui-dic-ink);
  text-align: left;
  -webkit-font-smoothing: antialiased;
}
.ui-dic *, .ui-dic *::before, .ui-dic *::after { box-sizing: border-box; }
:where(.ui-dic) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
:where(.ui-dic) svg { display: block; flex: none; }
.ui-dic button:focus-visible { outline: 2px solid var(--ui-dic-focus); outline-offset: 2px; }

.ui-dic__glyph { width: 16px; height: 16px; }
.ui-dic__cut { stroke: var(--ui-dic-card); }
.ui-dic__cut-dot { fill: var(--ui-dic-card); }

/* The heading row at the top of the card: an amber mark while something waits, a green one when all is done */
.ui-dic__head {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  border-bottom: 0.5px solid var(--ui-dic-line);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-dic-ink);
}
.ui-dic__head .ui-dic__glyph { color: var(--ui-dic-alert); animation: ui-dic-pop 360ms var(--ui-dic-ease) both; }
.ui-dic[data-clear] .ui-dic__head .ui-dic__glyph { color: var(--ui-dic-ok); }
.ui-dic__head span { animation: ui-dic-in 320ms var(--ui-dic-ease) both; }

/* Rows fold away with a height transition once answered */
.ui-dic__row {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 460ms var(--ui-dic-ease), opacity 300ms ease;
}
.ui-dic__row[data-gone] { grid-template-rows: 0fr; opacity: 0; }
.ui-dic__row-inner { min-height: 0; overflow: hidden; }
.ui-dic__row + .ui-dic__row .ui-dic__item { border-top: 0.5px solid var(--ui-dic-line); }
.ui-dic__row[data-gone] + .ui-dic__row .ui-dic__item { border-top-color: transparent; }

.ui-dic__item { padding: 14px 16px 16px; }
.ui-dic__item:not([data-open]) { padding: 0; }
.ui-dic__title {
  display: block;
  width: 100%;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  text-align: start;
  color: var(--ui-dic-strong);
  overflow-wrap: anywhere;
}
/* A folded decision: one muted line that opens on click */
:where(.ui-dic) .ui-dic__title--folded {
  /* Still one line however long the title – it opens in full on click */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 14px 16px;
  font-weight: 400;
  color: var(--ui-dic-muted);
  transition: color 140ms ease, background-color 140ms ease;
}
.ui-dic__title--folded:hover { background: var(--ui-dic-wash); color: var(--ui-dic-ink); }
.ui-dic button.ui-dic__title--folded:focus-visible { outline-offset: -2px; }

.ui-dic__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 420ms var(--ui-dic-ease);
}
.ui-dic__body[data-open] { grid-template-rows: 1fr; }
/* Room around the buttons so the clipping for the fold never cuts their focus ring and shadow */
.ui-dic__body-inner {
  min-height: 0;
  overflow: hidden;
  margin: 0 -4px -4px;
  padding: 0 4px 4px;
}
.ui-dic__detail {
  margin: 2px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-dic-text);
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.ui-dic__actions {
  display: flex;
  align-items: center;
  /* Long or translated answers go on a second line instead of out of the card */
  flex-wrap: wrap;
  gap: 8px;
  min-height: 28px;
  margin-top: 12px;
}

/* Secondary: white with the card's hairline shadow */
.ui-dic__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: calc(var(--aui-radius, 7px) - 1px);
  text-align: center;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  transition: background-color 140ms ease, box-shadow 140ms ease, transform 160ms var(--ui-dic-ease);
}
:where(.ui-dic) .ui-dic__btn { background: var(--ui-dic-card); box-shadow: var(--ui-dic-shadow); color: var(--ui-dic-strong); }
.ui-dic__btn:hover { box-shadow: var(--ui-dic-shadow-hover); }
.ui-dic__btn:active { transform: scale(0.97); }
/* Primary: a dark chip */
:where(.ui-dic) .ui-dic__btn--primary { background: var(--ui-dic-solid); box-shadow: none; color: var(--ui-dic-on-solid); }
.ui-dic__btn--primary:hover { background: var(--ui-dic-solid-hover); box-shadow: none; }

/* The answer: a minimal green fill in the place of the buttons */
.ui-dic__done {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-height: 28px;
  padding: 4px 10px 4px 8px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  background: var(--ui-dic-ok-bg);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-dic-ok);
  overflow-wrap: anywhere;
  animation: ui-dic-in 360ms var(--ui-dic-ease);
}
.ui-dic__done > span { min-width: 0; }

.ui-dic__empty {
  display: none;
  margin: 0;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-dic-muted);
}
.ui-dic[data-clear] .ui-dic__empty { display: block; animation: ui-dic-in 420ms var(--ui-dic-ease) 300ms both; }

@keyframes ui-dic-in {
  from { opacity: 0; transform: translateY(3px); }
}
@keyframes ui-dic-pop {
  from { opacity: 0; transform: scale(0.6); }
}

/* Narrow cards (phones) */
@container (max-width: 340px) {
  .ui-dic__head { padding: 0 14px; }
  .ui-dic__item { padding: 12px 14px 14px; }
  :where(.ui-dic) .ui-dic__title--folded { padding: 14px 14px; }
  .ui-dic__empty { padding: 14px; }
}
/* Touch screens: bigger tap targets */
@media (pointer: coarse) {
  .ui-dic__btn, .ui-dic__done { min-height: 36px; padding: 8px 14px; }
  .ui-dic__done { padding: 8px 14px 8px 12px; }
  .ui-dic__actions { min-height: 36px; }
  :where(.ui-dic) .ui-dic__title--folded { padding-top: 14px; padding-bottom: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-dic__row, .ui-dic__body { transition: none; }
  .ui-dic__done, .ui-dic__empty, .ui-dic__head .ui-dic__glyph, .ui-dic__head span { animation: none !important; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-dic {
  --ui-dic-card: var(--aui-surface, #1c1c1e);
  --ui-dic-strong: var(--aui-ink, #ffffff);
  --ui-dic-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-dic-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-dic-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-dic-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.3));
  --ui-dic-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-dic-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-dic-alert: var(--aui-amber, #e6c24d);
  --ui-dic-ok: var(--aui-green, #5fc88a);
  --ui-dic-ok-bg: color-mix(in srgb, var(--aui-green, #7dcf9f) 14%, transparent);
  /* The primary inverts: a light chip with dark text */
  --ui-dic-solid: var(--aui-primary, rgba(255, 255, 255, 0.9));
  --ui-dic-solid-hover: rgba(255, 255, 255, 0.82);
  --ui-dic-on-solid: var(--aui-on-primary, #161618);
  --ui-dic-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-dic-shadow-hover: 0 0 0 0.5px rgba(255, 255, 255, 0.16), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-dic-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
