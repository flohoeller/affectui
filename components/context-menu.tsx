"use client";

import {
  cloneElement,
  createElement,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from "react";

/*
 * Context Menu – a single self-contained file.
 * The menu a right-click opens, right at the pointer: on a file, a row, a canvas or a whole list. A long press opens
 * it on touch screens, Shift F10 and the menu key from the focused element. Icons, a quiet second line, shortcuts,
 * dividers, red items, checks and submenus, one soft highlight that glides between the rows and type-ahead – the same
 * menu as the Dropdown Menu. It sits in the top layer, so no overflow cuts it, and opens to whichever side has room.
 * The styles are injected below, so no extra files are needed.
 */

/** An icon from Hugeicons (e.g. `import { Copy01Icon } from "@hugeicons/core-free-icons"`) – drawn inline */
export type HugeIcon = readonly (readonly [string, { readonly [key: string]: string | number }])[];

export type ContextMenuItem = {
  label: string;
  /** A second line in a lighter color */
  description?: string;
  /** A 16px glyph before the label: an inline SVG or a Hugeicons icon object */
  icon?: ReactNode | HugeIcon;
  /** A brand mark (Gmail, Slack …) in place of the icon, in its own colors */
  logo?: ReactNode;
  /** Shows a check – the item becomes a choice (true or false; leave it out for a plain action) */
  checked?: boolean;
  /** How a choice is announced: one of a set (radio, the default) or on/off on its own (checkbox) */
  type?: "radio" | "checkbox";
  /** Red text and icon, e.g. Delete */
  danger?: boolean;
  /** A keyboard shortcut on the right, e.g. "⌘C" – shown only, wire the keys up yourself */
  shortcut?: string;
  /** A line above this item, to group the ones after it */
  divider?: boolean;
  /** Shown, but can't be picked; the arrow keys skip it */
  disabled?: boolean;
  /** The menu stays open after a pick – for checkboxes you tick several of */
  keepOpen?: boolean;
  /** More items that open to the side on hover, →, Enter or Space */
  submenu?: ContextMenuItem[];
  onSelect?: () => void;
};

export type ContextMenuProps = {
  /** The area it opens on – exactly one element that takes a ref: a row, a card, a list, a canvas */
  children: ReactElement;
  /**
   * The items – or a function that builds them for the element under the pointer (or the focused one), so one menu
   * can cover a whole list: `(target) => target.closest("[data-file]") ? fileItems : listItems`. No items: the
   * browser's own menu shows
   */
  items: ContextMenuItem[] | ((target: HTMLElement) => ContextMenuItem[]);
  /** A small heading above the items – it also names the menu */
  title?: string;
  /** Names the menu when there is no title */
  "aria-label"?: string;
  /** Never opens – the browser's own menu shows */
  disabled?: boolean;
  /** Called when it opens (with the element it opened on) and when it closes – e.g. to mark the row it is about */
  onOpenChange?: (open: boolean, target: HTMLElement | null) => void;
  /** The menu's width – by default it fits its items (at least 168px) */
  width?: number | string;
  /** Classes on the menu panel */
  menuClassName?: string;
};

type At = { x: number; y: number; target: HTMLElement; back: HTMLElement | null; keyboard: boolean; n: number };

/** How long a finger rests before the menu opens, and how far it may drift meanwhile */
const PRESS = 500;
const SLOP = 10;

/** Shift F10 and the menu key open it from the keyboard */
const isMenuKey = (e: { key: string; shiftKey: boolean }) => e.key === "ContextMenu" || (e.shiftKey && e.key === "F10");

const FOCUSABLE = 'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

/** Text fields keep the browser's menu – paste, spelling, autofill */
const editable = (el: Element | null) => !!el?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');

export function ContextMenu({
  children,
  items,
  title,
  "aria-label": ariaLabel = "Actions",
  disabled,
  onOpenChange,
  width,
  menuClassName,
}: ContextMenuProps) {
  const uid = useId();
  const area = useRef<HTMLElement | null>(null);
  const [at, setAt] = useState<At | null>(null);
  const count = useRef(0);
  // The keyboard and a long press open it themselves – the browser's contextmenu event that may follow is swallowed
  const handled = useRef(0);
  const press = useRef<{ timer: number; x: number; y: number } | null>(null);
  const report = useRef(onOpenChange);
  report.current = onOpenChange;

  const build = (target: HTMLElement) => {
    const list = typeof items === "function" ? items(target) : items;
    return Array.isArray(list) ? list.filter(Boolean) : [];
  };

  const openAt = (x: number, y: number, target: HTMLElement, keyboard: boolean) => {
    if (disabled || !build(target).length) return false;
    const now = document.activeElement as HTMLElement | null;
    const root = area.current;
    // The focus comes back here when it closes: what had it inside the area, or the control that was clicked, or the area
    const hit = target.closest<HTMLElement>(FOCUSABLE);
    const back = now && root?.contains(now) ? now : hit && root?.contains(hit) ? hit : root && root.tabIndex >= 0 ? root : null;
    setAt({ x, y, target, back, keyboard, n: ++count.current });
    report.current?.(true, target);
    return true;
  };

  const close = (focusBack: boolean | "now") => {
    const back = at?.back ?? null;
    if (focusBack === "now") back?.focus({ preventScroll: true });
    setAt(null);
    report.current?.(false, null);
    if (focusBack === true) refocus(back);
  };

  useEffect(() => () => window.clearTimeout(press.current?.timer), []);
  const endPress = () => {
    window.clearTimeout(press.current?.timer);
    press.current = null;
  };

  if (!isValidElement(children)) return <>{children}</>;
  const own = children.props as Record<string, unknown> & { ref?: Ref<HTMLElement>; style?: CSSProperties };
  const call = (name: string, e: SyntheticEvent) => (own[name] as ((e: SyntheticEvent) => void) | undefined)?.(e);
  // The child's handler runs first; when it calls preventDefault, the menu leaves the event alone
  const wrap =
    <E extends SyntheticEvent>(name: string, mine: (e: E) => void) =>
    (e: E) => {
      call(name, e);
      if (!e.defaultPrevented) mine(e);
    };

  const area$ = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (el: HTMLElement | null) => {
      area.current = el;
      const r = own.ref;
      if (typeof r === "function") r(el);
      else if (r) (r as { current: HTMLElement | null }).current = el;
    },
    // No callout or magnifier on a long press (iOS) – the menu takes its place
    style: disabled ? own.style : { WebkitTouchCallout: "none", ...own.style },
    onContextMenu: wrap("onContextMenu", (e: ReactMouseEvent) => {
      if (Date.now() - handled.current < 600) return e.preventDefault();
      const target = e.target as HTMLElement;
      if (disabled || editable(target)) return;
      // Android sends its own contextmenu on a long press – the press timer then stands down
      const touch = !!press.current;
      endPress();
      if (openAt(e.clientX, e.clientY, target, false)) {
        e.preventDefault();
        if (touch) handled.current = Date.now();
      }
    }),
    onKeyDown: wrap("onKeyDown", (e: ReactKeyboardEvent) => {
      if (!isMenuKey(e) || disabled) return;
      const target = e.target as HTMLElement;
      if (editable(target)) return;
      // Opens at the focused element, a little in from its corner
      const r = target.getBoundingClientRect();
      const rtl = getComputedStyle(target).direction === "rtl";
      const x = rtl ? r.right - Math.min(12, r.width / 2) : r.left + Math.min(12, r.width / 2);
      if (openAt(x, r.top + Math.min(r.height, 26), target, true)) {
        e.preventDefault();
        handled.current = Date.now();
      }
    }),
    // A long press on a touch screen
    onPointerDown: wrap("onPointerDown", (e: ReactPointerEvent) => {
      endPress();
      if (e.pointerType !== "touch" || disabled || editable(e.target as Element)) return;
      const target = e.target as HTMLElement;
      const { clientX: x, clientY: y } = e;
      press.current = {
        x,
        y,
        timer: window.setTimeout(() => {
          press.current = null;
          if (openAt(x, y, target, false)) handled.current = Date.now();
        }, PRESS),
      };
    }),
    onPointerMove: wrap("onPointerMove", (e: ReactPointerEvent) => {
      const p = press.current;
      if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > SLOP) endPress();
    }),
    onPointerUp: wrap("onPointerUp", endPress),
    onPointerCancel: wrap("onPointerCancel", endPress),
    // The tap that ends a long press doesn't also press what is under the finger
    onClickCapture: (e: ReactMouseEvent) => {
      if (Date.now() - handled.current < 600) {
        e.preventDefault();
        e.stopPropagation();
      }
      call("onClickCapture", e);
    },
  });

  const list = at ? build(at.target) : [];

  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many menus render */}
      <style href="ui-context-menu" precedence="default">
        {css}
      </style>
      {area$}
      {at && list.length > 0 && (
        <MenuPanel
          key={at.n}
          id={`${uid}-menu`}
          at={at}
          items={list}
          title={title}
          label={ariaLabel}
          width={width}
          className={menuClassName}
          onClose={close}
        />
      )}
    </>
  );
}

/* ---------- The menu at the pointer ---------- */

function MenuPanel({
  id,
  at,
  items,
  title,
  label,
  width,
  className,
  onClose,
}: {
  id: string;
  at: At;
  items: ContextMenuItem[];
  title?: string;
  label: string;
  width?: number | string;
  className?: string;
  onClose: (focusBack: boolean | "now") => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const titleId = `${id}-title`;

  // Into the top layer at the pointer, before paint: its corner on the point, or turned to whichever side has room
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    showLayer(el);
    const rtl = getComputedStyle(at.target).direction === "rtl";
    const update = () => place(el, new DOMRect(at.x, at.y, 0, 0), "bottom", rtl ? "end" : "start", 0);
    update();
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      hideLayer(el);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The focus moves in: onto the menu after a pointer (nothing looks picked yet), onto the first item from the keyboard
  useEffect(() => {
    const menu = panel.current?.querySelector<HTMLElement>(":scope > .ui-ctx__list");
    if (!menu) return;
    if (!at.keyboard) return menu.focus({ preventScroll: true });
    focusRow(itemsOf(menu)[0] ?? menu);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // A press elsewhere, a scroll that moves the area, resizing or leaving the window closes it
  useEffect(() => {
    const inside = (t: EventTarget | null) => t instanceof Node && !!panel.current?.contains(t);
    const down = (e: PointerEvent) => !inside(e.target) && close.current(false);
    const scroll = (e: Event) => {
      const t = e.target;
      if (inside(t)) return;
      if (t === document || (t instanceof Node && t.contains(at.target))) close.current(false);
    };
    const away = () => close.current(false);
    document.addEventListener("pointerdown", down, true);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", away);
    window.addEventListener("blur", away);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", away);
      window.removeEventListener("blur", away);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // It sits beside the area in the tree – its clicks and right-clicks stop here instead of reaching the area's parents
  const stop = (e: SyntheticEvent) => e.stopPropagation();

  return (
    <div
      ref={panel}
      className={["ui-ctx", "ui-ctx__panel", className].filter(Boolean).join(" ")}
      popover="manual"
      style={width != null ? { width, maxWidth: "calc(100vw - 16px)" } : undefined}
      onClick={stop}
      onDoubleClick={stop}
      onPointerDown={stop}
      onMouseDown={stop}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {title && (
        <span className="ui-ctx__title" id={titleId}>
          {title}
        </span>
      )}
      <MenuLevel id={id} items={items} labelledBy={title ? titleId : undefined} label={title ? undefined : label} onPick={() => onClose(true)} onClose={onClose} />
    </div>
  );
}

/* ---------- One level of the menu: the root, or a submenu ---------- */

type LevelProps = {
  id: string;
  items: ContextMenuItem[];
  empty?: ReactNode;
  labelledBy?: string;
  label?: string;
  /** A pick that closes the whole menu */
  onPick: () => void;
  /** Escape at the root, Tab anywhere – the focus goes back to where it was */
  onClose: (focusBack: boolean | "now") => void;
  /** ← or Escape in a submenu: back to the item that opened it */
  onBack?: () => void;
};

function MenuLevel({ id, items, empty, labelledBy, label, onPick, onClose, onBack }: LevelProps) {
  const uid = useId();
  const list = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState<{ top: number; height: number; danger: boolean } | null>(null);
  const [sub, setSub] = useState<{ index: number; focus: boolean } | null>(null);
  const timer = useRef(0);
  /** What the timer will do: open the submenu of this index, or -1 to close the open one */
  const pending = useRef<number | null>(null);
  const typed = useRef({ text: "", at: 0 });

  useEffect(() => () => window.clearTimeout(timer.current), []);
  const stopTimer = () => {
    window.clearTimeout(timer.current);
    pending.current = null;
  };
  const later = (fn: () => void, ms: number, what: number) => {
    window.clearTimeout(timer.current);
    pending.current = what;
    timer.current = window.setTimeout(() => {
      pending.current = null;
      fn();
    }, ms);
  };

  const rowAt = (i: number) => list.current?.querySelector<HTMLElement>(`:scope > [data-index="${i}"]`) ?? null;
  const openSub = (index: number, focus: boolean) => {
    stopTimer();
    setSub((s) => (s?.index === index ? (focus ? { index, focus } : s) : { index, focus }));
    // Already open from a hover: the keyboard steps into it right away
    if (focus && sub?.index === index) focusRow(itemsOf(document.getElementById(`${uid}-sub`)?.querySelector(".ui-ctx__list") ?? null)[0]);
  };
  const back = () => {
    const at = sub?.index;
    setSub(null);
    if (at != null) focusRow(rowAt(at));
  };

  const activate = (i: number, keyboard: boolean) => {
    const item = items[i];
    if (!item || item.disabled) return;
    if (item.submenu) {
      if (!keyboard && sub?.index === i && !sub.focus) setSub(null);
      else openSub(i, keyboard);
      return;
    }
    item.onSelect?.();
    if (!item.keepOpen) onPick();
  };

  // Typing letters jumps to the next item that starts with them
  const typeahead = (key: string) => {
    const now = Date.now();
    typed.current.text = now - typed.current.at > 700 ? key : typed.current.text + key;
    typed.current.at = now;
    const q = typed.current.text.toLowerCase();
    const rows = itemsOf(list.current);
    const at = rows.indexOf(document.activeElement as HTMLElement);
    const from = q.length === 1 ? at + 1 : Math.max(at, 0);
    for (let k = 0; k < rows.length; k++) {
      const row = rows[(from + k) % rows.length];
      if ((items[Number(row.dataset.index)]?.label ?? "").toLowerCase().startsWith(q)) return focusRow(row);
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const rows = itemsOf(list.current);
    const at = rows.indexOf(document.activeElement as HTMLElement);
    const index = at >= 0 ? Number(rows[at].dataset.index) : -1;
    const item = index >= 0 ? items[index] : undefined;
    const stop = () => {
      e.preventDefault();
      e.stopPropagation();
    };
    const go = (i: number) => {
      stop();
      // Moving on from an item closes a submenu the pointer had opened
      if (sub) setSub(null);
      if (rows.length) focusRow(rows[(i + rows.length) % rows.length]);
    };
    switch (e.key) {
      case "ArrowDown":
        return go(at + 1);
      case "ArrowUp":
        return go(at < 0 ? -1 : at - 1);
      case "Home":
      case "PageUp":
        return go(0);
      case "End":
      case "PageDown":
        return go(-1);
      case "ArrowRight":
        if (item?.submenu) {
          stop();
          openSub(index, true);
        }
        return;
      case "ArrowLeft":
        if (onBack) {
          stop();
          onBack();
        }
        return;
      case "Escape":
        stop();
        return onBack ? onBack() : onClose("now");
      case "Enter":
      case " ":
        stop();
        if (e.key === " " && Date.now() - typed.current.at < 700) return typeahead(" ");
        return activate(index, true);
      case "Tab":
        // The focus goes back first, so Tab moves on from there
        return onClose("now");
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          stop();
          typeahead(e.key);
        }
    }
  };

  // The highlight follows the focused row – the pointer focuses the row it is on
  const onFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
    const row = e.target as HTMLElement;
    if (row === list.current || row.parentElement !== list.current) return setGlow(null);
    setGlow({ top: row.offsetTop, height: row.offsetHeight, danger: row.hasAttribute("data-danger") });
  };
  const onBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    const to = e.relatedTarget as HTMLElement | null;
    if (!to || to.parentElement !== list.current) setGlow(null);
  };

  const subItems = sub ? items[sub.index]?.submenu : undefined;

  return (
    <>
      <div
        ref={list}
        id={id}
        className="ui-ctx__list"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby={labelledBy}
        aria-label={label}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        onPointerLeave={() => {
          stopTimer();
          // The pointer left: the highlight goes, the keys start again from the menu
          if (list.current?.contains(document.activeElement) && document.activeElement !== list.current) list.current?.focus({ preventScroll: true });
        }}
      >
        {glow && <span className="ui-ctx__glow" aria-hidden="true" data-danger={glow.danger || undefined} style={{ transform: `translateY(${glow.top}px)`, height: glow.height }} />}
        {items.length === 0 && <span className="ui-ctx__empty">{empty}</span>}
        {items.map((item, i) => {
          const choice = item.checked !== undefined && !item.submenu;
          const role = !choice ? "menuitem" : item.type === "checkbox" ? "menuitemcheckbox" : "menuitemradio";
          const isOpen = sub?.index === i;
          return (
            <Fragment key={`${i}-${item.label}`}>
              {item.divider && i > 0 && <span className="ui-ctx__sep" role="separator" />}
              <div
                className="ui-ctx__item"
                role={role}
                tabIndex={-1}
                data-index={i}
                aria-checked={choice ? Boolean(item.checked) : undefined}
                aria-disabled={item.disabled || undefined}
                aria-haspopup={item.submenu ? "menu" : undefined}
                aria-expanded={item.submenu ? isOpen : undefined}
                aria-controls={item.submenu && isOpen ? `${uid}-sub-list` : undefined}
                data-danger={item.danger || undefined}
                data-rich={item.description ? "" : undefined}
                data-open={isOpen || undefined}
                onPointerDown={(e) => e.preventDefault()}
                onPointerMove={(e) => {
                  const row = e.currentTarget;
                  if (item.disabled) {
                    if (document.activeElement !== list.current) list.current?.focus({ preventScroll: true });
                    return;
                  }
                  if (document.activeElement !== row) row.focus({ preventScroll: true });
                  // Rest on an item with a submenu to open it; on another item the open one closes after a beat
                  if (item.submenu) {
                    if (isOpen) stopTimer();
                    else if (pending.current !== i) later(() => openSub(i, false), 90, i);
                  } else if (!sub) stopTimer();
                  else if (pending.current !== -1) later(() => setSub(null), 220, -1);
                }}
                onClick={(e) => activate(i, e.detail === 0)}
              >
                {(item.logo || item.icon) && (
                  <span className="ui-ctx__icon" data-logo={item.logo ? "" : undefined} aria-hidden="true">
                    {item.logo ?? <Glyph icon={item.icon} />}
                  </span>
                )}
                <span className="ui-ctx__label">
                  <span className="ui-ctx__text" title={item.label}>
                    {item.label}
                  </span>
                  {item.description && <span className="ui-ctx__desc" title={item.description}>{item.description}</span>}
                </span>
                {item.shortcut && <kbd className="ui-ctx__kbd">{item.shortcut}</kbd>}
                {item.submenu && (
                  <span className="ui-ctx__more" aria-hidden="true">
                    <ChevronIcon />
                  </span>
                )}
                {choice && (
                  <span className="ui-ctx__check" aria-hidden="true">
                    {item.checked && <CheckIcon />}
                  </span>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
      {sub && subItems && (
        <SubMenu
          id={`${uid}-sub`}
          listId={`${uid}-sub-list`}
          row={() => rowAt(sub.index)}
          items={subItems}
          focus={sub.focus}
          label={items[sub.index]?.label}
          onEnter={() => stopTimer()}
          onBack={back}
          onPick={onPick}
          onClose={onClose}
        />
      )}
    </>
  );
}

/** A submenu: its own small panel in the top layer, beside the item that opened it (or on the other side) */
function SubMenu({
  id,
  listId,
  row,
  items,
  focus,
  label,
  onEnter,
  onBack,
  onPick,
  onClose,
}: {
  id: string;
  listId: string;
  row: () => HTMLElement | null;
  items: ContextMenuItem[];
  focus: boolean;
  label?: string;
  onEnter: () => void;
  onBack: () => void;
  onPick: () => void;
  onClose: (focusBack: boolean | "now") => void;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    showLayer(el);
    const update = () => {
      const r = row()?.getBoundingClientRect();
      // Its first item lines up with the item that opened it: the panel's 4px padding sits above it
      if (r) place(el, new DOMRect(r.left - 4, r.top - 4, r.width + 8, r.height + 8), "right", "start", 4);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      hideLayer(el);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (focus) focusRow(itemsOf(panel.current?.querySelector(".ui-ctx__list") ?? null)[0]);
  }, [focus]);

  return (
    <div ref={panel} id={id} className="ui-ctx__panel" data-sub="" popover="manual" onPointerEnter={onEnter}>
      <MenuLevel id={listId} items={items} label={label} onPick={onPick} onClose={onClose} onBack={onBack} />
    </div>
  );
}

/* ---------- Helpers ---------- */

/** The rows of one level that can be focused – not separators, not disabled ones, not a submenu's */
const itemsOf = (menu: Element | null) =>
  menu ? [...menu.querySelectorAll<HTMLElement>(':scope > [role^="menuitem"]:not([aria-disabled="true"])')] : [];

function focusRow(row: HTMLElement | null | undefined) {
  if (!row) return;
  row.focus({ preventScroll: true });
  row.scrollIntoView?.({ block: "nearest" });
}

/** After a pick the menu is gone – the focus goes back to where it was, unless the pick moved it somewhere (a rename field) */
const refocus = (back: HTMLElement | null) =>
  window.setTimeout(() => {
    const at = document.activeElement;
    if (back?.isConnected && (!at || at === document.body)) back.focus({ preventScroll: true });
  });

/** The top layer, so no overflow cuts it and no z-index fights it */
function showLayer(el: HTMLElement) {
  if ("showPopover" in el && !el.matches(":popover-open")) el.showPopover();
}
function hideLayer(el: HTMLElement) {
  if ("hidePopover" in el && el.isConnected && el.matches(":popover-open")) el.hidePopover();
}

/**
 * Puts a fixed panel next to a rectangle: on the preferred side, or the other one when that has more room; the
 * edge it lines up with switches when it would stick out, and it is pushed inside the window as a last resort.
 * Too tall for the room it gets: it scrolls.
 */
function place(el: HTMLElement, r: DOMRect, side: "top" | "bottom" | "left" | "right", align: "start" | "end", gap: number) {
  const pad = 8;
  const vw = document.documentElement.clientWidth || window.innerWidth;
  const vh = window.innerHeight;
  el.style.maxHeight = "";
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const room = { bottom: vh - r.bottom - gap - pad, top: r.top - gap - pad, right: vw - r.right - gap - pad, left: r.left - gap - pad };
  const flip = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
  let s: keyof typeof room = side;
  let a = align;
  let top: number;
  let left: number;
  const vertical = s === "top" || s === "bottom";
  if (room[s] < (vertical ? h : w) && room[flip[s]] > room[s]) s = flip[s];
  if (!vertical && room[s] < w) {
    // No room beside it on a narrow screen: under the row, a little indented
    s = "bottom";
    top = r.bottom - 2;
    left = Math.min(Math.max(pad, r.left + 16), vw - pad - w);
    el.style.maxHeight = `${Math.max(120, vh - top - pad)}px`;
  } else if (s === "top" || s === "bottom") {
    const fit = Math.min(h, Math.max(120, room[s]));
    top = s === "bottom" ? r.bottom + gap : r.top - gap - fit;
    left = a === "start" ? r.left : r.right - w;
    if (a === "start" && left + w > vw - pad && r.right - w >= pad) (a = "end"), (left = r.right - w);
    else if (a === "end" && left < pad && r.left + w <= vw - pad) (a = "start"), (left = r.left);
    left = Math.min(Math.max(pad, left), vw - pad - w);
    if (h > fit) el.style.maxHeight = `${fit}px`;
  } else {
    left = s === "right" ? r.right + gap : r.left - gap - w;
    top = a === "start" ? r.top : r.bottom - h;
    if (top + h > vh - pad) top = Math.max(pad, vh - pad - h);
    if (top < pad) top = pad;
    if (h > vh - 2 * pad) el.style.maxHeight = `${vh - 2 * pad}px`;
  }
  el.style.top = `${Math.round(top)}px`;
  el.style.left = `${Math.round(left)}px`;
  el.dataset.side = s;
  el.dataset.align = a;
}

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6s6 4.42 6 6-6 6-6 6" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path className="ui-ctx__tick" d="M5 14 8.5 17.5 19 6.5" pathLength={1} />
    </svg>
  );
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-ctx (see Theming in the docs) */
.ui-ctx {
  --ui-ctx-surface: var(--aui-overlay, var(--aui-surface, #ffffff));
  --ui-ctx-ink: var(--aui-ink, #171717);
  --ui-ctx-text: var(--aui-ink, #262626);
  --ui-ctx-icon: var(--aui-muted, #8f8f8f);
  --ui-ctx-faint: var(--aui-placeholder, #a3a3a3);
  --ui-ctx-line: var(--aui-border, #ececec);
  --ui-ctx-glow: #f4f4f5;
  --ui-ctx-danger: var(--aui-danger, #d92d20);
  --ui-ctx-danger-glow: color-mix(in srgb, var(--aui-red, #f04438) 8%, transparent);
  --ui-ctx-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.18), 0 4px 12px -4px rgba(0, 0, 0, 0.06));
  --ui-ctx-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-ctx-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  --ui-ctx-radius: calc(var(--aui-radius-lg, 10px) + 4px);
  --ui-ctx-row-radius: calc(var(--aui-radius-sm, 5px) + 4px);
}

/* The menu: a white card in the top layer, a 1px edge and a deeper drop */
.ui-ctx__panel {
  position: fixed;
  inset: auto;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 180px;
  /* Fits its content up to 320px – long items shorten with … (full text on hover) instead of stretching it; the width prop lifts the cap */
  max-width: min(320px, calc(100vw - 16px));
  max-height: calc(100vh - 16px);
  margin: 0;
  padding: 5px;
  border: 0;
  border-radius: var(--ui-ctx-radius);
  background: var(--ui-ctx-surface);
  box-shadow: var(--ui-ctx-shadow);
  color: var(--ui-ctx-ink);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  font-weight: 400;
  text-align: start;
  overflow: visible;
  -webkit-font-smoothing: antialiased;
  transform-origin: top left;
  animation: ui-ctx-in 220ms var(--ui-ctx-ease) both;
}
.ui-ctx__panel::backdrop { display: none; }
.ui-ctx__panel[data-align="end"] { transform-origin: top right; }
.ui-ctx__panel[data-side="top"] { transform-origin: bottom left; animation-name: ui-ctx-in-up; }
.ui-ctx__panel[data-side="top"][data-align="end"] { transform-origin: bottom right; }
.ui-ctx__panel[data-side="right"] { transform-origin: top left; animation-name: ui-ctx-in-side; animation-duration: 160ms; }
.ui-ctx__panel[data-side="left"] { transform-origin: top right; animation-name: ui-ctx-in-side; animation-duration: 160ms; }

.ui-ctx__title { display: block; flex: none; padding: 7px 10px 5px; font-size: 12px; line-height: 16px; font-weight: 500; color: var(--ui-ctx-icon); }

/* The rows; a long menu scrolls inside the card */
.ui-ctx__list {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  gap: 1px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}
.ui-ctx__list:focus { outline: none; }

/* One soft highlight that glides between the rows */
.ui-ctx__glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  border-radius: var(--ui-ctx-row-radius);
  background: var(--ui-ctx-glow);
  pointer-events: none;
  transition: transform 180ms var(--ui-ctx-ease), height 180ms var(--ui-ctx-ease), background-color 120ms ease;
}
.ui-ctx__glow[data-danger] { background: var(--ui-ctx-danger-glow); }

.ui-ctx__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  box-sizing: border-box;
  min-width: 0;
  min-height: 34px;
  padding: 0 10px;
  border-radius: var(--ui-ctx-row-radius);
  color: var(--ui-ctx-text);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 120ms ease;
}
.ui-ctx__item[data-rich] { min-height: 46px; padding: 7px 10px; }
.ui-ctx__item:focus { outline: none; color: var(--ui-ctx-ink); }
.ui-ctx__item:focus-visible { outline: 2px solid var(--ui-ctx-focus); outline-offset: -2px; }
/* The item whose submenu is open keeps a highlight while the focus is in the submenu */
.ui-ctx__item[data-open] { color: var(--ui-ctx-ink); }
.ui-ctx__item[data-open]:not(:focus) { background: var(--ui-ctx-glow); }
.ui-ctx__item[aria-checked="true"] { color: var(--ui-ctx-ink); font-weight: 500; }
.ui-ctx__item[data-danger], .ui-ctx__item[data-danger]:focus { color: var(--ui-ctx-danger); }
.ui-ctx__item[aria-disabled="true"] { color: var(--ui-ctx-faint); cursor: default; }

.ui-ctx__icon { display: grid; flex: none; place-items: center; width: 16px; height: 16px; color: var(--ui-ctx-icon); transition: color 120ms ease; }
.ui-ctx__icon > svg { display: block; width: 16px; height: 16px; }
.ui-ctx__icon[data-logo] > svg, .ui-ctx__icon[data-logo] > img { width: 14px; height: 14px; }
.ui-ctx__item:focus .ui-ctx__icon:not([data-logo]), .ui-ctx__item[data-open] .ui-ctx__icon:not([data-logo]) { color: var(--ui-ctx-ink); }
.ui-ctx__item[data-danger] .ui-ctx__icon { color: var(--ui-ctx-danger); }
.ui-ctx__item[aria-disabled="true"] .ui-ctx__icon { opacity: 0.5; color: var(--ui-ctx-icon); }

/* Long names stay on one line – the full name on hover */
.ui-ctx__label { display: grid; flex: 1; gap: 1px; min-width: 0; }
.ui-ctx__text, .ui-ctx__desc { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ui-ctx__desc { font-size: 12.5px; line-height: 17px; font-weight: 400; color: var(--ui-ctx-icon); }

.ui-ctx__kbd { flex: none; padding-left: 16px; font: inherit; font-size: 12px; font-weight: 400; letter-spacing: 0.04em; color: var(--ui-ctx-faint); }
.ui-ctx__more, .ui-ctx__check { display: grid; flex: none; place-items: center; width: 14px; height: 14px; }
.ui-ctx__more { color: var(--ui-ctx-faint); }
.ui-ctx__check { color: var(--ui-ctx-ink); }
.ui-ctx__more > svg, .ui-ctx__check > svg { display: block; width: 14px; height: 14px; }
.ui-ctx__tick { stroke-dasharray: 1; animation: ui-ctx-draw 280ms 40ms var(--ui-ctx-ease) both; }

.ui-ctx__sep { display: block; height: 1px; margin: 5px 4px; background: var(--ui-ctx-line); }
.ui-ctx__empty { display: block; padding: 6px 8px; color: var(--ui-ctx-faint); }

@keyframes ui-ctx-in { from { opacity: 0; transform: scale(0.96) translateY(-4px); } }
@keyframes ui-ctx-in-up { from { opacity: 0; transform: scale(0.96) translateY(4px); } }
@keyframes ui-ctx-in-side { from { opacity: 0; transform: scale(0.98); } }
@keyframes ui-ctx-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }

/* Touch screens: rows a finger can hit */
@media (pointer: coarse) {
  .ui-ctx__item { min-height: 40px; }
  .ui-ctx__item[data-rich] { min-height: 48px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-ctx__panel, .ui-ctx__tick { animation-duration: 1ms; }
  .ui-ctx__glow, .ui-ctx__item, .ui-ctx__icon { transition-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-ctx {
  --ui-ctx-surface: var(--aui-overlay, var(--aui-surface, #19191b));
  --ui-ctx-ink: var(--aui-ink, #ededed);
  --ui-ctx-text: var(--aui-ink, #e4e4e7);
  --ui-ctx-icon: var(--aui-muted, #8b8b92);
  --ui-ctx-faint: var(--aui-placeholder, #5c5c63);
  --ui-ctx-line: var(--aui-border, #2a2a2e);
  --ui-ctx-glow: #26262a;
  --ui-ctx-danger: var(--aui-danger, #ff8a7a);
  --ui-ctx-danger-glow: color-mix(in srgb, var(--aui-red, #ff6b5f) 14%, transparent);
  --ui-ctx-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px -12px rgba(0, 0, 0, 0.6));
  --ui-ctx-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
