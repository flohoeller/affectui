"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/*
 * Tree View – a nested list of folders and files, or any hierarchy, in a single self-contained file.
 * A chevron opens and closes a branch, which grows and shrinks in height; thin guides show which level a row is on.
 * One row can be selected (onSelect). Follows the WAI-ARIA tree pattern: one tab stop, ↑ ↓ move, → opens or goes to
 * the first child, ← closes or goes to the parent, Home / End, * opens every sibling, and typing a name jumps to it.
 * The open branches can be controlled (expanded + onExpandedChange) or left to the tree (defaultExpanded).
 * 32px rows with soft gray glyphs; the selected row gets a gray fill and a firmer name.
 * The styles are injected below, so no extra files are needed.
 */

export type TreeNode = {
  /** Unique in the whole tree */
  id: string;
  /** The name – one line, long ones end in … with the full name on hover; also what typing jumps to */
  label: string;
  /** A glyph before the name, e.g. a folder or file icon (16px) */
  icon?: ReactNode;
  /** A glyph for while the branch is open, e.g. an open folder – falls back to icon */
  openIcon?: ReactNode;
  /** Quiet text at the end of the row, e.g. a count or a size */
  meta?: ReactNode;
  disabled?: boolean;
  /** Its children – any list (even an empty one) makes it a branch that opens and closes */
  children?: TreeNode[];
};

export type TreeViewProps = {
  items: TreeNode[];
  /** Controlled: the ids of the open branches */
  expanded?: string[];
  /** Uncontrolled: the branches open at the start */
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Controlled: the id of the selected row, or null for none */
  selected?: string | null;
  /** Uncontrolled: the row selected at the start */
  defaultSelected?: string | null;
  /** A row was picked – by a click, Enter or Space */
  onSelect?: (id: string, node: TreeNode) => void;
  /** Thin vertical lines that show each level – on by default */
  guides?: boolean;
  /** Shown inside an open branch without children */
  emptyText?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

/** A node with what the tree works out about it once: its level, parent, place among its siblings */
type Entry = { node: TreeNode; id: string; n: number; depth: number; parent: string | null; pos: number; size: number; kids: Entry[] | null };

export function TreeView({
  items,
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  selected: selectedProp,
  defaultSelected = null,
  onSelect,
  guides = true,
  emptyText = "Empty",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: TreeViewProps) {
  const uid = useId();
  const root = useRef<HTMLUListElement>(null);
  const els = useRef(new Map<string, HTMLLIElement>());

  // Gaps and repeated ids drop out – one id, one row (and no endless loop if a node holds itself)
  const { roots, byId } = useMemo(() => normalize(items), [items]);

  const [innerOpen, setInnerOpen] = useState<string[]>(() => (Array.isArray(defaultExpanded) ? defaultExpanded : []));
  const openList = expandedProp !== undefined ? (Array.isArray(expandedProp) ? expandedProp : []) : innerOpen;
  const open = useMemo(() => new Set(openList.map(String)), [openList]);

  const [innerSel, setInnerSel] = useState<string | null>(defaultSelected);
  const selected = selectedProp !== undefined ? selectedProp : innerSel;

  const [focused, setFocused] = useState<string | null>(null);
  // Branches that were open once keep their rows, so closing (and opening again) can animate
  const seen = useRef(new Set<string>());

  // The rows you can see, top to bottom
  const visible = useMemo(() => {
    const out: Entry[] = [];
    const walk = (list: Entry[]) => {
      for (const e of list) {
        out.push(e);
        if (e.kids && open.has(e.id)) walk(e.kids);
      }
    };
    walk(roots);
    return out;
  }, [roots, open]);
  const nav = visible.filter((e) => !e.node.disabled);

  const setOpen = (id: string, to: boolean) => {
    if (open.has(id) === to) return;
    const next = to ? [...openList, id] : openList.filter((x) => String(x) !== id);
    if (expandedProp === undefined) setInnerOpen(next);
    onExpandedChange?.(next);
  };
  const openMany = (ids: string[]) => {
    const add = ids.filter((id) => !open.has(id));
    if (!add.length) return;
    const next = [...openList, ...add];
    if (expandedProp === undefined) setInnerOpen(next);
    onExpandedChange?.(next);
  };
  const select = (e: Entry) => {
    if (e.node.disabled) return;
    if (selectedProp === undefined) setInnerSel(e.id);
    onSelect?.(e.id, e.node);
  };
  const focusId = (id: string | undefined) => {
    if (id) els.current.get(id)?.focus();
  };

  // One tab stop: the row last focused, else the selected one, else the first
  const stop = (nav.find((e) => e.id === focused) ?? nav.find((e) => e.id === selected) ?? nav[0])?.id;

  // A branch closed around the focused row (e.g. from outside): the focus moves up to the nearest row still shown
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    if (!active || !root.current?.contains(active) || active.getAttribute("role") !== "treeitem") return;
    let id: string | null | undefined = active.dataset.id;
    const shown = new Set(visible.map((e) => e.id));
    if (id && shown.has(id)) return;
    while (id && !shown.has(id)) id = byId.get(id)?.parent;
    if (id) focusId(id);
  }, [visible, byId]);

  // Typing a name jumps to the next row that starts with it
  const typed = useRef({ text: "", at: 0 });
  const typeAhead = (key: string, from: number) => {
    const now = Date.now();
    const t = typed.current;
    t.text = now - t.at > 700 ? key : t.text + key;
    t.at = now;
    const q = t.text.toLocaleLowerCase();
    // The same letter again and again steps through the rows with that letter
    const same = [...q].every((c) => c === q[0]);
    const needle = same ? q[0] : q;
    const start = same ? from + 1 : from;
    for (let k = 0; k < nav.length; k++) {
      const e = nav[(start + k + nav.length) % nav.length];
      if (String(e.node.label ?? "").trimStart().toLocaleLowerCase().startsWith(needle)) return focusId(e.id);
    }
  };

  const onKeyDown = (ev: KeyboardEvent<HTMLUListElement>) => {
    const el = ev.target as HTMLElement;
    if (el.getAttribute("role") !== "treeitem" || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const e = byId.get(el.dataset.id ?? "");
    if (!e) return;
    const at = nav.indexOf(e);
    // In right-to-left pages → closes and ← opens
    const rtl = root.current ? getComputedStyle(root.current).direction === "rtl" : false;
    const inward = rtl ? "ArrowLeft" : "ArrowRight";
    const outward = rtl ? "ArrowRight" : "ArrowLeft";
    const isOpen = e.kids !== null && open.has(e.id);
    let done = true;
    switch (ev.key) {
      case "ArrowDown":
        focusId(nav[at + 1]?.id);
        break;
      case "ArrowUp":
        focusId(at > 0 ? nav[at - 1].id : undefined);
        break;
      case "Home":
        focusId(nav[0]?.id);
        break;
      case "End":
        focusId(nav[nav.length - 1]?.id);
        break;
      case inward:
        if (e.kids && !e.node.disabled) {
          if (!isOpen) setOpen(e.id, true);
          else focusId(e.kids.find((k) => !k.node.disabled)?.id);
        }
        break;
      case outward:
        if (isOpen) setOpen(e.id, false);
        else focusId(e.parent ?? undefined);
        break;
      case "Enter":
        select(e);
        if (e.kids && !e.node.disabled) setOpen(e.id, !isOpen);
        break;
      case " ":
        select(e);
        break;
      case "*": {
        const siblings = e.parent ? byId.get(e.parent)?.kids ?? [] : roots;
        openMany(siblings.filter((s) => s.kids && !s.node.disabled).map((s) => s.id));
        break;
      }
      default:
        if (ev.key.length === 1 && /\S/.test(ev.key)) typeAhead(ev.key, at);
        else done = false;
    }
    if (done) ev.preventDefault();
  };

  const level = (list: Entry[]): ReactNode =>
    list.map((e) => {
      const branch = e.kids !== null;
      const isOpen = branch && open.has(e.id);
      if (isOpen) seen.current.add(e.id);
      const disabled = !!e.node.disabled;
      const labelId = `${uid}-l${e.n}`;
      const metaId = `${uid}-m${e.n}`;
      const icon = isOpen && e.node.openIcon != null ? e.node.openIcon : e.node.icon;
      return (
        <li
          key={e.id}
          ref={(el) => {
            if (el) els.current.set(e.id, el);
            else els.current.delete(e.id);
          }}
          role="treeitem"
          className="ui-tv__item"
          data-id={e.id}
          aria-level={e.depth + 1}
          aria-posinset={e.pos}
          aria-setsize={e.size}
          aria-expanded={branch ? isOpen : undefined}
          aria-selected={e.id === selected}
          aria-disabled={disabled || undefined}
          aria-labelledby={labelId}
          aria-describedby={e.node.meta != null ? metaId : undefined}
          tabIndex={e.id === stop ? 0 : -1}
          onFocus={(ev) => {
            if (ev.target === ev.currentTarget) setFocused(e.id);
          }}
        >
          <div
            className="ui-tv__row"
            style={{ ["--ui-tv-d" as string]: e.depth }}
            // A disabled row takes no focus from a press – the focus stays where it was
            onMouseDown={disabled ? (ev) => ev.preventDefault() : undefined}
            onClick={() => {
              if (disabled) return;
              select(e);
              if (branch) setOpen(e.id, !isOpen);
            }}
          >
            <span
              className="ui-tv__chev"
              aria-hidden="true"
              onClick={
                branch
                  ? (ev) => {
                      // The chevron only opens and closes – it doesn't select
                      ev.stopPropagation();
                      if (!disabled) setOpen(e.id, !isOpen);
                    }
                  : undefined
              }
            >
              {branch && <Chevron />}
            </span>
            {icon != null && (
              <span className="ui-tv__icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <span className="ui-tv__label" id={labelId} dir="auto" title={e.node.label}>
              {e.node.label}
            </span>
            {e.node.meta != null && (
              <span className="ui-tv__meta" id={metaId} dir="auto">
                {e.node.meta}
              </span>
            )}
          </div>
          {branch && (
            <div className="ui-tv__fold" data-open={isOpen || undefined}>
              <ul role="group" className="ui-tv__group" style={{ ["--ui-tv-d" as string]: e.depth + 1 }}>
                {(isOpen || seen.current.has(e.id)) &&
                  (e.kids!.length ? (
                    level(e.kids!)
                  ) : (
                    <li role="none" className="ui-tv__empty" style={{ ["--ui-tv-d" as string]: e.depth + 1 }}>
                      {emptyText}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </li>
      );
    });

  return (
    <ul
      ref={root}
      role="tree"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={["ui-tv", className].filter(Boolean).join(" ")}
      data-guides={guides || undefined}
      onKeyDown={onKeyDown}
    >
      {/* React 19 hoists this into <head> once, no matter how many trees render */}
      <style href="ui-tree-view" precedence="default">
        {css}
      </style>
      {level(roots)}
    </ul>
  );
}

function normalize(items: TreeNode[]) {
  const byId = new Map<string, Entry>();
  let n = 0;
  const walk = (list: unknown, depth: number, parent: string | null): Entry[] => {
    const out: Entry[] = [];
    for (const node of Array.isArray(list) ? (list as TreeNode[]) : []) {
      if (!node || node.id == null) continue;
      const id = String(node.id);
      if (byId.has(id)) continue;
      const e: Entry = { node, id, n: n++, depth, parent, pos: 0, size: 0, kids: null };
      byId.set(id, e);
      out.push(e);
    }
    out.forEach((e, i) => {
      e.pos = i + 1;
      e.size = out.length;
      e.kids = Array.isArray(e.node.children) ? walk(e.node.children, depth + 1, e.id) : null;
    });
    return out;
  };
  return { roots: walk(items, 0, null), byId };
}

/* Chevron – Hugeicons Free (MIT, © Hugeicons, hugeicons.com), ArrowRight01 */
const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 6c0 0 6 4.42 6 6s-6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-tv (see Theming in the docs) */
.ui-tv {
  --ui-tv-ink: var(--aui-ink, #171717);
  --ui-tv-text: var(--aui-ink, #262626);
  --ui-tv-icon: var(--aui-muted, #8f8f8f);
  --ui-tv-meta: var(--aui-muted, #8f8f8f);
  --ui-tv-faint: var(--aui-placeholder, #a3a3a3);
  --ui-tv-wash: #f4f4f5;
  --ui-tv-fill: #ededed;
  --ui-tv-guide: var(--aui-border, #ececec);
  --ui-tv-guide-on: #c8c8c8;
  --ui-tv-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-tv-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  /* Sizes: 32px rows, 18px per level */
  --ui-tv-h: 32px;
  --ui-tv-pad: 8px;
  --ui-tv-indent: 18px;
  --ui-tv-chev: 16px;
  --ui-tv-r: calc(var(--aui-radius-sm, 5px) + 3px);

  display: block;
  box-sizing: border-box;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  font-weight: 400;
  line-height: 20px;
  color: var(--ui-tv-text);
  -webkit-font-smoothing: antialiased;
}
.ui-tv *, .ui-tv *::before, .ui-tv *::after { box-sizing: border-box; }
.ui-tv__group { position: relative; min-height: 0; margin: 0; padding: 0; list-style: none; overflow: hidden; }
.ui-tv__item { display: block; margin: 0; padding: 0; }

/* A row: chevron, glyph, name, meta – one fixed height; deeper levels indent (at most to 45% of the width) */
.ui-tv__row {
  display: flex;
  align-items: center;
  gap: 5px;
  height: var(--ui-tv-h);
  padding-inline: calc(var(--ui-tv-pad) + min(var(--ui-tv-d, 0) * var(--ui-tv-indent), 45%)) var(--ui-tv-pad);
  overflow: hidden;
  border-radius: var(--ui-tv-r);
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 90ms ease;
}
.ui-tv__item[aria-selected="true"] > .ui-tv__row { background: var(--ui-tv-fill); color: var(--ui-tv-ink); }
.ui-tv__item[aria-selected="true"] > .ui-tv__row .ui-tv__label { font-weight: 500; }
@media (hover: hover) {
  .ui-tv__item:not([aria-selected="true"]):not([aria-disabled="true"]) > .ui-tv__row:hover { background: var(--ui-tv-wash); }
  .ui-tv__row:hover .ui-tv__chev { color: var(--ui-tv-meta); }
}
.ui-tv__item[aria-disabled="true"] > .ui-tv__row { opacity: 0.4; cursor: not-allowed; }

/* The ring sits on the row, inside it – never around the open branch below */
.ui-tv__item:focus { outline: none; }
.ui-tv__item:focus-visible > .ui-tv__row { outline: 2px solid var(--ui-tv-focus); outline-offset: -2px; }

.ui-tv__chev {
  display: grid;
  flex: none;
  place-items: center;
  width: var(--ui-tv-chev);
  height: var(--ui-tv-chev);
  color: var(--ui-tv-faint);
  transition: transform 200ms var(--ui-tv-ease), color 90ms ease;
}
.ui-tv__chev svg { display: block; width: 14px; height: 14px; }
.ui-tv__chev:dir(rtl) svg { transform: scaleX(-1); }
.ui-tv__item[aria-expanded="true"] > .ui-tv__row > .ui-tv__chev { transform: rotate(90deg); }
.ui-tv__item[aria-expanded="true"] > .ui-tv__row > .ui-tv__chev:dir(rtl) { transform: rotate(-90deg); }

.ui-tv__icon { display: grid; flex: none; place-items: center; width: 16px; height: 16px; margin-inline-end: 4px; overflow: hidden; color: var(--ui-tv-icon); }
.ui-tv__icon svg, .ui-tv__icon img { display: block; width: 100%; height: 100%; object-fit: contain; }
.ui-tv__item[aria-selected="true"] > .ui-tv__row .ui-tv__icon { color: var(--ui-tv-ink); }

/* Long names end in … – the full name on hover */
.ui-tv__label { flex: 1 1 auto; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ui-tv__meta {
  flex: none;
  max-width: 45%;
  margin-inline-start: 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12.5px;
  line-height: 16px;
  color: var(--ui-tv-meta);
  font-variant-numeric: tabular-nums;
}

/* A branch grows and shrinks in height; closed, its rows are hidden from the keyboard and screen readers too */
.ui-tv__fold {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
  transition: grid-template-rows 220ms var(--ui-tv-ease), visibility 0s linear 220ms;
}
.ui-tv__fold[data-open] { grid-template-rows: 1fr; visibility: visible; transition: grid-template-rows 220ms var(--ui-tv-ease), visibility 0s; }

/* Guides: a thin line under each open branch's chevron – darker where the selected row is */
.ui-tv[data-guides] .ui-tv__group::before {
  content: "";
  position: absolute;
  top: 2px;
  bottom: 2px;
  inset-inline-start: calc(var(--ui-tv-pad) + min((var(--ui-tv-d) - 1) * var(--ui-tv-indent), 45%) + var(--ui-tv-chev) / 2 - 0.5px);
  width: 1px;
  background: var(--ui-tv-guide);
  pointer-events: none;
  transition: background-color 160ms ease;
}
.ui-tv[data-guides] .ui-tv__group:has(> .ui-tv__item[aria-selected="true"])::before { background: var(--ui-tv-guide-on); }

.ui-tv__empty {
  display: flex;
  align-items: center;
  height: var(--ui-tv-h);
  padding-inline: calc(var(--ui-tv-pad) + min(var(--ui-tv-d, 0) * var(--ui-tv-indent), 45%) + var(--ui-tv-chev) + 5px) var(--ui-tv-pad);
  font-size: 12.5px;
  color: var(--ui-tv-faint);
  white-space: nowrap;
}

/* Touch screens: rows at least 40px tall */
@media (pointer: coarse) {
  .ui-tv { --ui-tv-h: 40px; --ui-tv-indent: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-tv__row, .ui-tv__chev, .ui-tv__fold, .ui-tv__fold[data-open], .ui-tv[data-guides] .ui-tv__group::before { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tv {
  --ui-tv-ink: var(--aui-ink, #ededed);
  --ui-tv-text: var(--aui-ink, #e4e4e7);
  --ui-tv-icon: var(--aui-muted, #8b8b92);
  --ui-tv-meta: var(--aui-muted, #8b8b92);
  --ui-tv-faint: var(--aui-placeholder, #5c5c63);
  --ui-tv-wash: rgba(255, 255, 255, 0.05);
  --ui-tv-fill: #26262a;
  --ui-tv-guide: var(--aui-border, #2a2a2e);
  --ui-tv-guide-on: #4a4a50;
  --ui-tv-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
