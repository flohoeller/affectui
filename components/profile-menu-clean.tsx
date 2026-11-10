"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/*
 * Profile Menu (Clean) – an account card with the signed-in user, menu actions and profile setup progress, in a single self-contained file.
 * Clean style: no tray – one white menu card with hairline shadows; the setup progress is its last row under a hairline.
 * The styles are injected below, so no extra files are needed.
 */

export type ProfileMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Small pill on the right, e.g. "New" */
  badge?: string;
  onSelect?: () => void;
};

export type ProfileSetup = {
  /** Steps finished so far */
  done: number;
  total: number;
  /** The next open step, shown as a shortcut under the bar */
  next?: string;
  onContinue?: () => void;
};

export type ProfileMenuProps = {
  name: string;
  email: string;
  /** Replaces the default avatar */
  avatar?: ReactNode;
  items?: ProfileMenuItem[];
  /** Profile setup progress under the actions – leave empty to hide */
  setup?: ProfileSetup;
  className?: string;
};

// Counts get separators; anything that isn't a finite number reads as 0
const count = new Intl.NumberFormat("en");
const finite = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : 0);

export function ProfileMenu({
  name,
  email,
  avatar,
  items = defaultItems,
  setup,
  className,
}: ProfileMenuProps) {
  const listRef = useRef<HTMLDivElement>(null);
  // Gaps in the list are skipped, an image that fails to load falls back to the default avatar
  const list = (Array.isArray(items) ? items : []).filter((item): item is ProfileMenuItem => !!item && typeof item === "object");
  const [broken, setBroken] = useState(false);
  const shownName = typeof name === "string" ? name.trim() : "";
  // The progress bar fills up once the card is on screen
  const [filled, setFilled] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setFilled(true), io.disconnect()), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Arrow keys move between the actions, like in a native menu
  const onKey = (e: KeyboardEvent) => {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === "ArrowDown" ? (i + 1) % buttons.length
      : e.key === "ArrowUp" ? (i - 1 + buttons.length) % buttons.length
      : e.key === "Home" ? 0
      : e.key === "End" ? buttons.length - 1
      : null;
    if (next === null) return;
    e.preventDefault();
    buttons[next]?.focus();
  };

  return (
    <>
      <style href="ui-profile-menu-clean" precedence="default">
        {css}
      </style>
      <section ref={rootRef} className={["ui-pmc", className].filter(Boolean).join(" ")} data-filled={filled || undefined}>
        <div className="ui-pmc__card">
        <header className="ui-pmc__user">
          <span className="ui-pmc__avatar" onErrorCapture={() => setBroken(true)}>
            {avatar && !broken ? avatar : <DefaultAvatar />}
          </span>
          <span className="ui-pmc__who">
            {shownName && (
              <span className="ui-pmc__name" dir="auto" title={shownName}>
                {shownName}
              </span>
            )}
            <span className="ui-pmc__email" dir="auto" title={email}>
              {email}
            </span>
          </span>
        </header>

        <div ref={listRef} className="ui-pmc__items" role="menu" aria-label="Account" onKeyDown={onKey}>
          {list.map((item, i) => (
            <button key={`${item.id}-${i}`} type="button" role="menuitem" className="ui-pmc__item" onClick={item.onSelect}>
              <span className="ui-pmc__icon">{item.icon}</span>
              <span className="ui-pmc__label" dir="auto" title={item.label}>
                {item.label}
              </span>
              {item.badge && (
                <span className="ui-pmc__badge" dir="auto" title={item.badge}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {setup && <SetupProgress {...setup} />}
        </div>
      </section>
    </>
  );
}

/** Compact setup progress as the last row of the card: count, bar and the next step on one line */
function SetupProgress({ done: rawDone, total: rawTotal, next, onContinue }: ProfileSetup) {
  const total = Math.max(0, finite(rawTotal));
  const done = Math.min(total, Math.max(0, finite(rawDone)));
  const ratio = total > 0 ? done / total : 0;
  const percent = Math.round(ratio * 100);
  const open = next && done < total;
  return (
    <div className="ui-pmc__setup">
      <div className="ui-pmc__setup-head">
        <span className="ui-pmc__setup-title">Profile setup</span>
        <span className="ui-pmc__setup-count">
          {count.format(done)}/{count.format(total)}
        </span>
      </div>
      <span
        className="ui-pmc__track"
        role="progressbar"
        aria-label="Profile setup"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span className="ui-pmc__fill" style={{ transform: `scaleX(${ratio})` }} />
      </span>
      {open && (
        <button type="button" className="ui-pmc__next" onClick={onContinue}>
          <span className="ui-pmc__next-label" dir="auto" title={next}>
            <span className="ui-pmc__next-hint">Next:</span> {next}
          </span>
          <ArrowIcon />
        </button>
      )}
    </div>
  );
}

/* ---------- Icons ---------- */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const SettingsIcon = () => (
  <Svg>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const LanguageIcon = () => (
  <Svg>
    <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
  </Svg>
);

export const DocsIcon = () => (
  <Svg>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8" />
  </Svg>
);

export const AppsIcon = () => (
  <Svg>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <path d="M17.5 3v7M14 6.5h7" />
  </Svg>
);

export const LogoutIcon = () => (
  <Svg>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);

/** Default avatar: a person icon centered on a soft blue disc */
const DefaultAvatar = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="20" fill="currentColor" opacity="0.1" />
    <circle cx="20" cy="16" r="4.75" fill="currentColor" />
    <path d="M11.5 28.25c.9-4 4.3-6.75 8.5-6.75s7.6 2.75 8.5 6.75c.15.7-.4 1.25-1.1 1.25H12.6c-.7 0-1.25-.55-1.1-1.25Z" fill="currentColor" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const defaultItems: ProfileMenuItem[] = [
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  { id: "docs", label: "Docs", icon: <DocsIcon /> },
  { id: "apps", label: "Apps", icon: <AppsIcon />, badge: "New" },
  { id: "logout", label: "Logout", icon: <LogoutIcon /> },
];

/* ---------- Styles ---------- */

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-pmc */
.ui-pmc {
  --ui-pmc-card: var(--aui-overlay, #ffffff);
  --ui-pmc-strong: var(--aui-ink, #000000);
  --ui-pmc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-pmc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-pmc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-pmc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.27));
  --ui-pmc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-pmc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-pmc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-pmc-hover: var(--aui-subtle, rgba(0, 0, 0, 0.06));
  --ui-pmc-track: rgba(0, 0, 0, 0.06);
  --ui-pmc-accent: rgba(0, 96, 226, 0.765);
  --ui-pmc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-pmc-badge: #e12a1d;
  --ui-pmc-badge-wash: color-mix(in srgb, var(--aui-red, #f04438) 8%, transparent);
  /* Strokes are shadows: a 0.5px hairline plus a soft lift, like a popover */
  --ui-pmc-shadow: var(--aui-shadow-popover, 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 12px 28px -10px rgba(0, 0, 0, 0.16), 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  --ui-pmc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  container-type: inline-size;
  width: 100%;
  max-width: 260px;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  color: var(--ui-pmc-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-pmc *, .ui-pmc *::before, .ui-pmc *::after { box-sizing: border-box; }
:where(.ui-pmc) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; text-align: left; cursor: pointer; }
:where(.ui-pmc) svg { display: block; flex: none; }

/* One white menu card – the edge is a shadow, not a border */
.ui-pmc__card {
  padding: 4px;
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--ui-pmc-card);
  box-shadow: var(--ui-pmc-shadow);
}

/* The signed-in user, separated from the actions by a hairline */
.ui-pmc__user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 -4px 4px;
  padding: 8px 12px 10px;
  border-bottom: 0.5px solid var(--ui-pmc-line);
}
.ui-pmc__avatar {
  flex: none;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
  color: var(--ui-pmc-accent);
}
.ui-pmc__avatar > * { display: block; width: 100%; height: 100%; object-fit: cover; }
.ui-pmc__who { display: grid; min-width: 0; }
.ui-pmc__name {
  overflow: hidden;
  font-weight: 500;
  color: var(--ui-pmc-strong);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ui-pmc__email {
  overflow: hidden;
  font-size: 12px;
  line-height: 16px;
  color: var(--ui-pmc-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Actions: quiet rows, a subtle fill on hover that fades out again */
/* The column may shrink, so long labels shorten instead of widening the card; a long list scrolls */
.ui-pmc__items { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; max-height: 320px; overflow-y: auto; overscroll-behavior: contain; }
.ui-pmc__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  color: var(--ui-pmc-ink);
  transition: background-color 140ms ease;
}
.ui-pmc__item:hover { background: var(--ui-pmc-hover); transition-duration: 60ms; }
.ui-pmc__item:focus-visible { background: var(--ui-pmc-hover); outline: none; }
.ui-pmc__item:active { background: rgba(0, 0, 0, 0.08); }

.ui-pmc__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--ui-pmc-icon);
  transition: color 140ms ease;
}
.ui-pmc__icon svg { width: 16px; height: 16px; }
.ui-pmc__icon svg * { vector-effect: non-scaling-stroke; }
.ui-pmc__item:hover .ui-pmc__icon,
.ui-pmc__item:focus-visible .ui-pmc__icon { color: var(--ui-pmc-ink); }

.ui-pmc__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ui-pmc__badge {
  flex: none;
  max-width: 50%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 6px;
  border-radius: var(--aui-radius-sm, 5px);
  background: var(--ui-pmc-badge-wash);
  font-size: 11px;
  font-weight: 500;
  line-height: 18px;
  color: var(--ui-pmc-badge);
}

/* Profile setup: the last row of the card, under a hairline */
.ui-pmc__setup {
  margin: 4px -4px -4px;
  padding: 10px 12px 12px;
  border-top: 0.5px solid var(--ui-pmc-line);
}
.ui-pmc__setup:has(.ui-pmc__next) { padding-bottom: 6px; }
.ui-pmc__setup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  line-height: 16px;
}
.ui-pmc__setup-title { color: var(--ui-pmc-text); font-weight: 500; }
.ui-pmc__setup-count { font-variant-numeric: tabular-nums; color: var(--ui-pmc-muted); }
.ui-pmc__track {
  display: block;
  height: 4px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--ui-pmc-track);
}
.ui-pmc__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--ui-pmc-accent);
  transform-origin: left center;
  scale: 0 1;
  transition: scale 900ms var(--ui-pmc-ease) 150ms;
}
.ui-pmc[data-filled] .ui-pmc__fill { scale: 1 1; }
.ui-pmc__next {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% + 16px);
  height: 28px;
  margin: 6px -8px 0;
  padding: 0 8px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  color: var(--ui-pmc-ink);
  transition: background-color 140ms ease;
}
.ui-pmc__next:hover { background: var(--ui-pmc-wash); }
.ui-pmc__next:focus-visible { outline: 2px solid var(--ui-pmc-focus); outline-offset: 2px; }
.ui-pmc__next-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ui-pmc__next-hint { color: var(--ui-pmc-muted); }
.ui-pmc__next svg {
  width: 16px;
  height: 16px;
  color: var(--ui-pmc-icon);
  transition: transform 200ms var(--ui-pmc-ease), color 140ms ease;
}
.ui-pmc__next svg * { vector-effect: non-scaling-stroke; }
.ui-pmc__next:hover svg { transform: translateX(2px); color: var(--ui-pmc-ink); }

/* Touch screens: taller rows */
@media (hover: none) and (pointer: coarse) {
  .ui-pmc__item { height: 40px; }
  .ui-pmc__next { height: 36px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-pmc__item, .ui-pmc__icon, .ui-pmc__fill, .ui-pmc__next, .ui-pmc__next svg { transition: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-pmc {
  --ui-pmc-card: var(--aui-overlay, #1c1c1e);
  --ui-pmc-strong: var(--aui-ink, #ffffff);
  --ui-pmc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-pmc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-pmc-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-pmc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.3));
  --ui-pmc-icon: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-pmc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-pmc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-pmc-hover: var(--aui-subtle, rgba(255, 255, 255, 0.08));
  --ui-pmc-track: rgba(255, 255, 255, 0.1);
  --ui-pmc-accent: var(--aui-blue, #4fb0fe);
  --ui-pmc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  --ui-pmc-badge: var(--aui-danger, #ff8a7a);
  --ui-pmc-badge-wash: color-mix(in srgb, var(--aui-red, #ff6b5f) 14%, transparent);
  --ui-pmc-shadow: var(--aui-shadow-popover, 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px rgba(0, 0, 0, 0.4));
}
:where(.dark, [data-theme="dark"]) .ui-pmc__item:active { background: rgba(255, 255, 255, 0.1); }
`;
