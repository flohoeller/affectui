"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties } from "react";

/*
 * Pagination – a single self-contained file, clean style.
 * Moves through pages of rows: the range you see ("1–20 of 1,284"), previous and next, page numbers with … between
 * them and, when you give it sizes, a rows-per-page choice. The numbers keep a fixed count of slots and one width,
 * so nothing jumps from page to page, 1 page or 10,000. When the row gets too narrow for the numbers, only the range
 * and the arrows stay. The styles are injected below, so no extra files are needed.
 */

export type PaginationProps = Omit<ComponentPropsWithRef<"nav">, "children" | "onChange"> & {
  /** The page shown, from 1 */
  page: number;
  onPageChange: (page: number) => void;
  /** All rows – shows the range ("1–20 of 1,284") and works out the pages */
  total?: number;
  /** Rows on a page */
  pageSize?: number;
  /** The number of pages, when you don't know the total rows */
  pageCount?: number;
  /** Shows a rows-per-page choice with these sizes, e.g. [10, 20, 50] */
  pageSizes?: number[];
  /** A new size; the page that holds the first row you saw is passed to onPageChange as well */
  onPageSizeChange?: (pageSize: number) => void;
  /** Page numbers on each side of the current one */
  siblings?: number;
  /** Only the range and the arrows – no page numbers, e.g. under a small table */
  compact?: boolean;
  /** While rows load: shown, but nothing can be pressed */
  disabled?: boolean;
};

const fmt = new Intl.NumberFormat("en-US");

export function Pagination({
  page: pageProp,
  onPageChange,
  total,
  pageSize = 20,
  pageCount,
  pageSizes,
  onPageSizeChange,
  siblings = 1,
  compact = false,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Pagination",
  ref,
  ...rest
}: PaginationProps) {
  const uid = useId();
  const size = Math.max(1, Math.floor(pageSize) || 1);
  const rows = total != null && Number.isFinite(total) ? Math.max(0, Math.floor(total)) : null;
  const count = Math.max(1, rows != null ? Math.ceil(rows / size) : Math.floor(pageCount ?? 1) || 1);
  const page = Math.min(count, Math.max(1, Math.floor(pageProp) || 1));
  const sib = Math.max(0, Math.floor(siblings) || 0);

  // Too narrow for the numbers: only the range and the arrows (checked before paint, again when it gets wider)
  const nav = useRef<HTMLElement | null>(null);
  const [tight, setTight] = useState(false);
  const tightAt = useRef(0);
  // More pages (wider numbers) or other slots: measure again
  const sig = `${count}|${sib}|${compact}`;
  const [seen, setSeen] = useState(sig);
  if (seen !== sig) {
    setSeen(sig);
    setTight(false);
  }
  useLayoutEffect(() => {
    const el = nav.current;
    if (!el || tight || compact) return;
    if (el.scrollWidth > el.clientWidth + 1) {
      tightAt.current = el.clientWidth;
      setTight(true);
    }
  });
  useEffect(() => {
    const el = nav.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > tightAt.current + 1) setTight(false);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // After a number is pressed, the focus follows the page to its new slot
  const follow = useRef(false);
  useLayoutEffect(() => {
    if (!follow.current) return;
    follow.current = false;
    nav.current?.querySelector<HTMLElement>(`[data-page="${page}"]`)?.focus({ preventScroll: true });
  }, [page]);

  const go = (to: number, fromNumber = false) => {
    if (disabled) return;
    const next = Math.min(count, Math.max(1, to));
    if (next === page) return;
    follow.current = fromNumber && !!nav.current?.contains(document.activeElement);
    onPageChange(next);
  };

  const first = rows === 0 ? 0 : (page - 1) * size + 1;
  const last = rows == null ? 0 : Math.min(page * size, rows);
  const numbers = !compact && !tight;
  const sizes = pageSizes?.length ? [...new Set([...pageSizes, size])].filter((s) => s > 0).sort((a, b) => a - b) : null;

  return (
    <nav
      {...rest}
      ref={(el) => {
        nav.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      aria-label={ariaLabel}
      className={["ui-pgnc", className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      style={{ ...rest.style, "--ui-pgnc-digits": fmt.format(count).length } as CSSProperties}
    >
      {/* React 19 hoists this into <head> once, no matter how many pagers render */}
      <style href="ui-pagination-clean" precedence="default">
        {css}
      </style>

      <div className="ui-pgnc__info">
        {sizes && (
          <label className="ui-pgnc__size">
            <span className="ui-pgnc__size-label">Rows per page</span>
            <span className="ui-pgnc__select">
              <select
                id={`${uid}-size`}
                value={size}
                disabled={disabled}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  onPageSizeChange?.(next);
                  // Keep the first row you saw on screen
                  const keep = Math.floor(((page - 1) * size) / next) + 1;
                  if (keep !== page) onPageChange(keep);
                }}
              >
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {fmt.format(s)}
                  </option>
                ))}
              </select>
              <ChevronDownIcon />
            </span>
          </label>
        )}
        <span className="ui-pgnc__range" aria-live="polite" aria-atomic="true">
          {rows != null ? (
            rows === 0 ? (
              "0 of 0"
            ) : (
              <>
                {fmt.format(first)}–{fmt.format(last)} <span className="ui-pgnc__of">of</span> {fmt.format(rows)}
              </>
            )
          ) : (
            <>
              Page {fmt.format(page)} <span className="ui-pgnc__of">of</span> {fmt.format(count)}
            </>
          )}
        </span>
      </div>

      <ul className="ui-pgnc__pages">
        <li>
          <button
            type="button"
            className="ui-pgnc__step"
            aria-label="Previous page"
            aria-disabled={disabled || page <= 1 || undefined}
            onClick={() => go(page - 1)}
          >
            <ChevronIcon dir="left" />
          </button>
        </li>
        {numbers &&
          slots(page, count, sib).map((p, i) =>
            p === 0 ? (
              <li key={i} className="ui-pgnc__gap" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={i}>
                <button
                  type="button"
                  className="ui-pgnc__num"
                  data-page={p}
                  aria-label={`Page ${fmt.format(p)}`}
                  aria-current={p === page ? "page" : undefined}
                  aria-disabled={disabled || undefined}
                  onClick={() => go(p, true)}
                >
                  {fmt.format(p)}
                </button>
              </li>
            ),
          )}
        <li>
          <button
            type="button"
            className="ui-pgnc__step"
            aria-label="Next page"
            aria-disabled={disabled || page >= count || undefined}
            onClick={() => go(page + 1)}
          >
            <ChevronIcon dir="right" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

/**
 * The page numbers – always the same number of slots once there are more pages than fit (first, last, the current
 * with its siblings and a … on either side), so the row never changes width. 0 stands for …
 */
function slots(page: number, count: number, sib: number): number[] {
  const n = 2 * sib + 5;
  const run = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (count <= n) return run(1, count);
  if (page - sib <= 3) return [...run(1, n - 2), 0, count];
  if (page + sib >= count - 2) return [1, 0, ...run(count - (n - 3), count)];
  return [1, 0, ...run(page - sib, page + sib), 0, count];
}

/* Icons: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) */
function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true">
      <path d={dir === "left" ? "M15 6s-6 4.42-6 6 6 6 6 6" : "M9 6s6 4.42 6 6-6 6-6 6"} />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true">
      <path d="M18 9s-4.42 6-6 6-6-6-6-6" />
    </svg>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-pgnc (see Theming in the docs) */
.ui-pgnc {
  --ui-pgnc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-pgnc-text: rgba(0, 0, 0, 0.61);
  --ui-pgnc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-pgnc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.27));
  --ui-pgnc-wash: rgba(0, 0, 0, 0.04);
  --ui-pgnc-active: var(--aui-subtle, rgba(0, 0, 0, 0.06));
  --ui-pgnc-surface: var(--aui-surface, #ffffff);
  --ui-pgnc-shadow: 0 0 0 0.5px var(--aui-border, rgba(0, 0, 0, 0.06)), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-pgnc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(0, 0, 0, 0.1)), 0 2px 6px -1px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-pgnc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-pgnc-radius: var(--aui-radius, 6px);
  --ui-pgnc-h: 28px;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--ui-pgnc-muted);
  white-space: nowrap;
  -webkit-font-smoothing: antialiased;
}
.ui-pgnc *, .ui-pgnc *::before, .ui-pgnc *::after { box-sizing: border-box; }
.ui-pgnc svg { display: block; flex: none; }

.ui-pgnc__info { display: flex; align-items: center; gap: 16px; min-width: 0; }
.ui-pgnc__range { color: var(--ui-pgnc-text); }
.ui-pgnc__of { color: var(--ui-pgnc-muted); }

/* Rows per page: a quiet label and a small white field – the browser's own list opens from it */
.ui-pgnc__size { display: inline-flex; align-items: center; gap: 8px; cursor: default; }
.ui-pgnc__select { position: relative; display: inline-flex; align-items: center; }
.ui-pgnc__select > select {
  appearance: none;
  height: var(--ui-pgnc-h);
  margin: 0;
  padding: 0 26px 0 10px;
  border: 0;
  border-radius: var(--ui-pgnc-radius);
  background: var(--ui-pgnc-surface);
  box-shadow: var(--ui-pgnc-shadow);
  font: inherit;
  font-weight: 500;
  color: var(--ui-pgnc-ink);
  cursor: pointer;
  transition: box-shadow 140ms ease;
}
.ui-pgnc__select > select:hover:not(:disabled) { box-shadow: var(--ui-pgnc-shadow-hover); }
.ui-pgnc__select > svg { position: absolute; right: 8px; width: 12px; height: 12px; color: var(--ui-pgnc-muted); pointer-events: none; }
.ui-pgnc__select > select:dir(rtl) { padding: 0 10px 0 26px; }
.ui-pgnc__select > select:dir(rtl) + svg { right: auto; left: 8px; }

/* The arrows and the numbers: one row, every number as wide as the longest */
.ui-pgnc__pages { display: flex; align-items: center; gap: 2px; margin: 0 0 0 auto; padding: 0; list-style: none; }
.ui-pgnc__pages > li { display: flex; }
.ui-pgnc__num,
.ui-pgnc__step {
  position: relative;
  display: inline-grid;
  place-items: center;
  height: var(--ui-pgnc-h);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--ui-pgnc-radius);
  background: none;
  font: inherit;
  color: var(--ui-pgnc-text);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, color 120ms ease;
}
.ui-pgnc__num { min-width: max(var(--ui-pgnc-h), calc(var(--ui-pgnc-digits, 1) * 1ch + 14px)); padding: 0 7px; }
.ui-pgnc__step { width: var(--ui-pgnc-h); color: var(--ui-pgnc-muted); }
.ui-pgnc__step > svg { width: 14px; height: 14px; }
.ui-pgnc__step > svg:dir(rtl) { transform: scaleX(-1); }
.ui-pgnc__num:hover:not([aria-disabled]),
.ui-pgnc__step:hover:not([aria-disabled]) { background: var(--ui-pgnc-wash); color: var(--ui-pgnc-ink); }
/* The page you're on: a gray fill, like an active tab */
.ui-pgnc__num[aria-current="page"],
.ui-pgnc__num[aria-current="page"]:hover { background: var(--ui-pgnc-active); color: var(--ui-pgnc-ink); font-weight: 500; cursor: default; }
.ui-pgnc__step[aria-disabled] { opacity: 0.4; cursor: default; }
.ui-pgnc__num:focus-visible,
.ui-pgnc__step:focus-visible,
.ui-pgnc__select > select:focus-visible { outline: 2px solid var(--ui-pgnc-focus); outline-offset: 2px; }
.ui-pgnc__select > select:focus:not(:focus-visible) { outline: none; }
.ui-pgnc__gap { display: grid; place-items: center; min-width: 20px; height: var(--ui-pgnc-h); color: var(--ui-pgnc-faint); user-select: none; }

/* While rows load: everything stays, nothing can be pressed */
.ui-pgnc[data-disabled] .ui-pgnc__pages,
.ui-pgnc[data-disabled] .ui-pgnc__size { opacity: 0.5; }
.ui-pgnc[data-disabled] button { cursor: default; }
.ui-pgnc[data-disabled] .ui-pgnc__num[aria-current="page"] { background: var(--ui-pgnc-active); }

/* Touch screens: every number and arrow a finger can hit */
@media (pointer: coarse) {
  .ui-pgnc { --ui-pgnc-h: 36px; font-size: 15px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-pgnc__num, .ui-pgnc__step, .ui-pgnc__select > select { transition-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-pgnc {
  --ui-pgnc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-pgnc-text: rgba(255, 255, 255, 0.62);
  --ui-pgnc-muted: var(--aui-muted, rgba(255, 255, 255, 0.45));
  --ui-pgnc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.28));
  --ui-pgnc-wash: rgba(255, 255, 255, 0.06);
  --ui-pgnc-active: var(--aui-subtle, rgba(255, 255, 255, 0.09));
  --ui-pgnc-surface: var(--aui-surface, #1b1b1e);
  --ui-pgnc-shadow: 0 0 0 0.5px var(--aui-border, rgba(255, 255, 255, 0.1)), 0 1px 2px rgba(0, 0, 0, 0.4);
  --ui-pgnc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(255, 255, 255, 0.16)), 0 2px 6px rgba(0, 0, 0, 0.4);
  --ui-pgnc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
