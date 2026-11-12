"use client";

import {
  createElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

/*
 * Breadcrumb – a single self-contained file.
 * The trail from the top of a hierarchy to the page you are on: links with a quiet chevron or slash between them and
 * the current page last, in ink. A long trail folds its middle into a … button that opens the hidden crumbs as a
 * menu – past maxItems, and on its own when the row gets too narrow for them. Long names shorten with … and show in
 * full on hover. The styles are injected below, so no extra files are needed.
 */

/** An icon from Hugeicons (e.g. `import { Folder01Icon } from "@hugeicons/core-free-icons"`) – drawn inline */
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type BreadcrumbItem = {
  label: string;
  /** Makes the crumb a link */
  href?: string;
  /** Makes the crumb a button when there is no href – or runs before a link navigates (e.g. a router's navigate) */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** A 14px glyph before the label: an inline SVG or a Hugeicons icon object */
  icon?: ReactNode | HugeIcon;
};

export type BreadcrumbProps = Omit<ComponentPropsWithRef<"nav">, "children"> & {
  /** From the top down; the last one is the page you are on */
  items: BreadcrumbItem[];
  /** What sits between the crumbs */
  separator?: "slash" | "chevron" | ReactNode;
  /** The most crumbs shown before the middle folds into … (the first and the last ones stay) */
  maxItems?: number;
};

export function Breadcrumb({
  items,
  separator = "chevron",
  maxItems = 4,
  className,
  "aria-label": ariaLabel = "Breadcrumb",
  ref,
  ...rest
}: BreadcrumbProps) {
  const list = useRef<HTMLOListElement>(null);
  const n = items.length;
  // Folded by count: everything past maxItems, taken from just after the first crumb
  const byCount = n > Math.max(2, maxItems) ? n - Math.max(2, maxItems) : 0;
  // Folded by width: one more each time the row doesn't fit, until only the first and the current are left
  const [extra, setExtra] = useState(0);
  const [, setWidth] = useState(0);
  const sig = items.map((i) => i.label).join("\u0000") + `|${maxItems}`;
  const [seen, setSeen] = useState(sig);
  if (seen !== sig) {
    setSeen(sig);
    setExtra(0);
  }
  const hidden = Math.min(Math.max(0, n - 2), byCount + extra);
  const folded = items.slice(1, 1 + hidden);

  // Before paint: still too tight for every crumb at a readable width – fold one more
  useLayoutEffect(() => {
    const ol = list.current;
    if (!ol || hidden >= n - 2) return;
    if (need(ol) > ol.clientWidth + 1) setExtra((e) => e + 1);
  });

  // A narrower or wider row starts over from the folding by count
  useEffect(() => {
    const ol = list.current;
    if (!ol || typeof ResizeObserver === "undefined") return;
    let width = ol.clientWidth;
    const ro = new ResizeObserver(() => {
      if (Math.abs(ol.clientWidth - width) < 1) return;
      width = ol.clientWidth;
      setExtra(0);
      setWidth(width);
    });
    ro.observe(ol);
    return () => ro.disconnect();
  }, [n === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (n === 0) return null;

  const sep = (key: string) => (
    <li key={key} className="ui-bcr__sep" role="presentation" aria-hidden="true">
      {separator === "slash" ? "/" : separator === "chevron" ? <ChevronIcon /> : separator}
    </li>
  );

  const nodes: ReactNode[] = [];
  items.forEach((item, i) => {
    if (i > 0 && i <= hidden) {
      if (i === 1) {
        nodes.push(sep("s-more"));
        nodes.push(
          <li key="more" className="ui-bcr__item">
            <More items={folded} />
          </li>,
        );
      }
      return;
    }
    if (i > 0) nodes.push(sep(`s-${i}`));
    const last = i === n - 1;
    nodes.push(
      <li key={`${i}-${item.label}`} className="ui-bcr__item" data-current={last || undefined}>
        <Crumb item={item} current={last} />
      </li>,
    );
  });

  return (
    <nav
      {...rest}
      ref={ref}
      aria-label={ariaLabel}
      className={["ui-bcr", className].filter(Boolean).join(" ")}
      data-tight={hidden >= n - 2 && n > 2 ? "" : undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many breadcrumbs render */}
      <style href="ui-breadcrumb" precedence="default">
        {css}
      </style>
      <ol ref={list} className="ui-bcr__list">
        {nodes}
      </ol>
    </nav>
  );
}

/* ---------- One crumb ---------- */

function Crumb({ item, current }: { item: BreadcrumbItem; current: boolean }) {
  const inner = (
    <>
      {item.icon != null && (
        <span className="ui-bcr__icon" aria-hidden="true">
          <Glyph icon={item.icon} />
        </span>
      )}
      <span className="ui-bcr__label" data-label="" dir="auto">
        {item.label}
      </span>
    </>
  );
  if (current)
    return (
      <span className="ui-bcr__current" aria-current="page" onPointerEnter={fullTitle(item.label)}>
        {inner}
      </span>
    );
  if (item.href)
    return (
      <a className="ui-bcr__link" href={item.href} onClick={item.onClick} onPointerEnter={fullTitle(item.label)}>
        {inner}
      </a>
    );
  if (item.onClick)
    return (
      <button type="button" className="ui-bcr__link" onClick={item.onClick} onPointerEnter={fullTitle(item.label)}>
        {inner}
      </button>
    );
  return (
    <span className="ui-bcr__link" data-static="" onPointerEnter={fullTitle(item.label)}>
      {inner}
    </span>
  );
}

/** The full name as a tooltip – only while it is cut short */
const fullTitle = (label: string) => (e: MouseEvent<HTMLElement>) => {
  const text = e.currentTarget.querySelector<HTMLElement>("[data-label]");
  if (!text) return;
  if (text.scrollWidth > text.clientWidth + 1) e.currentTarget.title = label;
  else e.currentTarget.removeAttribute("title");
};

/** The width the crumbs want: each at its full name, but no more than the 200px a label may take */
function need(ol: HTMLElement) {
  let sum = 0;
  for (const li of Array.from(ol.children) as HTMLElement[]) {
    const label = li.querySelector<HTMLElement>("[data-label]");
    const box = li.getBoundingClientRect().width;
    sum += label ? box - label.getBoundingClientRect().width + Math.min(label.scrollWidth, CAP) : box;
  }
  return sum;
}
const CAP = 200;

/* ---------- The folded crumbs: … and its menu ---------- */

function More({ items }: { items: BreadcrumbItem[] }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const rows = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []);
  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) button.current?.focus({ preventScroll: true });
  };

  // Into the top layer under the button, before paint; the first row takes the focus
  useLayoutEffect(() => {
    const el = panel.current;
    const b = button.current;
    if (!open || !el || !b) return;
    if ("showPopover" in el && !el.matches(":popover-open")) el.showPopover();
    const update = () => place(el, b.getBoundingClientRect());
    update();
    rows()[0]?.focus({ preventScroll: true });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      if ("hidePopover" in el && el.isConnected && el.matches(":popover-open")) el.hidePopover();
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // A press outside closes it
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !button.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const all = rows();
    const at = all.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => all[(i + all.length) % all.length]?.focus();
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(all.length - 1);
    else if (e.key === "Escape") close(true);
    else if (e.key === "Tab") return setOpen(false);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const pick = (item: BreadcrumbItem) => (e: MouseEvent<HTMLElement>) => {
    item.onClick?.(e);
    close(!item.href);
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        className="ui-bcr__more"
        aria-label={items.length === 1 ? "Show 1 more crumb" : `Show ${items.length} more crumbs`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${uid}-menu` : undefined}
        title={items.map((i) => i.label).join(" / ")}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <MoreIcon />
      </button>
      {open && (
        <div ref={panel} id={`${uid}-menu`} className="ui-bcr__menu" role="menu" aria-label="More crumbs" popover="manual" onKeyDown={onKey}>
          {items.map((item, i) => {
            const body = (
              <>
                <span className="ui-bcr__menu-icon" aria-hidden="true">
                  {item.icon != null ? <Glyph icon={item.icon} /> : <NestIcon />}
                </span>
                <span className="ui-bcr__menu-label" dir="auto">
                  {item.label}
                </span>
              </>
            );
            const style = { "--depth": Math.min(i, 3) } as CSSProperties;
            return item.href ? (
              <a key={i} role="menuitem" tabIndex={-1} className="ui-bcr__menu-item" style={style} href={item.href} title={item.label} onClick={pick(item)}>
                {body}
              </a>
            ) : (
              <button
                key={i}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="ui-bcr__menu-item"
                style={style}
                title={item.label}
                aria-disabled={item.onClick ? undefined : true}
                onClick={item.onClick ? pick(item) : undefined}
              >
                {body}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/** Under the button, or above it when there is no room; pushed inside the window */
function place(el: HTMLElement, r: DOMRect) {
  const pad = 8;
  const gap = 6;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = window.innerHeight;
  el.style.maxHeight = "";
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const below = vh - r.bottom - gap - pad;
  const above = r.top - gap - pad;
  const down = below >= h || below >= above;
  const fit = Math.max(120, Math.min(h, down ? below : above));
  const rtl = getComputedStyle(el).direction === "rtl";
  let left = rtl ? r.right - w : r.left - 4;
  left = Math.min(Math.max(pad, left), vw - pad - w);
  el.style.top = `${Math.round(down ? r.bottom + gap : r.top - gap - fit)}px`;
  el.style.left = `${Math.round(left)}px`;
  if (h > fit) el.style.maxHeight = `${fit}px`;
  el.dataset.side = down ? "bottom" : "top";
}

/* ---------- Icons ---------- */

const isHugeIcon = (icon: unknown): icon is HugeIcon =>
  Array.isArray(icon) && icon.length > 0 && icon.every((part) => Array.isArray(part) && typeof part[0] === "string");

/** Draws a Hugeicons icon object as an inline SVG; anything else is shown as it is */
function Glyph({ icon }: { icon: ReactNode | HugeIcon }) {
  if (!isHugeIcon(icon)) return <>{icon}</>;
  return (
    <svg viewBox="0 0 24 24" fill="none" focusable="false">
      {icon.map(([tag, { key, ...attrs }], i) => createElement(tag, { ...attrs, key: String(key ?? i) }))}
    </svg>
  );
}

/* Icons: Hugeicons Free (MIT, © Hugeicons, hugeicons.com) */
function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d="M9 6s6 4.42 6 6-6 6-6 6" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true">
      <path d="M6 12.5V12m12 .5V12m-6 .5V12m-5 .5a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm12 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" />
    </svg>
  );
}
function NestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d="M19 15h-7c-3.77 0-5.66 0-6.83-1.17C4 12.66 4 10.77 4 7V4" />
      <path d="M15 20s5-3.68 5-5-5-5-5-5" />
    </svg>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-bcr (see Theming in the docs) */
.ui-bcr {
  --ui-bcr-ink: var(--aui-ink, #171717);
  --ui-bcr-muted: var(--aui-muted, #737373);
  --ui-bcr-faint: var(--aui-placeholder, #c4c4c4);
  --ui-bcr-wash: #f0f0f0;
  --ui-bcr-surface: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-bcr-text: var(--aui-ink, #262626);
  --ui-bcr-icon: var(--aui-muted, #8f8f8f);
  --ui-bcr-glow: #f4f4f5;
  --ui-bcr-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.18), 0 4px 12px -4px rgba(0, 0, 0, 0.06));
  --ui-bcr-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-bcr-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-bcr-radius: calc(var(--aui-radius-sm, 5px) + 1px);

  display: block;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  font-weight: 400;
  color: var(--ui-bcr-muted);
  -webkit-font-smoothing: antialiased;
}
.ui-bcr *, .ui-bcr *::before, .ui-bcr *::after { box-sizing: border-box; }

/* One line; the crumbs shorten before anything wraps */
.ui-bcr__list {
  display: flex;
  align-items: center;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  white-space: nowrap;
}
/* The other crumbs keep their names (each capped at 200px, and folded into … when the row is short); only the
   current page shortens to fit */
.ui-bcr__item { display: flex; flex: none; align-items: center; min-width: 0; }
.ui-bcr__item[data-current] { flex: 0 1 auto; }

.ui-bcr__sep {
  display: grid;
  flex: none;
  place-items: center;
  min-width: 20px;
  padding: 0 2px;
  color: var(--ui-bcr-faint);
  user-select: none;
}
.ui-bcr__sep > svg { display: block; width: 14px; height: 14px; }
.ui-bcr__sep > svg:dir(rtl) { transform: scaleX(-1); }

/* The links: quiet text that turns to ink on hover */
.ui-bcr__link,
.ui-bcr__current {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--ui-bcr-radius);
  background: none;
  font: inherit;
  color: inherit;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.ui-bcr__link { cursor: pointer; transition: color 120ms ease; }
.ui-bcr__link[data-static] { cursor: default; }
.ui-bcr__link:not([data-static]):hover { color: var(--ui-bcr-ink); }
.ui-bcr__link:focus-visible,
.ui-bcr__more:focus-visible { outline: 2px solid var(--ui-bcr-focus); outline-offset: 2px; }
.ui-bcr__current { font-weight: 500; color: var(--ui-bcr-ink); cursor: default; animation: ui-bcr-in 260ms var(--ui-bcr-ease) both; }

/* Long names shorten with … – the full one on hover */
.ui-bcr__label { min-width: 0; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-bcr__current .ui-bcr__label { max-width: none; }
.ui-bcr__icon { display: grid; flex: none; place-items: center; width: 14px; height: 14px; }
.ui-bcr__icon > svg, .ui-bcr__icon > img { display: block; width: 14px; height: 14px; }

/* The … for the folded crumbs */
.ui-bcr__more {
  position: relative;
  display: grid;
  flex: none;
  place-items: center;
  width: 26px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--ui-bcr-radius);
  background: none;
  color: var(--ui-bcr-muted);
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, color 120ms ease;
}
.ui-bcr__more:hover, .ui-bcr__more[aria-expanded="true"] { background: var(--ui-bcr-wash); color: var(--ui-bcr-ink); }
.ui-bcr__more > svg { display: block; width: 16px; height: 16px; }

/* The menu with the folded crumbs: the Dropdown Menu's card in the top layer */
.ui-bcr__menu {
  position: fixed;
  inset: auto;
  z-index: 1000;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  gap: 1px;
  box-sizing: border-box;
  min-width: 180px;
  max-width: min(320px, calc(100vw - 16px));
  max-height: calc(100vh - 16px);
  margin: 0;
  padding: 5px;
  border: 0;
  border-radius: calc(var(--aui-radius-lg, 10px) + 4px);
  background: var(--ui-bcr-surface);
  box-shadow: var(--ui-bcr-shadow);
  color: var(--ui-bcr-text);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-font-smoothing: antialiased;
  transform-origin: top left;
  animation: ui-bcr-menu 220ms var(--ui-bcr-ease) both;
}
.ui-bcr__menu::backdrop { display: none; }
.ui-bcr__menu[data-side="top"] { transform-origin: bottom left; animation-name: ui-bcr-menu-up; }
.ui-bcr__menu-item {
  display: flex;
  align-items: center;
  gap: 9px;
  box-sizing: border-box;
  min-width: 0;
  min-height: 34px;
  margin: 0;
  padding: 0 10px 0 calc(10px + var(--depth, 0) * 12px);
  border: 0;
  border-radius: calc(var(--aui-radius-sm, 5px) + 4px);
  background: none;
  font: inherit;
  color: inherit;
  text-align: start;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 120ms ease, color 120ms ease;
}
.ui-bcr__menu-item:hover:not([aria-disabled]), .ui-bcr__menu-item:focus { background: var(--ui-bcr-glow); color: var(--ui-bcr-ink); outline: none; }
.ui-bcr__menu-item:focus-visible { outline: 2px solid var(--ui-bcr-focus); outline-offset: -2px; }
.ui-bcr__menu-item[aria-disabled] { cursor: default; }
.ui-bcr__menu-icon { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-bcr-icon); }
.ui-bcr__menu-icon > svg, .ui-bcr__menu-icon > img { display: block; width: 16px; height: 16px; }
.ui-bcr__menu-icon > svg:dir(rtl) { transform: scaleX(-1); }
.ui-bcr__menu-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

@keyframes ui-bcr-in { from { opacity: 0; transform: translateX(-4px); } }
@keyframes ui-bcr-menu { from { opacity: 0; transform: scale(0.96) translateY(-4px); } }
@keyframes ui-bcr-menu-up { from { opacity: 0; transform: scale(0.96) translateY(4px); } }

/* Touch screens: crumbs and rows a finger can hit, without moving the text */
@media (pointer: coarse) {
  .ui-bcr__link:not([data-static]) { position: relative; }
  .ui-bcr__link:not([data-static])::after { content: ""; position: absolute; inset: -10px -4px; }
  .ui-bcr__more::after { content: ""; position: absolute; inset: -8px -6px; }
  .ui-bcr__menu-item { min-height: 42px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-bcr__current, .ui-bcr__menu { animation: none; }
  .ui-bcr__link, .ui-bcr__more, .ui-bcr__menu-item { transition-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-bcr {
  --ui-bcr-ink: var(--aui-ink, #ededed);
  --ui-bcr-muted: var(--aui-muted, #8f8f8f);
  --ui-bcr-faint: var(--aui-placeholder, #52525b);
  --ui-bcr-wash: rgba(255, 255, 255, 0.06);
  --ui-bcr-surface: var(--aui-overlay, var(--aui-surface, #19191b));
  --ui-bcr-text: var(--aui-ink, #e4e4e7);
  --ui-bcr-icon: var(--aui-muted, #8b8b92);
  --ui-bcr-glow: #26262a;
  --ui-bcr-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.6));
  --ui-bcr-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
