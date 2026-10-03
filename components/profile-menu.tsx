"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/*
 * Profile Menu – an account card with the signed-in user, menu actions and profile setup progress, in a single self-contained file.
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

export function ProfileMenu({
  name,
  email,
  avatar,
  items = defaultItems,
  setup,
  className,
}: ProfileMenuProps) {
  const listRef = useRef<HTMLDivElement>(null);
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
      <style href="ui-profile-menu" precedence="default">
        {css}
      </style>
      <section ref={rootRef} className={["ui-pm", className].filter(Boolean).join(" ")} data-filled={filled || undefined}>
        <div className="ui-pm__card">
        <header className="ui-pm__user">
          <span className="ui-pm__avatar">{avatar ?? <DefaultAvatar />}</span>
          <span className="ui-pm__who">
            <span className="ui-pm__name">{name}</span>
            <span className="ui-pm__email">{email}</span>
          </span>
        </header>

        <div ref={listRef} className="ui-pm__items" role="menu" aria-label="Account" onKeyDown={onKey}>
          {items.map((item) => (
            <button key={item.id} type="button" role="menuitem" className="ui-pm__item" onClick={item.onSelect}>
              <span className="ui-pm__icon">{item.icon}</span>
              <span className="ui-pm__label">{item.label}</span>
              {item.badge && <span className="ui-pm__badge">{item.badge}</span>}
            </button>
          ))}
        </div>

        </div>
        {setup && <SetupProgress {...setup} />}
      </section>
    </>
  );
}

/** Compact setup progress in the gray extension: count, bar and the next step on one line */
function SetupProgress({ done, total, next, onContinue }: ProfileSetup) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
  const percent = Math.round(ratio * 100);
  const open = next && done < total;
  return (
    <div className="ui-pm__setup">
      <div className="ui-pm__setup-head">
        <span className="ui-pm__setup-title">Profile setup</span>
        <span className="ui-pm__setup-count">
          {Math.min(done, total)}/{total}
        </span>
      </div>
      <span
        className="ui-pm__track"
        role="progressbar"
        aria-label="Profile setup"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span className="ui-pm__fill" style={{ transform: `scaleX(${ratio})` }} />
      </span>
      {open && (
        <button type="button" className="ui-pm__next" onClick={onContinue}>
          <span className="ui-pm__next-label">
            <span className="ui-pm__next-hint">Next:</span> {next}
          </span>
          <ArrowIcon />
        </button>
      )}
    </div>
  );
}

/* ---------- Icons ---------- */

const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
.ui-pm {
  --ui-pm-card: #ffffff;
  --ui-pm-line: #ececec;
  --ui-pm-ink: #171717;
  --ui-pm-text: #404040;
  --ui-pm-muted: #8f8f8f;
  --ui-pm-icon: #737373;
  --ui-pm-hover: #f5f5f5;
  --ui-pm-off: #f0f0f0;
  --ui-pm-fill: #2f6bff;
  --ui-pm-badge: #e11d48;
  --ui-pm-badge-wash: #fff0f3;
  --ui-pm-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --ui-pm-tray: #f0f0f0;
  box-sizing: border-box;
  width: 100%;
  max-width: 320px;
  /* Like the Chat Composer: the white menu card sits on a gray tray, the setup progress lives in the tray below */
  background: var(--ui-pm-tray);
  border-radius: 20px;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ui-pm-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-pm *, .ui-pm *::before, .ui-pm *::after { box-sizing: border-box; }
.ui-pm__card {
  padding: 16px 8px 8px;
  background: var(--ui-pm-card);
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.ui-pm__user {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 10px 12px;
}
.ui-pm__avatar {
  flex: none;
  width: 42px;
  height: 42px;
  color: var(--ui-pm-fill);
}
.ui-pm__avatar > * { display: block; width: 100%; height: 100%; }
.ui-pm__who {
  display: grid;
  min-width: 0;
}
.ui-pm__name {
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}
.ui-pm__email {
  overflow: hidden;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-pm-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ui-pm__items {
  display: grid;
  gap: 2px;
}
.ui-pm__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: 12px;
}
.ui-pm__item {
  margin: 0;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
  color: var(--ui-pm-text);
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-pm__item:hover,
.ui-pm__item:focus-visible {
  background: var(--ui-pm-hover);
  color: var(--ui-pm-ink);
  outline: none;
}
.ui-pm__item:active { background: #efefef; }

.ui-pm__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 20px;
  height: 20px;
  color: var(--ui-pm-icon);
  transition: color 160ms ease;
}
.ui-pm__icon svg { width: 20px; height: 20px; }
.ui-pm__item:hover .ui-pm__icon,
.ui-pm__item:focus-visible .ui-pm__icon { color: var(--ui-pm-ink); }

.ui-pm__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ui-pm__badge {
  flex: none;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--ui-pm-badge-wash);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: var(--ui-pm-badge);
}

/* Profile setup in the gray extension – kept to two short lines and a bar */
.ui-pm__setup {
  padding: 10px 18px 12px;
}
.ui-pm__setup-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 13px;
  line-height: 18px;
}
.ui-pm__setup-title { color: var(--ui-pm-text); font-weight: 500; }
.ui-pm__setup-count {
  font-variant-numeric: tabular-nums;
  color: var(--ui-pm-muted);
}
.ui-pm__track {
  display: block;
  height: 4px;
  margin-top: 7px;
  overflow: hidden;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.07);
}
.ui-pm__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--ui-pm-fill);
  transform-origin: left center;
  scale: 0 1;
  transition: scale 900ms var(--ui-pm-ease) 150ms;
}
.ui-pm[data-filled] .ui-pm__fill { scale: 1 1; }
.ui-pm__next {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% + 16px);
  margin: 6px -8px 0;
  padding: 3px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font: inherit;
  text-align: left;
  color: var(--ui-pm-ink);
  cursor: pointer;
  transition: background-color 160ms ease;
}
.ui-pm__next:hover,
.ui-pm__next:focus-visible {
  background: rgba(0, 0, 0, 0.04);
  outline: none;
}
.ui-pm__next-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ui-pm__next-hint { color: var(--ui-pm-muted); }
.ui-pm__next svg {
  flex: none;
  width: 14px;
  height: 14px;
  color: var(--ui-pm-icon);
  transition: transform 200ms var(--ui-pm-ease), color 160ms ease;
}
.ui-pm__next:hover svg { transform: translateX(2px); color: var(--ui-pm-ink); }

@media (prefers-reduced-motion: reduce) {
  .ui-pm__item, .ui-pm__icon, .ui-pm__fill, .ui-pm__next, .ui-pm__next svg { transition: none; }
}
`;
