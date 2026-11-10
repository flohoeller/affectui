"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/*
 * Smart Recommendation (Clean) – a suggestion card with a confidence signal, alternatives and one-click accept, in a
 * single self-contained file.
 * Clean style: no tray – one white card with hairline shadows and quiet gray type; the signal and the actions sit in
 * the last row of the card. Fold it away, pick an alternative instead, accept and undo.
 * The styles are injected below, so no extra files are needed.
 */

export type Recommendation = {
  id: string;
  /** Short name, used in the accept button, e.g. "Incremental sync" */
  label: string;
  /** One sentence why – shown in the card */
  reason: ReactNode;
  /** 0 = no signal, 1 = weak, 2 = good, 3 = strong */
  signal: 0 | 1 | 2 | 3;
};

export type SmartRecommendationProps = {
  title?: string;
  /** First entry is the recommendation, the rest are offered as alternatives */
  options: Recommendation[];
  onAccept?: (option: Recommendation) => void;
  onUndo?: (option: Recommendation) => void;
  defaultOpen?: boolean;
  className?: string;
};

const signalText = ["No signal", "Weak signal", "Good signal", "Strong signal"];
/** Any signal outside 0–3 (NaN, "3", 7, -1) is read as the nearest valid level, NaN as no signal */
const level = (s: unknown): 0 | 1 | 2 | 3 => {
  const n = Math.round(Number(s));
  return (Number.isFinite(n) ? Math.min(3, Math.max(0, n)) : 0) as 0 | 1 | 2 | 3;
};
/** "Incremental sync" → "incremental sync", but "AWS backup" and "S3 sync" keep their capitals */
const lowerFirst = (s: string) => (/^\p{Lu}\p{Ll}/u.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

export function SmartRecommendation({
  title = "Smart recommendation",
  options,
  onAccept,
  onUndo,
  defaultOpen = true,
  className,
}: SmartRecommendationProps) {
  // By position, so two options with the same id stay apart
  const [chosen, setChosen] = useState(0);
  const [accepted, setAccepted] = useState<number | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // When the button sits at the start of its row (long labels push the actions onto their own row), the menu opens
  // to the right instead of past the card's left edge
  const [flip, setFlip] = useState(false);
  useLayoutEffect(() => {
    const alt = menuRef.current;
    const pop = alt?.querySelector<HTMLElement>(".ui-src__menu");
    const card = alt?.closest<HTMLElement>(".ui-src");
    if (!menu || !alt || !pop || !card || getComputedStyle(alt).position === "static") return setFlip(false);
    // Some slack: a menu that only grazes the edge (as in the demo) keeps opening to the left
    setFlip(alt.getBoundingClientRect().right - pop.offsetWidth < card.getBoundingClientRect().left - 24);
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const away = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const at = chosen < options.length ? chosen : 0;
  const current = options[at];
  // Nothing to recommend – render nothing rather than crash
  if (!current) return null;
  const isRecommended = at === 0;
  const done = accepted === at;
  const signal = level(current.signal);
  const acceptText = `Accept ${lowerFirst(String(current.label))}`;

  return (
    <>
      <style href="ui-smart-recommendation-clean" precedence="default">
        {css}
      </style>
      <section className={["ui-src", className].filter(Boolean).join(" ")} aria-label={title} data-accepted={done || undefined}>
        <button type="button" className="ui-src__head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <SparkMark />
          <span className="ui-src__title" dir="auto" title={title}>
            {title}
          </span>
          {!isRecommended && <span className="ui-src__pill">Alternative</span>}
          <span className="ui-src__chevron">
            <Icon d="m4.5 6.25 3.5 3.5 3.5-3.5" />
          </span>
        </button>
        <div className="ui-src__body" data-open={open || undefined} inert={!open}>
          <p className="ui-src__reason" key={at} dir="auto">
            {current.reason}
          </p>
        </div>

        <footer className="ui-src__foot">
          <span className="ui-src__signal" data-level={signal} title={signalText[signal]}>
            <span className="ui-src__bars" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span key={n} data-on={signal >= n || undefined} />
              ))}
            </span>
            {signalText[signal]}
          </span>

          <div className="ui-src__actions">
            {options.length > 1 && !done && (
              <div className="ui-src__alt" ref={menuRef}>
                <button
                  type="button"
                  className="ui-src__btn ui-src__btn--icon"
                  aria-haspopup="menu"
                  aria-expanded={menu}
                  onClick={() => setMenu((m) => !m)}
                >
                  <Icon d="M5 12.5v-9M2.75 5.75 5 3.5l2.25 2.25M11 3.5v9M8.75 10.25 11 12.5l2.25-2.25" />
                  Alternatives
                </button>
                {menu && (
                  <div className="ui-src__menu" role="menu" data-flip={flip || undefined}>
                    {options.map((o, i) => (
                      <button
                        key={`${o.id}-${i}`}
                        type="button"
                        role="menuitemradio"
                        aria-checked={i === at}
                        className="ui-src__option"
                        onClick={() => {
                          setChosen(i);
                          setMenu(false);
                          setOpen(true);
                        }}
                      >
                        <span className="ui-src__option-label">
                          <span className="ui-src__option-name" dir="auto" title={o.label}>
                            {o.label}
                          </span>
                          {i === 0 && <span className="ui-src__tag">Recommended</span>}
                        </span>
                        <span className="ui-src__mini" data-level={level(o.signal)} aria-label={signalText[level(o.signal)]}>
                          {[1, 2, 3].map((n) => (
                            <span key={n} data-on={level(o.signal) >= n || undefined} />
                          ))}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {done ? (
              <>
                <span className="ui-src__done" role="status">
                  <Icon d="m3.5 8.5 3 3 6-7" />
                  <span className="ui-src__done-text" title={`${current.label} accepted`}>
                    <bdi>{current.label}</bdi> accepted
                  </span>
                </span>
                <button
                  type="button"
                  className="ui-src__btn ui-src__btn--icon"
                  onClick={() => {
                    setAccepted(null);
                    onUndo?.(current);
                  }}
                >
                  <Icon d="M3.5 6.5h6.25a2.75 2.75 0 0 1 0 5.5H8M5.75 4.25 3.5 6.5l2.25 2.25" />
                  Undo
                </button>
              </>
            ) : (
              <button
                type="button"
                className="ui-src__btn ui-src__btn--primary"
                title={acceptText}
                onClick={() => {
                  setAccepted(at);
                  setMenu(false);
                  onAccept?.(current);
                }}
              >
                <span className="ui-src__btn-text">{acceptText}</span>
              </button>
            )}
          </div>
        </footer>
      </section>
    </>
  );
}

/** The assistant mark: a solid blue sparkle with a small one beside it */
const SparkMark = () => (
  <svg viewBox="0 0 16 16" className="ui-src__mark" aria-hidden="true">
    <path d="M6.5 2.2c.2 0 .36.14.4.33.53 2.6 1.4 3.48 4 4.02a.4.4 0 0 1 0 .79c-2.6.53-3.47 1.4-4 4a.4.4 0 0 1-.8 0c-.53-2.6-1.4-3.47-4-4a.4.4 0 0 1 0-.79c2.6-.54 3.47-1.42 4-4.02a.4.4 0 0 1 .4-.33Z" />
    <path d="M12 9.6c.12 0 .22.08.25.2.28 1.3.72 1.75 2.03 2.03a.25.25 0 0 1 0 .49c-1.31.28-1.75.72-2.03 2.03a.25.25 0 0 1-.5 0c-.28-1.31-.72-1.75-2.03-2.03a.25.25 0 0 1 0-.49c1.31-.28 1.75-.73 2.03-2.03a.25.25 0 0 1 .25-.2Z" />
  </svg>
);

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-src */
.ui-src {
  --ui-src-card: var(--aui-surface, #ffffff);
  --ui-src-strong: var(--aui-ink, #000000);
  --ui-src-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-src-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-src-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-src-faint: rgba(0, 0, 0, 0.27);
  --ui-src-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-src-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-src-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-src-fill: rgba(0, 0, 0, 0.06);
  --ui-src-bar: rgba(0, 0, 0, 0.1);
  --ui-src-accent: rgba(0, 96, 226, 0.765);
  --ui-src-accent-bg: rgba(0, 96, 226, 0.05);
  --ui-src-accent-line: rgba(0, 96, 226, 0.35);
  --ui-src-tag: rgba(0, 96, 226, 0.08);
  --ui-src-alt: var(--aui-purple, #a651f0);
  --ui-src-alt-bg: color-mix(in srgb, var(--aui-purple, #a651f0) 10%, transparent);
  --ui-src-ok: var(--aui-success, #1e8a4f);
  --ui-src-ok-bg: color-mix(in srgb, var(--aui-green, #5fc88a) 8%, transparent);
  --ui-src-warn: var(--aui-amber, #e8b000);
  --ui-src-solid: var(--aui-primary, rgba(0, 0, 0, 0.88));
  --ui-src-solid-hover: rgba(0, 0, 0, 0.8);
  --ui-src-on-solid: var(--aui-on-primary, #fcfcfc);
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-src-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-src-shadow-hover: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 1px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.07);
  --ui-src-shadow-pop: var(--aui-shadow-popover, 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 12px 28px -10px rgba(0, 0, 0, 0.16), 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  --ui-src-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-src-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  container-type: inline-size;
  width: 100%;
  max-width: 440px;
  /* One white card – the edge is a shadow, not a border */
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--ui-src-card);
  box-shadow: var(--aui-shadow-card, var(--ui-src-shadow));
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(--ui-src-ink);
  text-align: left;
  -webkit-font-smoothing: antialiased;
}
.ui-src *, .ui-src *::before, .ui-src *::after { box-sizing: border-box; }
:where(.ui-src) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
:where(.ui-src) svg { display: block; flex: none; }
.ui-src button:focus-visible { outline: 2px solid var(--ui-src-focus); outline-offset: 2px; }

/* The heading row folds the reason in and out */
.ui-src__head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 12px 0 16px;
  border-radius: var(--aui-radius-lg, 10px) var(--aui-radius-lg, 10px) 0 0;
  text-align: left;
  transition: background-color 140ms ease;
}
.ui-src__head:hover { background: var(--ui-src-wash); }
.ui-src button.ui-src__head:focus-visible { outline-offset: -2px; }
.ui-src__mark { width: 16px; height: 16px; fill: var(--ui-src-accent); }
.ui-src__title { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: 500; color: var(--ui-src-strong); }
.ui-src__pill {
  flex: none;
  padding: 0 6px;
  border-radius: var(--aui-radius-sm, 5px);
  background: var(--ui-src-alt-bg);
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-src-alt);
  animation: ui-src-swap 300ms var(--ui-src-ease);
}
.ui-src__chevron {
  display: grid;
  place-items: center;
  flex: none;
  width: 20px;
  height: 20px;
  margin-left: auto;
  color: var(--ui-src-icon);
  transition: transform 280ms var(--ui-src-ease), color 140ms ease;
}
.ui-src__head:hover .ui-src__chevron { color: var(--ui-src-ink); }
.ui-src__head[aria-expanded="false"] .ui-src__chevron { transform: rotate(-90deg); }

/* Only the reason folds – the last row never gets clipped */
.ui-src__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 340ms var(--ui-src-ease);
}
.ui-src__body[data-open] { grid-template-rows: 1fr; }
.ui-src__reason {
  min-height: 0;
  overflow: hidden;
  margin: 0;
  padding: 0 16px;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-src-text);
  text-align: start;
  white-space: pre-line;
  overflow-wrap: anywhere;
  animation: ui-src-swap 360ms var(--ui-src-ease);
}
.ui-src__body[data-open] .ui-src__reason { padding-bottom: 14px; }
.ui-src__reason strong { font-weight: 500; color: var(--ui-src-ink); }

/* The last row: the signal on the left, the actions on the right */
.ui-src__foot {
  display: flex;
  align-items: center;
  /* Narrow cards: the actions move below the signal instead of running out of the card */
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 10px;
  min-height: 48px;
  padding: 10px 10px 10px 16px;
  border-top: 0.5px solid var(--ui-src-line);
}
.ui-src__signal {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  color: var(--ui-src-text);
}
.ui-src__bars, .ui-src__mini { display: inline-flex; align-items: flex-end; gap: 2px; }
.ui-src__bars span, .ui-src__mini span {
  width: 3px;
  border-radius: 1px;
  background: var(--ui-src-bar);
  transition: background-color 260ms ease;
}
.ui-src__bars span:nth-child(1), .ui-src__mini span:nth-child(1) { height: 5px; }
.ui-src__bars span:nth-child(2), .ui-src__mini span:nth-child(2) { height: 8px; }
.ui-src__bars span:nth-child(3), .ui-src__mini span:nth-child(3) { height: 11px; }
.ui-src [data-level="1"] > span[data-on] { background: var(--ui-src-warn); }
.ui-src [data-level="2"] > span[data-on] { background: var(--ui-src-accent); }
.ui-src [data-level="3"] > span[data-on] { background: var(--ui-src-ok); }
.ui-src [data-level="0"] > span:first-child { background: var(--ui-src-faint); }

/* Never wider than the row – a long label shortens in its button instead of running out of the card */
.ui-src__actions { display: flex; align-items: center; gap: 8px; min-width: 0; max-width: 100%; margin-left: auto; }
.ui-src__alt, .ui-src__btn--icon { flex: none; }

/* Secondary: white with the card's hairline shadow */
.ui-src__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: calc(var(--aui-radius, 7px) - 1px);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  min-width: 0;
  max-width: 100%;
  white-space: nowrap;
  transition: background-color 140ms ease, box-shadow 140ms ease, transform 160ms var(--ui-src-ease);
}
.ui-src__btn-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
:where(.ui-src) .ui-src__btn { background: var(--ui-src-card); box-shadow: var(--ui-src-shadow); color: var(--ui-src-strong); }
.ui-src__btn--icon { padding: 0 10px 0 8px; }
.ui-src__btn--icon svg { color: var(--ui-src-icon); }
.ui-src__btn:hover { box-shadow: var(--ui-src-shadow-hover); }
.ui-src__btn[aria-expanded="true"] { background: var(--ui-src-wash); }
.ui-src__btn:active { transform: scale(0.97); }
/* Primary: a dark chip */
:where(.ui-src) .ui-src__btn--primary { background: var(--ui-src-solid); box-shadow: none; color: var(--ui-src-on-solid); }
.ui-src__btn--primary:hover { background: var(--ui-src-solid-hover); box-shadow: none; }

/* Accepted: a minimal green fill in the place of the button */
.ui-src__done {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  height: 28px;
  padding: 0 10px 0 8px;
  border-radius: calc(var(--aui-radius, 7px) - 1px);
  background: var(--ui-src-ok-bg);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-src-ok);
  animation: ui-src-swap 300ms var(--ui-src-ease);
}
.ui-src__done-text { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

/* Alternatives: a white popover above the button */
.ui-src__alt { position: relative; }
.ui-src__menu {
  position: absolute;
  bottom: calc(100% + 6px);
  right: 0;
  z-index: 5;
  display: grid;
  gap: 2px;
  /* The column never grows with a long name; a long list scrolls */
  grid-template-columns: minmax(0, 1fr);
  width: 248px;
  max-height: min(320px, 60vh);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px;
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--aui-overlay, var(--ui-src-card));
  box-shadow: var(--ui-src-shadow-pop);
  animation: ui-src-drop 180ms var(--ui-src-ease);
}
.ui-src__menu[data-flip] { right: auto; left: 0; }
/* Narrow: the actions sit on their own row – the menu lines up with its right edge so it stays inside */
@container (max-width: 420px) {
  .ui-src__actions { position: relative; }
  .ui-src__alt { position: static; }
  .ui-src__menu { width: min(248px, 100cqw - 20px); }
}
.ui-src__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 32px;
  padding: 0 10px 0 8px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  color: var(--ui-src-ink);
  transition: background-color 90ms ease-out;
}
.ui-src__option:hover { background: var(--ui-src-wash); }
/* The chosen one: a light blue fill with a hairline */
.ui-src__option[aria-checked="true"] { background: var(--ui-src-accent-bg); box-shadow: inset 0 0 0 0.5px var(--ui-src-accent-line); }
.ui-src button.ui-src__option:focus-visible { outline-offset: -2px; }
.ui-src__option-label { display: inline-flex; flex: 0 1 auto; align-items: center; gap: 6px; min-width: 0; }
.ui-src__mini { flex: none; }
.ui-src__option-name { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ui-src__tag {
  flex: none;
  padding: 0 5px;
  border-radius: var(--aui-radius-sm, 5px);
  background: var(--ui-src-tag);
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  color: var(--ui-src-accent);
}

@keyframes ui-src-swap { from { opacity: 0; transform: translateY(2px); } }
@keyframes ui-src-drop { from { opacity: 0; transform: translateY(4px) scale(0.98); } }

/* Narrow cards (phones) */
@container (max-width: 340px) {
  .ui-src__head { padding: 0 10px 0 14px; }
  .ui-src__reason { padding: 0 14px; }
  .ui-src__foot { padding: 10px 10px 10px 14px; }
}
/* Touch screens: bigger tap targets */
@media (pointer: coarse) {
  .ui-src__head { height: 48px; }
  .ui-src__btn, .ui-src__done { height: 36px; }
  .ui-src__btn { padding: 0 14px; }
  .ui-src__btn--icon, .ui-src__done { padding: 0 14px 0 12px; }
  .ui-src__option { height: 40px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-src__reason, .ui-src__done, .ui-src__menu, .ui-src__pill { animation: none; }
  .ui-src__body, .ui-src__chevron { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-src {
  --ui-src-card: var(--aui-surface, #1c1c1e);
  --ui-src-strong: var(--aui-ink, #ffffff);
  --ui-src-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-src-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-src-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-src-faint: rgba(255, 255, 255, 0.3);
  --ui-src-icon: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-src-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-src-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-src-fill: rgba(255, 255, 255, 0.08);
  --ui-src-bar: rgba(255, 255, 255, 0.14);
  --ui-src-accent: var(--aui-blue, #4fb0fe);
  --ui-src-accent-bg: rgba(77, 141, 255, 0.14);
  --ui-src-accent-line: rgba(77, 141, 255, 0.4);
  --ui-src-tag: rgba(77, 141, 255, 0.16);
  --ui-src-alt: var(--aui-purple, #b98af0);
  --ui-src-alt-bg: color-mix(in srgb, var(--aui-purple, #b98af0) 22%, transparent);
  --ui-src-ok: var(--aui-green, #5fc88a);
  --ui-src-ok-bg: color-mix(in srgb, var(--aui-green, #7dcf9f) 14%, transparent);
  --ui-src-warn: var(--aui-amber, #e6c24d);
  /* The primary inverts: a light chip with dark text */
  --ui-src-solid: var(--aui-primary, rgba(255, 255, 255, 0.9));
  --ui-src-solid-hover: rgba(255, 255, 255, 0.82);
  --ui-src-on-solid: var(--aui-on-primary, #161618);
  --ui-src-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-src-shadow-hover: 0 0 0 0.5px rgba(255, 255, 255, 0.16), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-src-shadow-pop: var(--aui-shadow-popover, 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 12px 28px -10px rgba(0, 0, 0, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.4));
  --ui-src-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
:where(.dark, [data-theme="dark"]) .ui-src__menu { background: var(--aui-overlay, #232326); }
`;
