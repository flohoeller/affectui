"use client";

import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

/*
 * Card – a single self-contained file, clean style.
 * The white card every screen is built from: a 0.5px hairline and a soft drop, a header with title, quiet line and an
 * action, the content and a footer. It can be a whole click target (a link or button in its title covers the card)
 * and show that it is selected with a gray fill.
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
  /** Shown as picked: a gray fill and a firmer edge. Put aria-pressed or aria-current on the title's button or link */
  selected?: boolean;
};

export function Card({ as = "div", interactive, selected, className, children, ...rest }: CardProps) {
  const Tag = (["div", "section", "article", "li"].includes(as) ? as : "div") as ElementType;
  return (
    <>
      {/* React 19 hoists this into <head> once, no matter how many cards render */}
      <style href="ui-card-clean" precedence="default">
        {css}
      </style>
      <Tag
        className={["ui-crdc", className].filter(Boolean).join(" ")}
        data-interactive={interactive ? "" : undefined}
        data-selected={selected ? "" : undefined}
        {...rest}
      >
        {children}
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
    <div className={["ui-crdc__head", className].filter(Boolean).join(" ")} {...rest}>
      {has(icon) && <span className="ui-crdc__icon">{icon}</span>}
      <div className="ui-crdc__titles">
        {has(title) && <Title className="ui-crdc__title">{title}</Title>}
        {has(description) && <p className="ui-crdc__desc">{description}</p>}
        {children}
      </div>
      {has(action) && <div className="ui-crdc__action">{action}</div>}
    </div>
  );
}

export type CardContentProps = ComponentPropsWithRef<"div">;

export function CardContent({ className, ...rest }: CardContentProps) {
  return <div className={["ui-crdc__body", className].filter(Boolean).join(" ")} {...rest} />;
}

export type CardFooterProps = ComponentPropsWithRef<"div">;

/** A row at the bottom: a status or meta on the start, buttons on the end (give the first button margin-inline-start: auto) */
export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div className={["ui-crdc__foot", className].filter(Boolean).join(" ")} {...rest} />;
}

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors as variables – override them on .ui-crdc (see Theming in the docs) */
.ui-crdc {
  --ui-crdc-surface: var(--aui-surface, #ffffff);
  --ui-crdc-strong: var(--aui-ink, #000000);
  --ui-crdc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-crdc-muted: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-crdc-shadow: var(--aui-shadow-card, 0 0 0 0.5px var(--aui-border, rgba(0, 0, 0, 0.06)), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  --ui-crdc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(0, 0, 0, 0.1)), 0 2px 6px -1px rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-crdc-selected: color-mix(in srgb, var(--ui-crdc-ink) 3.5%, var(--ui-crdc-surface));
  --ui-crdc-shadow-selected: 0 0 0 0.5px var(--aui-border-strong, rgba(0, 0, 0, 0.14)), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-crdc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-crdc-radius: var(--aui-radius-lg, 10px);
  --ui-crdc-pad: 16px;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  min-width: 0;
  margin: 0;
  padding: var(--ui-crdc-pad);
  border-radius: var(--ui-crdc-radius);
  background: var(--ui-crdc-surface);
  box-shadow: var(--ui-crdc-shadow);
  color: var(--ui-crdc-ink);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  text-align: start;
  list-style: none;
  -webkit-font-smoothing: antialiased;
  transition: box-shadow 160ms ease, background-color 160ms ease;
}
.ui-crdc *, .ui-crdc *::before, .ui-crdc *::after { box-sizing: border-box; }

/* ----- Header: icon · title and quiet line · action ----- */
.ui-crdc__head { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
.ui-crdc__icon { display: flex; flex: none; align-items: center; justify-content: center; min-width: 20px; min-height: 20px; color: var(--ui-crdc-muted); }
/* A larger icon tile sits beside both lines; a 16px icon on the title's line */
.ui-crdc__icon > svg { display: block; width: 16px; height: 16px; }
.ui-crdc__titles { display: grid; flex: 1; gap: 2px; min-width: 0; }
.ui-crdc__title { margin: 0; font-size: 13px; line-height: 20px; font-weight: 500; letter-spacing: 0; color: var(--ui-crdc-strong); overflow-wrap: anywhere; }
.ui-crdc__desc { margin: 0; font-size: 13px; line-height: 20px; color: var(--ui-crdc-muted); overflow-wrap: anywhere; }
/* The action sits on the title's line, centred on it – a 28px button reaches 4px above and below */
.ui-crdc__action { display: flex; flex: none; align-items: center; gap: 4px; height: 20px; }

/* ----- Content and footer ----- */
.ui-crdc__body { min-width: 0; overflow-wrap: anywhere; }
.ui-crdc__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; min-height: 28px; font-size: 12px; line-height: 16px; color: var(--ui-crdc-muted); }

/* ----- Interactive: the whole card is a click target ----- */
.ui-crdc[data-interactive] { cursor: pointer; }
.ui-crdc[data-interactive]:hover { box-shadow: var(--ui-crdc-shadow-hover); }
/* The title's link or button reads like the title and stretches over the whole card */
.ui-crdc[data-interactive] .ui-crdc__title :is(a, button) {
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
.ui-crdc[data-interactive] .ui-crdc__title :is(a, button)::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: var(--ui-crdc-radius);
}
/* Other controls in the card stay clickable above the stretched title */
.ui-crdc[data-interactive] :is(a, button, input, select, textarea, label, summary, [tabindex]):not(.ui-crdc__title *) {
  position: relative;
  z-index: 1;
}
/* The ring goes around the whole card, not the title text */
.ui-crdc[data-interactive] .ui-crdc__title :is(a, button):focus-visible { outline: none; }
.ui-crdc[data-interactive] .ui-crdc__title :is(a, button):focus-visible::after {
  outline: 2px solid var(--ui-crdc-focus);
  outline-offset: 2px;
}

/* ----- Selected: a gray fill and a firmer edge, no colored ring ----- */
.ui-crdc[data-selected] { background: var(--ui-crdc-selected); box-shadow: var(--ui-crdc-shadow-selected); }
.ui-crdc[data-selected][data-interactive]:hover { box-shadow: var(--ui-crdc-shadow-selected); }

/* Touch screens: no hover lift that sticks after a tap */
@media (hover: none) {
  .ui-crdc[data-interactive]:hover:not([data-selected]) { box-shadow: var(--ui-crdc-shadow); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-crdc { transition: none; }
}
/* Windows high contrast: shadows are dropped – a border keeps the card's edge */
@media (forced-colors: active) {
  .ui-crdc { border: 1px solid CanvasText; }
  .ui-crdc[data-selected] { border: 2px solid Highlight; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-crdc {
  --ui-crdc-surface: var(--aui-surface, #1b1b1e);
  --ui-crdc-strong: var(--aui-ink, #ffffff);
  --ui-crdc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-crdc-muted: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-crdc-shadow: var(--aui-shadow-card, 0 0 0 0.5px var(--aui-border, rgba(255, 255, 255, 0.1)), 0 1px 2px rgba(0, 0, 0, 0.4));
  --ui-crdc-shadow-hover: 0 0 0 0.5px var(--aui-border-strong, rgba(255, 255, 255, 0.16)), 0 2px 6px rgba(0, 0, 0, 0.4);
  --ui-crdc-selected: color-mix(in srgb, var(--ui-crdc-ink) 6%, var(--ui-crdc-surface));
  --ui-crdc-shadow-selected: 0 0 0 0.5px var(--aui-border-strong, rgba(255, 255, 255, 0.2)), 0 1px 2px rgba(0, 0, 0, 0.4);
  --ui-crdc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
