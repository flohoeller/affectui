"use client";

import { Children, isValidElement, type ComponentPropsWithRef, type ElementType, type ReactNode } from "react";

/*
 * Card – a single self-contained file.
 * A white card on a gray tray, like the classic items: a header with title, quiet line and an action, the content –
 * and a footer that sits on the tray below the card. It can be a whole click target (a link or button in its title
 * covers the card) and show that it is selected with a darker tray.
 * The styles are injected below, so no extra files are needed.
 */

type CardElement = "div" | "section" | "article" | "li";

export type CardProps = ComponentPropsWithRef<"div"> & {
  /** The element it renders as – section or article for a landmark-like card, li inside a list of cards */
  as?: CardElement;
  /**
   * The whole card is a click target: it lifts on hover, and a link or button in its title (CardHeader's title)
   * covers the card – other buttons inside stay clickable on their own
   */
  interactive?: boolean;
  /** Shown as picked: a darker tray and a firmer edge. Put aria-pressed or aria-current on the title's button or link */
  selected?: boolean;
};

export function Card({ as = "div", interactive, selected, className, children, ...rest }: CardProps) {
  const Tag = (["div", "section", "article", "li"].includes(as) ? as : "div") as ElementType;
  // The footer sits on the gray tray under the white card – everything else goes inside the card
  const items = Children.toArray(children);
  const isFoot = (c: unknown) => isValidElement(c) && c.type === CardFooter;
  const main = items.filter((c) => !isFoot(c));
  const foot = items.filter(isFoot);
  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many cards render */}
      <style href="ui-card" precedence="default">
        {css}
      </style>
      <Tag
        className={["ui-crd", className].filter(Boolean).join(" ")}
        data-interactive={interactive ? "" : undefined}
        data-selected={selected ? "" : undefined}
        {...rest}
      >
        {main.length > 0 && <div className="ui-crd__card">{main}</div>}
        {foot}
      </Tag>
    </>
  );
}

export type CardHeaderProps = Omit<ComponentPropsWithRef<"div">, "title"> & {
  /** The title – text, or a link / button that makes the whole card clickable when the Card is interactive */
  title?: ReactNode;
  /** A quiet line or two under the title */
  description?: ReactNode;
  /** Something small at the start: an icon, a logo, an agent's mark */
  icon?: ReactNode;
  /** Something at the end of the title line: an icon button, a menu, a badge */
  action?: ReactNode;
  /** The title's element – h3 by default; pick the level that fits the page's outline */
  titleAs?: "h2" | "h3" | "h4" | "p";
};

export function CardHeader({ title, description, icon, action, titleAs = "h3", className, children, ...rest }: CardHeaderProps) {
  const Title = (["h2", "h3", "h4", "p"].includes(titleAs) ? titleAs : "h3") as ElementType;
  const has = (n: ReactNode) => n != null && n !== false && n !== "";
  return (
    <div className={["ui-crd__head", className].filter(Boolean).join(" ")} {...rest}>
      {has(icon) && <span className="ui-crd__icon">{icon}</span>}
      <div className="ui-crd__titles">
        {has(title) && <Title className="ui-crd__title">{title}</Title>}
        {has(description) && <p className="ui-crd__desc">{description}</p>}
        {children}
      </div>
      {has(action) && <div className="ui-crd__action">{action}</div>}
    </div>
  );
}

export type CardContentProps = ComponentPropsWithRef<"div">;

export function CardContent({ className, ...rest }: CardContentProps) {
  return <div className={["ui-crd__body", className].filter(Boolean).join(" ")} {...rest} />;
}

export type CardFooterProps = ComponentPropsWithRef<"div">;

/** A row on the tray under the card: a status or meta on the start, buttons on the end (give the first button margin-inline-start: auto). Put it directly inside Card */
export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div className={["ui-crd__foot", className].filter(Boolean).join(" ")} {...rest} />;
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-crd (see Theming in the docs) */
.ui-crd {
  --ui-crd-tray: var(--aui-subtle, #f0f0f0);
  --ui-crd-tray-selected: #e6e6e6;
  --ui-crd-surface: var(--aui-surface, #ffffff);
  --ui-crd-strong: var(--aui-ink, #171717);
  --ui-crd-ink: var(--aui-ink, #404040);
  --ui-crd-muted: var(--aui-muted, #6b6b6b);
  --ui-crd-faint: #8f8f8f;
  --ui-crd-line: var(--aui-border, #ececec);
  --ui-crd-line-strong: var(--aui-border-strong, #d9d9d9);
  --ui-crd-shadow: var(--aui-shadow-card, 0 0 0 1px var(--ui-crd-line), 0 1px 2px rgba(0, 0, 0, 0.04));
  --ui-crd-shadow-hover: 0 0 0 1px var(--ui-crd-line-strong), 0 2px 6px -1px rgba(0, 0, 0, 0.08);
  --ui-crd-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-crd-radius: calc(var(--aui-radius-lg, 16px) + 4px);
  --ui-crd-pad: 16px;

  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  margin: 0;
  padding: 4px;
  border-radius: var(--ui-crd-radius);
  background: var(--ui-crd-tray);
  color: var(--ui-crd-ink);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  text-align: start;
  list-style: none;
  -webkit-font-smoothing: antialiased;
  transition: background-color 160ms ease;
}
.ui-crd *, .ui-crd *::before, .ui-crd *::after { box-sizing: border-box; }

/* The white card on the tray */
.ui-crd__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: var(--ui-crd-pad);
  border-radius: var(--aui-radius-lg, 16px);
  background: var(--ui-crd-surface);
  box-shadow: var(--ui-crd-shadow);
  transition: box-shadow 160ms ease;
}

/* ----- Header: icon · title and quiet line · action ----- */
.ui-crd__head { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
.ui-crd__icon { display: flex; flex: none; align-items: center; justify-content: center; min-width: 20px; min-height: 20px; color: var(--ui-crd-muted); }
.ui-crd__icon > svg { display: block; width: 16px; height: 16px; }
.ui-crd__titles { display: grid; flex: 1; gap: 2px; min-width: 0; }
.ui-crd__title { margin: 0; font-size: 14px; line-height: 20px; font-weight: 500; letter-spacing: -0.01em; color: var(--ui-crd-strong); overflow-wrap: anywhere; }
.ui-crd__desc { margin: 0; font-size: 13px; line-height: 20px; color: var(--ui-crd-muted); overflow-wrap: anywhere; }
/* The action sits on the title's line, centred on it – a 32px button reaches 6px above and below */
.ui-crd__action { display: flex; flex: none; align-items: center; gap: 4px; height: 20px; }

/* ----- Content ----- */
.ui-crd__body { min-width: 0; overflow-wrap: anywhere; }

/* ----- Footer on the tray: text lines up with the card's text, a 32px button sits 6px from the tray's edges ----- */
.ui-crd__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 40px;
  padding-block: 4px 0;
  padding-inline: var(--ui-crd-pad) 2px;
  font-size: 12.5px;
  line-height: 18px;
  color: var(--ui-crd-faint);
}
/* A footer alone, without a card above it */
.ui-crd__foot:first-child { padding-block: 0; }

/* ----- Interactive: the whole card is a click target ----- */
.ui-crd[data-interactive] { cursor: pointer; }
.ui-crd[data-interactive]:hover .ui-crd__card { box-shadow: var(--ui-crd-shadow-hover); }
/* The title's link or button reads like the title and stretches over the whole card */
.ui-crd[data-interactive] .ui-crd__title :is(a, button) {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: inherit;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.ui-crd[data-interactive] .ui-crd__title :is(a, button)::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: var(--ui-crd-radius);
}
/* Other controls in the card stay clickable above the stretched title */
.ui-crd[data-interactive] :is(a, button, input, select, textarea, label, summary, [tabindex]):not(.ui-crd__title *) {
  position: relative;
  z-index: 1;
}
/* The ring goes around the whole tray, not the title text */
.ui-crd[data-interactive] .ui-crd__title :is(a, button):focus-visible { outline: none; }
.ui-crd[data-interactive] .ui-crd__title :is(a, button):focus-visible::after {
  outline: 2px solid var(--ui-crd-focus);
  outline-offset: 2px;
}

/* ----- Selected: a darker tray and a firmer edge, no colored ring ----- */
.ui-crd[data-selected] { background: var(--ui-crd-tray-selected); }
.ui-crd[data-selected] .ui-crd__card { box-shadow: 0 0 0 1px var(--ui-crd-line-strong), 0 1px 2px rgba(0, 0, 0, 0.04); }

/* Touch screens: no hover lift that sticks after a tap */
@media (hover: none) {
  .ui-crd[data-interactive]:hover:not([data-selected]) .ui-crd__card { box-shadow: var(--ui-crd-shadow); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-crd, .ui-crd__card { transition: none; }
}
/* Windows high contrast: shadows are dropped – a border keeps the card's edge */
@media (forced-colors: active) {
  .ui-crd__card { border: 1px solid CanvasText; }
  .ui-crd[data-selected] { outline: 2px solid Highlight; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-crd {
  --ui-crd-tray: var(--aui-subtle, #111113);
  --ui-crd-tray-selected: #26262a;
  --ui-crd-surface: var(--aui-surface, #19191b);
  --ui-crd-strong: var(--aui-ink, #ededed);
  --ui-crd-ink: var(--aui-ink, #c8c8cc);
  --ui-crd-muted: var(--aui-muted, #a1a1a6);
  --ui-crd-faint: #8b8b92;
  --ui-crd-line: var(--aui-border, #2a2a2e);
  --ui-crd-line-strong: var(--aui-border-strong, #3a3a40);
  --ui-crd-shadow: var(--aui-shadow-card, 0 0 0 1px var(--ui-crd-line));
  --ui-crd-shadow-hover: 0 0 0 1px var(--ui-crd-line-strong), 0 2px 6px rgba(0, 0, 0, 0.4);
  --ui-crd-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
