"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";

/*
 * Filter Menu – grouped filters with chips, in a single self-contained file.
 * Active filters sit on top as removable chips; below, collapsible groups list their options as checkboxes
 * with a count of what's picked. Arrow keys move through groups and options, Enter or Space picks,
 * ← and → fold a group. Heights glide when groups open or chips come and go.
 * The styles are injected below, so no extra files are needed.
 */

export type FilterOption = { id: string; label: string };

export type FilterGroup = {
  id: string;
  label: string;
  options: FilterOption[];
  /** Put in front of the option on its chip, e.g. "Score: " → "Score: 80–90" */
  chipPrefix?: string;
};

/** Picked option ids per group id */
export type FilterValue = Record<string, string[]>;

export type FilterMenuProps = {
  groups: FilterGroup[];
  /** Controlled value */
  value?: FilterValue;
  /** Starting value when uncontrolled */
  defaultValue?: FilterValue;
  onChange?: (value: FilterValue) => void;
  /** Groups that start open – by default the first one */
  defaultOpen?: string[];
  title?: string;
  /** Show the keyboard hints at the bottom */
  hints?: boolean;
  className?: string;
};

type Row = { kind: "group"; group: FilterGroup } | { kind: "option"; group: FilterGroup; option: FilterOption };

export function FilterMenu({
  groups,
  value,
  defaultValue = {},
  onChange,
  defaultOpen,
  title = "Filters",
  hints = true,
  className,
}: FilterMenuProps) {
  const [inner, setInner] = useState<FilterValue>(defaultValue);
  const picked = value ?? inner;
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen ?? groups.slice(0, 1).map((g) => g.id)));
  const [focus, setFocus] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const chipsInner = useRef<HTMLDivElement>(null);
  const chipsOuter = useSmoothHeight(chipsInner);

  const commit = (next: FilterValue) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const isOn = (g: string, o: string) => picked[g]?.includes(o) ?? false;
  const toggle = (g: string, o: string) => {
    const cur = picked[g] ?? [];
    commit({ ...picked, [g]: cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o] });
  };
  const toggleGroup = (g: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });

  // Chips in the order of the groups and their options
  const chips = groups.flatMap((g) =>
    g.options.filter((o) => isOn(g.id, o.id)).map((o) => ({ group: g, option: o, label: `${g.chipPrefix ?? ""}${o.label}` })),
  );

  // Everything the arrow keys can reach, top to bottom
  const rows: Row[] = groups.flatMap((g) => [
    { kind: "group", group: g } as Row,
    ...(open.has(g.id) ? g.options.map((o) => ({ kind: "option", group: g, option: o }) as Row) : []),
  ]);
  const keyOf = (r: Row) => (r.kind === "group" ? `g:${r.group.id}` : `o:${r.group.id}:${r.option.id}`);

  const moveTo = (key: string) => {
    setFocus(key);
    listRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = rows.findIndex((r) => keyOf(r) === focus);
    const row = rows[i];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = rows[Math.max(0, Math.min(rows.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))] ?? rows[0];
      moveTo(keyOf(next));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      moveTo(keyOf(rows[e.key === "Home" ? 0 : rows.length - 1]));
    } else if (row && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      const g = row.group.id;
      if (e.key === "ArrowRight" && !open.has(g)) toggleGroup(g);
      if (e.key === "ArrowLeft") {
        if (open.has(g)) toggleGroup(g);
        moveTo(`g:${g}`);
      }
    } else if (row && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (row.kind === "group") toggleGroup(row.group.id);
      else toggle(row.group.id, row.option.id);
    }
  };

  return (
    <div className={["ui-fm", className].filter(Boolean).join(" ")}>
      <style href="ui-filter-menu" precedence="default">
        {css}
      </style>

      <div className="ui-fm__card">
        <div className="ui-fm__head">
          <span className="ui-fm__title">{title}</span>
          <button type="button" className="ui-fm__clear" disabled={chips.length === 0} onClick={() => commit({})}>
            Clear all
          </button>
        </div>

        {/* Active filters – the box glides to its new height as chips come and go */}
        <div className="ui-fm__chips-outer" ref={chipsOuter}>
          <div className="ui-fm__chips" ref={chipsInner} aria-live="polite">
            {chips.map((c) => (
              <span key={`${c.group.id}:${c.option.id}`} className="ui-fm__chip">
                {c.label}
                <button type="button" aria-label={`Remove ${c.label}`} onClick={() => toggle(c.group.id, c.option.id)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="ui-fm__groups" ref={listRef} onKeyDown={onKeyDown}>
          {groups.map((g) => {
            const isOpen = open.has(g.id);
            const count = picked[g.id]?.length ?? 0;
            const gKey = `g:${g.id}`;
            return (
              <section key={g.id} className="ui-fm__group" data-open={isOpen ? "" : undefined}>
                <button
                  type="button"
                  className="ui-fm__group-head"
                  data-key={gKey}
                  tabIndex={focus === gKey || (focus === null && g === groups[0]) ? 0 : -1}
                  aria-expanded={isOpen}
                  aria-controls={`${g.id}-options`}
                  onFocus={() => setFocus(gKey)}
                  onClick={() => toggleGroup(g.id)}
                >
                  <svg className="ui-fm__chevron" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.5 9.5 12 15l5.5-5.5" />
                  </svg>
                  <span className="ui-fm__group-label">{g.label}</span>
                  <span className="ui-fm__group-count">{g.options.length}</span>
                  <span className="ui-fm__group-picked" aria-live="polite">
                    {count > 0 ? `${count} filter${count === 1 ? "" : "s"}` : ""}
                  </span>
                </button>
                {/* Opens and closes by animating its grid row from 0 to the content height */}
                <div className="ui-fm__panel" id={`${g.id}-options`} role="group" aria-label={g.label}>
                  <div className="ui-fm__panel-inner">
                    {g.options.map((o) => {
                      const key = `o:${g.id}:${o.id}`;
                      const on = isOn(g.id, o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          className="ui-fm__option"
                          data-key={key}
                          tabIndex={isOpen && focus === key ? 0 : -1}
                          onFocus={() => setFocus(key)}
                          onClick={() => toggle(g.id, o.id)}
                        >
                          <span className="ui-fm__box" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                              <path d="m6 12.5 4 4 8-9" />
                            </svg>
                          </span>
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {hints && (
        <div className="ui-fm__hints" aria-hidden="true">
          <span className="ui-fm__hint">
            <kbd>
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14m0 0-5-5m5 5 5-5" />
              </svg>
            </kbd>
            <kbd>
              <svg viewBox="0 0 24 24">
                <path d="M12 19V5m0 0-5 5m5-5 5 5" />
              </svg>
            </kbd>
            To navigate
          </span>
          <span className="ui-fm__hint">
            <kbd>
              <svg viewBox="0 0 24 24">
                <path d="M18 6v6.5a2 2 0 0 1-2 2H7m0 0 3.5-3.5M7 14.5 10.5 18" />
              </svg>
            </kbd>
            To select
          </span>
        </div>
      )}
    </div>
  );
}

/** The outer box follows the inner box's height, with a transition after the first frame */
function useSmoothHeight(inner: RefObject<HTMLElement | null>) {
  const outer = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const sync = () => {
      o.style.height = `${i.offsetHeight}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(i);
    const frame = requestAnimationFrame(() => o.setAttribute("data-smooth", ""));
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [inner]);
  return outer;
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-fm {
  --ui-fm-tray: #f0f0f0;
  --ui-fm-card: #ffffff;
  --ui-fm-card-line: #e5e5e5;
  --ui-fm-ink: #171717;
  --ui-fm-text: #404040;
  --ui-fm-muted: #8f8f8f;
  --ui-fm-chip: #f3f3f3;
  --ui-fm-chip-hover: #ebebeb;
  --ui-fm-box: #f0f0f0;
  --ui-fm-box-line: #e3e3e3;
  --ui-fm-check: #ffffff;
  --ui-fm-row-hover: #f7f7f7;
  --ui-fm-kbd: #ffffff;
  --ui-fm-focus: #2f6bff;
  --ui-fm-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  --ui-fm-ease: cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  max-width: 420px;
  padding: 6px;
  border-radius: 24px;
  background: var(--ui-fm-tray);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ui-fm-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-fm *, .ui-fm *::before, .ui-fm *::after { box-sizing: border-box; }
.ui-fm button { font: inherit; color: inherit; margin: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.ui-fm button:focus-visible { outline: 2px solid var(--ui-fm-focus); outline-offset: 2px; }

.ui-fm__card {
  padding: 16px 16px 10px;
  border: 1px solid var(--ui-fm-card-line);
  border-radius: 20px;
  background: var(--ui-fm-card);
  box-shadow: var(--ui-fm-shadow);
}

/* ---------- Header ---------- */

.ui-fm__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 2px; }
.ui-fm__title { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.ui-fm__clear {
  padding: 4px 6px;
  margin-right: -6px !important;
  border: 0;
  border-radius: 8px;
  background: none;
  font-size: 13px;
  color: var(--ui-fm-muted) !important;
  transition: color 160ms ease, background-color 160ms ease, opacity 200ms ease;
}
.ui-fm__clear:hover:not(:disabled) { color: var(--ui-fm-ink) !important; background: var(--ui-fm-row-hover); }
.ui-fm__clear:disabled { opacity: 0.45; cursor: default; }

/* ---------- Chips ---------- */

.ui-fm__chips-outer { overflow: hidden; }
.ui-fm__chips-outer[data-smooth] { transition: height 320ms var(--ui-fm-ease); }
.ui-fm__chips { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 12px; }
.ui-fm__chips:empty { padding-top: 0; }
.ui-fm__chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 30px;
  padding: 0 4px 0 11px;
  border-radius: 10px;
  background: var(--ui-fm-chip);
  font-size: 13px;
  color: var(--ui-fm-text);
  white-space: nowrap;
  animation: ui-fm-chip-in 260ms var(--ui-fm-ease) both;
}
.ui-fm__chip button {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--ui-fm-muted);
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-fm__chip button:hover { background: var(--ui-fm-chip-hover); color: var(--ui-fm-ink); }
.ui-fm__chip svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; }

/* ---------- Groups ---------- */

.ui-fm__groups { display: grid; padding-top: 6px; }
.ui-fm__group-head {
  display: flex;
  align-items: center;
  gap: 7px;
  width: calc(100% + 12px);
  height: 36px;
  margin: 2px -6px 0 !important;
  padding: 0 8px 0 6px;
  border: 0;
  border-radius: 10px;
  background: none;
  text-align: left;
  transition: background-color 160ms ease;
}
.ui-fm__group-head:hover { background: var(--ui-fm-row-hover); }
.ui-fm__chevron {
  width: 16px;
  height: 16px;
  flex: none;
  fill: none;
  stroke: var(--ui-fm-text);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  transform: rotate(-90deg);
  transition: transform 260ms var(--ui-fm-ease);
}
.ui-fm__group[data-open] .ui-fm__chevron { transform: none; }
.ui-fm__group-label { font-size: 14px; font-weight: 500; }
.ui-fm__group-count { font-size: 12.5px; color: var(--ui-fm-muted); font-variant-numeric: tabular-nums; }
.ui-fm__group-picked { margin-left: auto; font-size: 12.5px; color: var(--ui-fm-muted); }

.ui-fm__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 320ms var(--ui-fm-ease);
}
.ui-fm__group[data-open] .ui-fm__panel { grid-template-rows: 1fr; }
.ui-fm__panel-inner {
  min-height: 0;
  overflow: hidden;
  display: grid;
  gap: 1px;
  padding: 0 0 0;
  opacity: 0;
  transition: opacity 220ms ease, padding 320ms var(--ui-fm-ease);
}
.ui-fm__group[data-open] .ui-fm__panel-inner { opacity: 1; padding: 2px 0 6px; }

.ui-fm__option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% + 12px);
  height: 34px;
  margin: 0 -6px !important;
  padding: 0 6px;
  border: 0;
  border-radius: 10px;
  background: none;
  font-size: 14px;
  color: var(--ui-fm-text) !important;
  text-align: left;
  transition: background-color 160ms ease;
}
.ui-fm__option:hover { background: var(--ui-fm-row-hover); }
.ui-fm__option:focus-visible { outline-offset: -2px; }
.ui-fm__box {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  flex: none;
  border-radius: 6px;
  background: var(--ui-fm-box);
  box-shadow: inset 0 0 0 1px var(--ui-fm-box-line);
  transition: background-color 180ms ease, box-shadow 180ms ease;
}
.ui-fm__box svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: var(--ui-fm-check);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  transition: stroke-dashoffset 260ms var(--ui-fm-ease);
}
.ui-fm__option[aria-checked="true"] .ui-fm__box { background: var(--ui-fm-ink); box-shadow: inset 0 0 0 1px var(--ui-fm-ink); }
.ui-fm__option[aria-checked="true"] .ui-fm__box svg { stroke-dashoffset: 0; }

/* ---------- Keyboard hints on the tray ---------- */

.ui-fm__hints { display: flex; justify-content: space-between; gap: 12px; padding: 10px 8px 4px; }
.ui-fm__hint { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; color: var(--ui-fm-text); }
.ui-fm__hint kbd {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--ui-fm-kbd);
  box-shadow: 0 0 0 1px var(--ui-fm-card-line), 0 1px 1px rgba(0, 0, 0, 0.04);
}
.ui-fm__hint kbd:last-of-type { margin-right: 4px; }
.ui-fm__hint svg { width: 13px; height: 13px; fill: none; stroke: var(--ui-fm-text); stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

@keyframes ui-fm-chip-in { from { opacity: 0; transform: scale(0.9); } }

@media (prefers-reduced-motion: reduce) {
  .ui-fm__chips-outer[data-smooth], .ui-fm__panel, .ui-fm__panel-inner, .ui-fm__chevron, .ui-fm__box svg { transition: none; }
  .ui-fm__chip { animation: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-fm {
  --ui-fm-tray: #161618;
  --ui-fm-card: #232326;
  --ui-fm-card-line: rgba(255, 255, 255, 0.08);
  --ui-fm-ink: #ededed;
  --ui-fm-text: #c4c4c4;
  --ui-fm-muted: #8f8f8f;
  --ui-fm-chip: #2a2a2d;
  --ui-fm-chip-hover: #313135;
  --ui-fm-box: #2a2a2d;
  --ui-fm-box-line: rgba(255, 255, 255, 0.1);
  --ui-fm-check: #121213;
  --ui-fm-row-hover: rgba(255, 255, 255, 0.05);
  --ui-fm-kbd: #232326;
  --ui-fm-focus: #6b95ff;
  --ui-fm-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
`;
