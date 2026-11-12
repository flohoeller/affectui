"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";

/*
 * Dialog – a single self-contained file.
 * A modal window on a dimmed backdrop: a white card with a title, a quiet line, any content and a close ×, its actions
 * on the gray tray below.
 * It is a native <dialog> opened with showModal(), so it sits in the top layer, the page behind it is inert and the
 * browser keeps the focus inside. Escape and a press on the backdrop close it, the focus goes to the first control
 * (or one you pick) and back to what opened it, and the page under it stops scrolling. Long content scrolls inside
 * while the title and the actions stay put. On phones it becomes a sheet from the bottom.
 * AlertDialog, exported from the same file, asks to confirm one thing: no backdrop close, the focus on the safe
 * action, a red confirm button for things that can't be undone.
 * The styles are injected below, so no extra files are needed.
 */

type TriggerProps = {
  onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
  "aria-haspopup"?: "dialog";
  "aria-expanded"?: boolean;
};

type Shared = Omit<ComponentPropsWithoutRef<"dialog">, "title" | "open" | "children" | "onCancel" | "onClose"> & {
  /** Shows it – pass it with onOpenChange to control it, or leave it out and use trigger */
  open?: boolean;
  /** Open from the start when it isn't controlled */
  defaultOpen?: boolean;
  /** Called with false on Escape, a backdrop press, the × or an action – and with true from the trigger */
  onOpenChange?: (open: boolean) => void;
  /** A button that opens it – it gets the click, aria-haspopup and aria-expanded, and the focus back on close */
  trigger?: ReactElement<TriggerProps>;
  /** The heading – it also names the dialog */
  title: ReactNode;
  /** A quiet line under the title – read out with it */
  description?: ReactNode;
  /** sm: 400px · md: 480px · lg: 720px – never wider than the window */
  size?: "sm" | "md" | "lg";
  /** Any width instead of a size, e.g. 560 or "40rem" */
  width?: number | string;
  /** The control that gets the focus on open – by default the first one in the content, then in the footer */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Stays inside its nearest positioned parent (an app frame, a preview) instead of covering the window */
  contained?: boolean;
};

export type DialogProps = Shared & {
  /** The content – it scrolls when it is taller than the window */
  children?: ReactNode;
  /** The actions, aligned to the end – they stay in view while the content scrolls */
  footer?: ReactNode;
  /** A press on the backdrop closes it */
  closeOnBackdrop?: boolean;
  /** Shows the close × in the corner */
  closeButton?: boolean;
  /** The ×'s accessible name and tooltip */
  closeLabel?: string;
};

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  size = "md",
  width,
  initialFocus,
  contained,
  children,
  footer,
  closeOnBackdrop = true,
  closeButton = true,
  closeLabel = "Close",
  ...rest
}: DialogProps) {
  const [isOpen, setOpen, opener] = useOpenState(open, defaultOpen, onOpenChange);
  return (
    <>
      {withTrigger(trigger, isOpen, setOpen, opener)}
      <Layer
        {...rest}
        open={isOpen}
        onDismiss={() => setOpen(false)}
        title={title}
        description={description}
        size={size}
        width={width}
        initialFocus={initialFocus}
        contained={contained}
        closeOnBackdrop={closeOnBackdrop}
        opener={opener}
        close={closeButton ? { label: closeLabel, onClick: () => setOpen(false) } : undefined}
        footer={footer}
      >
        {children}
      </Layer>
    </>
  );
}

export type AlertDialogProps = Shared & {
  /** More than the description – a list of what goes, a checkbox */
  children?: ReactNode;
  /** The confirm button's label – say what happens, e.g. "Delete agent" */
  confirmLabel?: ReactNode;
  /** The safe button's label – it gets the focus */
  cancelLabel?: ReactNode;
  /** Confirmed – return a promise to keep it open with a busy button until it settles (it stays open if it fails) */
  onConfirm?: () => void | Promise<unknown>;
  /** Cancelled – by the button, Escape or the trigger again */
  onCancel?: () => void;
  /** A red confirm button – for things that can't be undone */
  danger?: boolean;
};

export function AlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  size = "sm",
  width,
  initialFocus,
  contained,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger,
  ...rest
}: AlertDialogProps) {
  const [isOpen, setOpen, opener] = useOpenState(open, defaultOpen, onOpenChange);
  const [busy, setBusy] = useState(false);
  const safe = useRef<HTMLButtonElement>(null);
  const cancel = () => {
    if (busy) return;
    onCancel?.();
    setOpen(false);
  };
  const confirm = async () => {
    if (busy) return;
    const result = onConfirm?.();
    if (!result || typeof (result as Promise<unknown>).then !== "function") return setOpen(false);
    setBusy(true);
    try {
      await result;
      setOpen(false);
    } catch {
      // Stays open, so it can be tried again
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {withTrigger(trigger, isOpen, setOpen, opener)}
      <Layer
        {...rest}
        alert
        open={isOpen}
        onDismiss={cancel}
        title={title}
        description={description}
        size={size}
        width={width}
        initialFocus={initialFocus ?? safe}
        contained={contained}
        closeOnBackdrop={false}
        busy={busy}
        opener={opener}
        footer={
          <>
            <button ref={safe} type="button" className="ui-dlg__btn" disabled={busy} onClick={cancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className="ui-dlg__btn"
              data-tone={danger ? "danger" : "primary"}
              data-busy={busy || undefined}
              aria-disabled={busy || undefined}
              onClick={confirm}
            >
              <span className="ui-dlg__btn-label">{confirmLabel}</span>
              {busy && <span className="ui-dlg__spin" aria-hidden="true" />}
            </button>
          </>
        }
      >
        {children}
      </Layer>
    </>
  );
}

/* ---------- The layer both build on ---------- */

type LayerProps = Omit<Shared, "defaultOpen" | "onOpenChange" | "trigger"> & {
  open: boolean;
  onDismiss: () => void;
  closeOnBackdrop: boolean;
  opener: RefObject<HTMLElement | null>;
  alert?: boolean;
  busy?: boolean;
  close?: { label: string; onClick: () => void };
  footer?: ReactNode;
  children?: ReactNode;
};

/** How long the way out takes – the backdrop and the card fade, a sheet slides down */
const EXIT_MS = 200;

function Layer({
  open,
  onDismiss,
  title,
  description,
  size = "md",
  width,
  initialFocus,
  contained,
  closeOnBackdrop,
  opener,
  alert,
  busy,
  close,
  footer,
  children,
  className,
  style,
  ...rest
}: LayerProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const layer = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  const blocked = useRef(busy);
  blocked.current = busy;
  // Contained and open from the first render (a demo, a restored view) leaves the focus where it is
  const firstOpen = useRef(open);

  // Shown while open and through the way out; a new open during the way out picks it up again
  const [shown, setShown] = useState(open);
  const [leaving, setLeaving] = useState(false);
  const [was, setWas] = useState(open);
  if (open !== was) {
    setWas(open);
    if (open) {
      setShown(true);
      setLeaving(false);
    } else if (shown) setLeaving(true);
  }
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => {
      setShown(false);
      setLeaving(false);
    }, reduced() ? 0 : EXIT_MS);
    return () => window.clearTimeout(t);
  }, [leaving]);

  // Open: into the top layer (or in place when contained), the page locked, the focus inside; closed: all undone
  useLayoutEffect(() => {
    const el = layer.current;
    if (!shown || !el) return;
    const back = opener.current ?? (document.activeElement as HTMLElement | null);
    opener.current = null;
    const modal = !contained;
    if (!el.open) {
      if (modal) el.showModal();
      else el.show();
    }
    if (modal) lockScroll();
    if (modal || !firstOpen.current) {
      const target =
        initialFocus?.current ??
        el.querySelector<HTMLElement>("[data-autofocus]") ??
        firstControl(el.querySelector(".ui-dlg__body")) ??
        firstControl(el.querySelector(".ui-dlg__foot")) ??
        firstControl(el) ??
        panel.current;
      target?.focus({ preventScroll: true });
    }
    firstOpen.current = false;

    // Escape: the native cancel when modal, a key listener when contained
    const cancel = (e: Event) => {
      e.preventDefault();
      if (!blocked.current) dismiss.current();
    };
    // Closed by the browser itself (a second Escape) – tell the owner; while busy it opens again
    const closed = () => {
      // A close from an earlier run of this effect (React re-runs it, e.g. in Strict Mode) lands while it's open again
      if (el.open) return;
      if (!blocked.current) return dismiss.current();
      if (modal) el.showModal();
      else el.show();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Keeps a page's own Escape (closing a detail view) from firing as well
        e.stopPropagation();
        if (!modal && !e.defaultPrevented) cancel(e);
      }
      if (e.key === "Tab" && !modal) trapTab(e, el);
    };
    el.addEventListener("cancel", cancel);
    el.addEventListener("close", closed);
    el.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("cancel", cancel);
      el.removeEventListener("close", closed);
      el.removeEventListener("keydown", key);
      const inside = el.contains(document.activeElement);
      if (el.open) el.close();
      if (modal) unlockScroll();
      const at = document.activeElement;
      if (back?.isConnected && (inside || !at || at === document.body)) back.focus({ preventScroll: true });
    };
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  // A press that starts and ends on the backdrop closes it; when it can't, the card gives a small nudge instead
  const downOnBackdrop = useRef(false);
  const onBackdrop = (e: ReactMouseEvent<HTMLDialogElement>) => {
    const hit = downOnBackdrop.current && e.target === e.currentTarget;
    downOnBackdrop.current = false;
    if (!hit || leaving) return;
    if (closeOnBackdrop && !busy) return dismiss.current();
    if (!reduced()) panel.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.012)" }, { transform: "scale(1)" }], { duration: 240, easing: "ease-out" });
  };

  if (!shown) return null;
  const panelStyle = width != null ? ({ "--ui-dlg-w": typeof width === "number" ? `${width}px` : width } as CSSProperties) : undefined;

  return (
    <dialog
      {...rest}
      ref={layer}
      className={["ui-dlg", className].filter(Boolean).join(" ")}
      style={style}
      role={alert ? "alertdialog" : rest.role}
      aria-modal={contained ? true : undefined}
      aria-labelledby={titleId}
      aria-describedby={shows(description) ? descId : rest["aria-describedby"]}
      aria-busy={busy || undefined}
      data-contained={contained || undefined}
      data-leaving={leaving || undefined}
      onPointerDown={(e) => (downOnBackdrop.current = e.target === e.currentTarget)}
      onClick={onBackdrop}
    >
      {/* React 19 hoists this into <head> once, no matter how many dialogs render */}
      <style href="ui-dialog" precedence="default">
        {css}
      </style>
      <div ref={panel} className="ui-dlg__panel" data-size={size} data-alert={alert || undefined} tabIndex={-1} style={panelStyle}>
        <div className="ui-dlg__card">
          <div className="ui-dlg__head">
            <div className="ui-dlg__heading">
              <h2 className="ui-dlg__title" id={titleId}>
                {title}
              </h2>
              {shows(description) && (
                <p className="ui-dlg__desc" id={descId}>
                  {description}
                </p>
              )}
            </div>
            {close && (
              <button type="button" className="ui-dlg__close" aria-label={close.label} title={close.label} onClick={close.onClick}>
                {/* Cancel01 – Hugeicons Free (MIT, © Hugeicons, hugeicons.com) */}
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                  <path d="M18 6L6.00081 17.9992M17.9992 18L6 6.00085" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          {shows(children) && <div className="ui-dlg__body">{children}</div>}
        </div>
        {shows(footer) && <div className="ui-dlg__foot">{footer}</div>}
      </div>
    </dialog>
  );
}

/* ---------- Helpers ---------- */

/** Controlled when open is passed, its own state otherwise; the third value remembers the trigger for the way back */
function useOpenState(open: boolean | undefined, defaultOpen: boolean | undefined, onOpenChange: ((open: boolean) => void) | undefined) {
  const [own, setOwn] = useState(defaultOpen ?? false);
  const opener = useRef<HTMLElement | null>(null);
  const controlled = open !== undefined;
  const value = controlled ? open : own;
  const set = (next: boolean) => {
    if (next === value) return;
    if (!controlled) setOwn(next);
    onOpenChange?.(next);
  };
  return [value, set, opener] as const;
}

/** The trigger with the click that opens it – it is remembered, so the focus comes back to it even in Safari */
function withTrigger(trigger: ReactElement<TriggerProps> | undefined, open: boolean, setOpen: (open: boolean) => void, opener: RefObject<HTMLElement | null>) {
  if (!isValidElement(trigger)) return null;
  return cloneElement(trigger, {
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    onClick: (e: ReactMouseEvent<HTMLElement>) => {
      trigger.props.onClick?.(e);
      if (e.defaultPrevented) return;
      opener.current = e.currentTarget;
      setOpen(true);
    },
  });
}

/** Text or an element – not true, false, null or an empty string */
const shows = (v: ReactNode) => v != null && typeof v !== "boolean" && v !== "";

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const FOCUSABLE = "input, textarea, select, button, [href], [tabindex], [contenteditable='true']";

/** The controls inside that are shown and reachable by Tab */
const controls = (root: Element | null) =>
  root
    ? [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled && el.getClientRects().length > 0,
      )
    : [];
const firstControl = (root: Element | null) => controls(root)[0] ?? null;

/** Contained: Tab and Shift+Tab go round inside, like the browser does for a modal */
function trapTab(e: KeyboardEvent, root: HTMLElement) {
  const list = controls(root);
  if (!list.length) return e.preventDefault();
  const first = list[0];
  const last = list[list.length - 1];
  const at = document.activeElement;
  const outside = !at || !list.includes(at as HTMLElement);
  if (e.shiftKey && (at === first || outside)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (at === last || outside)) {
    e.preventDefault();
    first.focus();
  }
}

/** The page stops scrolling while a dialog is open – counted, so stacked dialogs unlock only once the last closes */
let locks = 0;
let saved: { overflow: string; gutter: string } | null = null;
function lockScroll() {
  if (locks++ > 0) return;
  const html = document.documentElement;
  // The scrollbar's room is kept, so the page doesn't shift sideways
  const bar = window.innerWidth - html.clientWidth;
  saved = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
  html.style.overflow = "hidden";
  if (bar > 0) html.style.scrollbarGutter = "stable";
}
function unlockScroll() {
  if (--locks > 0 || !saved) return;
  locks = 0;
  const html = document.documentElement;
  html.style.overflow = saved.overflow;
  html.style.scrollbarGutter = saved.gutter;
  saved = null;
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-dlg (see Theming in the docs) */
.ui-dlg {
  --ui-dlg-scrim: rgba(0, 0, 0, 0.18);
  --ui-dlg-tray: var(--aui-subtle, #f0f0f0);
  --ui-dlg-surface: var(--aui-surface, #ffffff);
  --ui-dlg-strong: var(--aui-ink, #171717);
  --ui-dlg-ink: var(--aui-ink, #171717);
  --ui-dlg-text: var(--aui-muted, #6b6b6b);
  --ui-dlg-icon: var(--aui-muted, #737373);
  --ui-dlg-line: var(--aui-border, #ececec);
  --ui-dlg-wash: #f0f0f0;
  --ui-dlg-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(0, 0, 0, 0.04), 0 24px 56px -12px rgba(0, 0, 0, 0.28), 0 6px 16px -6px rgba(0, 0, 0, 0.08));
  --ui-dlg-btn: var(--aui-surface, #ffffff);
  --ui-dlg-btn-hover: #fafafa;
  --ui-dlg-btn-line: var(--aui-border, #e5e5e5);
  --ui-dlg-on-dark: #fafafa;
  --ui-dlg-dark-top: #323137;
  --ui-dlg-dark-bottom: #201e25;
  --ui-dlg-dark-hover-top: #3c3b42;
  --ui-dlg-dark-hover-bottom: #29272f;
  --ui-dlg-edge-top: #4b4951;
  --ui-dlg-edge-bottom: #18171b;
  --ui-dlg-ring: #0d0d0d;
  --ui-dlg-danger: var(--aui-danger, #c4320a);
  --ui-dlg-danger-bg: #ffe9e6;
  --ui-dlg-danger-bg-hover: #ffdcd6;
  --ui-dlg-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-dlg-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));

  /* The layer: the whole window (or its frame when contained), dimmed, the card in the middle */
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 24px 16px;
  border: 0;
  background: var(--ui-dlg-scrim);
  color: var(--ui-dlg-ink);
  overflow: hidden;
  overscroll-behavior: contain;
  container: ui-dlg / size;
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  font-weight: 400;
  letter-spacing: -0.006em;
  text-align: start;
  -webkit-font-smoothing: antialiased;
  animation: ui-dlg-scrim 180ms ease both;
}
.ui-dlg:not([open]) { display: none; }
.ui-dlg::backdrop { background: transparent; }
.ui-dlg[data-contained] { position: absolute; z-index: 70; }
.ui-dlg *, .ui-dlg *::before, .ui-dlg *::after { box-sizing: border-box; }

/* The gray tray: the white card on top, the actions on the tray below it */
.ui-dlg__panel {
  --ui-dlg-w: 480px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: var(--ui-dlg-w);
  max-width: 100%;
  max-height: 100%;
  min-height: 0;
  padding: 4px;
  border-radius: calc(var(--aui-radius-lg, 16px) + 4px);
  background: var(--ui-dlg-tray);
  box-shadow: var(--ui-dlg-shadow);
  animation: ui-dlg-in 260ms var(--ui-dlg-ease) both;
}
.ui-dlg__panel[data-size="sm"] { --ui-dlg-w: 400px; }
.ui-dlg__panel[data-size="lg"] { --ui-dlg-w: 720px; }
.ui-dlg__panel:focus { outline: none; }

/* The white card: header and content; the content scrolls, the header stays */
.ui-dlg__card {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  border-radius: var(--aui-radius-lg, 16px);
  background: var(--ui-dlg-surface);
  box-shadow: var(--aui-shadow-card, 0 0 0 1px var(--ui-dlg-line), 0 1px 2px rgba(0, 0, 0, 0.04));
  /* Normally only the content scrolls; when even the title doesn't fit (a short frame, a phone on its side) the card
     scrolls as a whole – the actions sit on the tray below it and stay in view */
  overflow: hidden auto;
}

/* Title and quiet line; the × sits on the title's first line */
.ui-dlg__head {
  display: flex;
  flex: none;
  align-items: flex-start;
  gap: 12px;
  padding-block: 18px 0;
  padding-inline: 20px 13px;
}
.ui-dlg__head:not(:has(.ui-dlg__close)) { padding-inline-end: 20px; }
.ui-dlg__head:last-child { padding-bottom: 20px; }
.ui-dlg__panel[data-alert] .ui-dlg__head { padding-top: 20px; }
.ui-dlg__heading { display: grid; flex: 1; gap: 4px; min-width: 0; }
.ui-dlg__title { margin: 0; font-size: 15px; line-height: 22px; font-weight: 500; letter-spacing: -0.01em; color: var(--ui-dlg-strong); overflow-wrap: anywhere; }
.ui-dlg__desc { margin: 0; color: var(--ui-dlg-text); overflow-wrap: anywhere; }

.ui-dlg__close {
  position: relative;
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  margin: -5px 0 0;
  padding: 0;
  border: 0;
  border-radius: calc(var(--aui-radius, 12px) - 2px);
  background: transparent;
  color: var(--ui-dlg-icon);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms var(--ui-dlg-ease);
}
.ui-dlg__close svg { display: block; width: 16px; height: 16px; }
.ui-dlg__close:hover { background: var(--ui-dlg-wash); color: var(--ui-dlg-ink); }
.ui-dlg__close:active { transform: scale(0.94); }

/*
 * The content scrolls under the fixed header. A hairline shows at the top once it is scrolled and at the bottom
 * while there is more – drawn by covers that scroll along with the content, so no script is needed
 */
.ui-dlg__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 12px 20px 20px;
  overflow: auto;
  overscroll-behavior: contain;
  overflow-wrap: anywhere;
  background:
    linear-gradient(var(--ui-dlg-surface) 0 0) top / 100% 2px no-repeat local,
    linear-gradient(var(--ui-dlg-surface) 0 0) bottom / 100% 2px no-repeat local,
    linear-gradient(var(--ui-dlg-line) 0 0) top / 100% 1px no-repeat scroll,
    linear-gradient(var(--ui-dlg-line) 0 0) bottom / 100% 1px no-repeat scroll,
    var(--ui-dlg-surface);
}

/* The actions on the tray, aligned to the end – as far from the card as from the tray's edge */
.ui-dlg__foot {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 4px 4px;
}

/* AlertDialog's own two buttons – the classic Button's secondary, dark gradient and red fill, at its small size */
.ui-dlg__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  padding: 0 12px;
  border: 1px solid var(--ui-dlg-btn-line);
  border-radius: calc(var(--aui-radius, 12px) - 2px);
  background: var(--ui-dlg-btn);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  color: var(--ui-dlg-ink);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 160ms ease, box-shadow 160ms ease, color 160ms ease, transform 160ms var(--ui-dlg-ease), opacity 160ms ease;
}
.ui-dlg__btn:hover:not(:disabled) { background: var(--ui-dlg-btn-hover); }
.ui-dlg__btn[data-tone="primary"] {
  border-color: transparent;
  background:
    linear-gradient(var(--ui-dlg-dark-top), var(--ui-dlg-dark-bottom)) padding-box,
    linear-gradient(var(--ui-dlg-edge-top), var(--ui-dlg-edge-bottom)) border-box;
  box-shadow: 0 0 0 1px var(--ui-dlg-ring), 0 2px 4px rgba(0, 0, 0, 0.1);
  color: var(--ui-dlg-on-dark);
}
.ui-dlg__btn[data-tone="primary"]:hover {
  background:
    linear-gradient(var(--ui-dlg-dark-hover-top), var(--ui-dlg-dark-hover-bottom)) padding-box,
    linear-gradient(var(--ui-dlg-edge-top), var(--ui-dlg-edge-bottom)) border-box;
}
.ui-dlg__btn[data-tone="danger"] { border-color: transparent; background: var(--ui-dlg-danger-bg); box-shadow: none; color: var(--ui-dlg-danger); }
.ui-dlg__btn[data-tone="danger"]:hover { background: var(--ui-dlg-danger-bg-hover); }
.ui-dlg__btn:active:not(:disabled):not([data-busy]) { transform: scale(0.97); }
.ui-dlg__btn:disabled { opacity: 0.4; cursor: default; }
.ui-dlg__btn-label { overflow: hidden; text-overflow: ellipsis; line-height: 20px; }
/* Busy: the label keeps the width, a small arc turns in its place */
.ui-dlg__btn[data-busy] { cursor: progress; }
.ui-dlg__btn[data-busy] .ui-dlg__btn-label { visibility: hidden; }
.ui-dlg__spin {
  position: absolute;
  inset: 0;
  width: 14px;
  height: 14px;
  margin: auto;
  border: 1.5px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: 50%;
  animation: ui-dlg-turn 700ms linear infinite;
}

.ui-dlg :is(.ui-dlg__close, .ui-dlg__btn):focus-visible {
  outline: 2px solid var(--ui-dlg-focus);
  outline-offset: 2px;
}

/* The way out: the backdrop fades, the card shrinks a little as it goes */
.ui-dlg[data-leaving] { pointer-events: none; animation: ui-dlg-scrim-out ${EXIT_MS}ms ease both; }
.ui-dlg[data-leaving] .ui-dlg__panel { animation: ui-dlg-out 150ms ease-in both; }

@keyframes ui-dlg-scrim { from { background-color: transparent; } }
@keyframes ui-dlg-scrim-out { to { background-color: transparent; } }
@keyframes ui-dlg-in { from { opacity: 0; transform: translateY(8px) scale(0.97); } }
@keyframes ui-dlg-out { to { opacity: 0; transform: scale(0.98); } }
@keyframes ui-dlg-sheet-in { from { transform: translateY(100%); } }
@keyframes ui-dlg-sheet-out { to { transform: translateY(100%); } }
@keyframes ui-dlg-turn { to { transform: rotate(1turn); } }

/*
 * Phones (or a narrow frame): a sheet from the bottom – full width, the actions within the thumb's reach and above
 * the home bar, the content scrolling under the title
 */
@container ui-dlg (max-width: 520px) {
  .ui-dlg__panel {
    /* Out over the layer's padding to the edges and the bottom; at least 40px of backdrop stay above it */
    width: calc(100% + 32px);
    max-width: none;
    max-height: calc(100% + 8px);
    margin: auto -16px -24px;
    padding-bottom: max(4px, env(safe-area-inset-bottom));
    border-end-start-radius: 0;
    border-end-end-radius: 0;
    animation: ui-dlg-sheet-in 320ms var(--ui-dlg-ease) both;
  }
  .ui-dlg__panel[data-alert] .ui-dlg__btn { flex: 1 1 0; }
  .ui-dlg[data-leaving] .ui-dlg__panel { animation: ui-dlg-sheet-out ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1) both; }
}

/* Touch screens: bigger targets – the look stays */
@media (pointer: coarse) {
  .ui-dlg__btn { height: 40px; padding: 0 16px; }
  .ui-dlg__close { width: 36px; height: 36px; margin: -7px -2px 0 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-dlg, .ui-dlg__panel, .ui-dlg[data-leaving], .ui-dlg[data-leaving] .ui-dlg__panel { animation-duration: 1ms; }
  .ui-dlg__spin { animation-duration: 1.6s; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-dlg {
  --ui-dlg-scrim: rgba(0, 0, 0, 0.5);
  --ui-dlg-tray: var(--aui-subtle, #111113);
  --ui-dlg-surface: var(--aui-surface, #19191b);
  --ui-dlg-strong: var(--aui-ink, #ededed);
  --ui-dlg-ink: var(--aui-ink, #ededed);
  --ui-dlg-text: var(--aui-muted, #a1a1a1);
  --ui-dlg-icon: var(--aui-muted, #8b8b92);
  --ui-dlg-line: var(--aui-border, #2a2a2e);
  --ui-dlg-wash: rgba(255, 255, 255, 0.06);
  --ui-dlg-shadow: var(--aui-shadow-popover, 0 0 0 1px rgba(255, 255, 255, 0.06), 0 24px 56px -12px rgba(0, 0, 0, 0.7));
  --ui-dlg-btn: #232326;
  --ui-dlg-btn-hover: #2a2a2d;
  --ui-dlg-btn-line: var(--aui-border, rgba(255, 255, 255, 0.1));
  /* The dark gradient turns light, like the Button's primary */
  --ui-dlg-on-dark: #121213;
  --ui-dlg-dark-top: #f4f4f5;
  --ui-dlg-dark-bottom: #e4e4e7;
  --ui-dlg-dark-hover-top: #ffffff;
  --ui-dlg-dark-hover-bottom: #ececef;
  --ui-dlg-edge-top: #ffffff;
  --ui-dlg-edge-bottom: #d4d4d8;
  --ui-dlg-ring: rgba(0, 0, 0, 0.6);
  --ui-dlg-danger: var(--aui-danger, #ff8a7a);
  --ui-dlg-danger-bg: rgba(255, 107, 95, 0.16);
  --ui-dlg-danger-bg-hover: rgba(255, 107, 95, 0.22);
  --ui-dlg-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  color-scheme: dark;
}
`;
