"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

/*
 * Integration Settings – the settings card of one connected service, in a single self-contained file.
 * Switch it on and off, generate and copy an API key, set the site address with validation and pick a time zone.
 * Changes collect in a save bar. The styles are injected below, so no extra files are needed.
 */

export type IntegrationValues = { enabled: boolean; siteUrl: string; timeZone: string; apiKey: string | null };

export type IntegrationSettingsProps = {
  name: string;
  logo: ReactNode;
  /** Small number next to the name, e.g. synced orders */
  count?: number;
  /** Line under the name, e.g. when it was connected */
  meta?: string;
  defaultValues?: Partial<IntegrationValues>;
  /** Helper text under the address field */
  siteHint?: string;
  timeZones?: string[];
  /** Creates a key – return it, or a promise of it. Without it a random demo key is made */
  onGenerateKey?: () => string | Promise<string>;
  /** Called with all values when Save is pressed */
  onSave?: (values: IntegrationValues) => void | Promise<void>;
  onToggle?: (enabled: boolean) => void;
  className?: string;
};

const defaultZones = [
  "(GMT −08:00) Los Angeles",
  "(GMT −05:00) New York",
  "(GMT −03:00) São Paulo",
  "(GMT +00:00) London",
  "(GMT +01:00) Berlin",
  "(GMT +01:00) Amsterdam",
  "(GMT +01:00) Warsaw",
  "(GMT +02:00) Athens",
  "(GMT +04:00) Dubai",
  "(GMT +05:30) Mumbai",
  "(GMT +08:00) Singapore",
  "(GMT +09:00) Tokyo",
  "(GMT +10:00) Sydney",
];

const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
const clean = (v: string) => v.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");

export function IntegrationSettings({
  name,
  logo,
  count,
  meta,
  defaultValues,
  siteHint = "Your store's primary domain, without https://",
  timeZones = defaultZones,
  onGenerateKey,
  onSave,
  onToggle,
  className,
}: IntegrationSettingsProps) {
  const start: IntegrationValues = {
    enabled: true,
    siteUrl: "",
    timeZone: timeZones[0],
    apiKey: null,
    ...defaultValues,
  };
  const [saved, setSaved] = useState(start);
  const [values, setValues] = useState(start);
  const [keyState, setKeyState] = useState<"idle" | "busy">("idle");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const urlId = useId();
  const hintId = useId();

  const url = clean(values.siteUrl);
  const urlValid = url === "" || DOMAIN.test(url);
  const dirty = values.siteUrl !== saved.siteUrl || values.timeZone !== saved.timeZone || values.apiKey !== saved.apiKey;

  const set = (patch: Partial<IntegrationValues>) => setValues((v) => ({ ...v, ...patch }));

  const generate = async () => {
    if (keyState === "busy") return;
    setKeyState("busy");
    try {
      const key = await (onGenerateKey
        ? onGenerateKey()
        : new Promise<string>((r) =>
            setTimeout(
              () => r(`sk_live_${Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("")}`),
              700,
            ),
          ));
      set({ apiKey: key });
      setRevealed(true);
    } finally {
      setKeyState("idle");
    }
  };

  const copy = async () => {
    if (!values.apiKey) return;
    try {
      await navigator.clipboard.writeText(values.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard not available */
    }
  };

  const save = async () => {
    if (!urlValid || saving) return;
    setSaving(true);
    const next = { ...values, siteUrl: url };
    try {
      await onSave?.(next);
      setValues(next);
      setSaved(next);
    } finally {
      setSaving(false);
    }
  };

  const masked = values.apiKey ? `${values.apiKey.slice(0, 8)}${"•".repeat(14)}${values.apiKey.slice(-4)}` : "";

  return (
    <>
      <style href="ui-integration-settings" precedence="default">
        {css}
      </style>
      <section className={["ui-is", className].filter(Boolean).join(" ")} aria-label={`${name} settings`} data-off={!values.enabled || undefined}>
        <header className="ui-is__head">
          <span className="ui-is__logo">{logo}</span>
          <span className="ui-is__who">
            <span className="ui-is__name">
              {name}
              {count !== undefined && <span className="ui-is__count">{count.toLocaleString("en-US")}</span>}
            </span>
            <span className="ui-is__meta">{values.enabled ? meta : "Paused – no data is synced"}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={values.enabled}
            aria-label={`${name} sync`}
            className="ui-is__switch"
            onClick={() => {
              const enabled = !values.enabled;
              set({ enabled });
              setSaved((s) => ({ ...s, enabled }));
              onToggle?.(enabled);
            }}
          >
            <span />
          </button>
        </header>

        <div className="ui-is__fold" data-open={values.enabled || undefined} inert={!values.enabled}>
          <div className="ui-is__fold-inner">
            <div className="ui-is__card">
              <div className="ui-is__section">
                {values.apiKey ? (
                  <div className="ui-is__key" data-new={revealed || undefined}>
                    <code>{revealed ? values.apiKey : masked}</code>
                    <button type="button" className="ui-is__mini" aria-label={revealed ? "Hide key" : "Show key"} onClick={() => setRevealed((r) => !r)}>
                      <Icon d={revealed ? "M2 8s2.2-4.5 6-4.5S14 8 14 8s-2.2 4.5-6 4.5S2 8 2 8ZM2.5 2.5l11 11" : "M2 8s2.2-4.5 6-4.5S14 8 14 8s-2.2 4.5-6 4.5S2 8 2 8ZM8 9.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"} size={15} />
                    </button>
                    <button type="button" className="ui-is__mini" aria-label="Copy key" onClick={copy}>
                      <Icon d={copied ? "m3.5 8.5 3 3 6-7" : "M5.5 5.5V3.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M3.5 5.5h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z"} size={15} />
                    </button>
                    <button type="button" className="ui-is__regen" onClick={generate} disabled={keyState === "busy"}>
                      {keyState === "busy" ? <span className="ui-is__spinner" aria-hidden="true" /> : "Regenerate"}
                    </button>
                  </div>
                ) : (
                  <button type="button" className="ui-is__generate" onClick={generate} disabled={keyState === "busy"}>
                    <span>{keyState === "busy" ? "Generating…" : "Generate a new API key"}</span>
                    {keyState === "busy" ? <span className="ui-is__spinner" aria-hidden="true" /> : <KeyIcon />}
                  </button>
                )}
                {values.apiKey && revealed && (
                  <p className="ui-is__note" role="status">
                    {copied ? "Copied to the clipboard." : "Copy it now – it is shown in full only once."}
                  </p>
                )}
              </div>

              <div className="ui-is__section">
                <label className="ui-is__label" htmlFor={urlId}>
                  Site address
                </label>
                <div className="ui-is__field" data-invalid={!urlValid || undefined}>
                  <span className="ui-is__prefix">https://</span>
                  <input
                    id={urlId}
                    value={values.siteUrl}
                    onChange={(e) => set({ siteUrl: e.target.value.replace(/^https?:\/\//i, "") })}
                    placeholder="yourstore.com"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={!urlValid}
                    aria-describedby={hintId}
                  />
                  {url && urlValid && <span className="ui-is__ok" aria-hidden="true"><Icon d="m3.5 8.5 3 3 6-7" size={14} /></span>}
                </div>
                <p className="ui-is__hint" id={hintId} data-error={!urlValid || undefined}>
                  {urlValid ? siteHint : "That doesn't look like a domain – try something like yourstore.com"}
                </p>
              </div>

              <div className="ui-is__section">
                <span className="ui-is__label" id={`${urlId}-tz`}>
                  Time zone
                </span>
                <ZonePicker zones={timeZones} value={values.timeZone} onChange={(timeZone) => set({ timeZone })} labelledBy={`${urlId}-tz`} />
              </div>
            </div>

            <div className="ui-is__save" data-open={dirty || undefined} inert={!dirty}>
              <div className="ui-is__save-inner">
                <span>Unsaved changes</span>
                <div className="ui-is__save-actions">
                  <button type="button" className="ui-is__btn" onClick={() => setValues(saved)}>
                    Discard
                  </button>
                  <button type="button" className="ui-is__btn ui-is__btn--primary" onClick={save} disabled={!urlValid || saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Time zone dropdown with a search field */
function ZonePicker({ zones, value, onChange, labelledBy }: { zones: string[]; value: string; onChange: (v: string) => void; labelledBy: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const list = useMemo(() => zones.filter((z) => z.toLowerCase().includes(query.trim().toLowerCase())), [zones, query]);

  return (
    <div className="ui-is__zone" ref={ref}>
      <button
        type="button"
        className="ui-is__field ui-is__zone-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
        onClick={() => {
          setOpen((o) => !o);
          setQuery("");
        }}
      >
        <span>{value}</span>
        <ClockIcon />
      </button>
      {open && (
        <div className="ui-is__menu">
          <input className="ui-is__menu-search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city or offset" aria-label="Search time zones" />
          <div className="ui-is__menu-list" role="listbox" aria-labelledby={labelledBy}>
            {list.length === 0 && <p className="ui-is__menu-empty">No time zone matches.</p>}
            {list.map((z) => (
              <button
                key={z}
                type="button"
                role="option"
                aria-selected={z === value}
                className="ui-is__option"
                onClick={() => {
                  onChange(z);
                  setOpen(false);
                }}
              >
                {z}
                {z === value && <Icon d="m3.5 8.5 3 3 6-7" size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const KeyIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M10.5 1.5a4 4 0 0 0-3.86 5.05L1.8 11.4a1 1 0 0 0-.3.7v1.9a.5.5 0 0 0 .5.5h1.9a.5.5 0 0 0 .5-.5V13h1v-1h1v-1l.95-.95A4 4 0 1 0 10.5 1.5Zm1 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" fill="var(--ui-is-muted)" />
    <path d="M8 4.5V8h3" fill="none" stroke="var(--ui-is-field)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-is {
  --ui-is-tray: #f0f0f0;
  --ui-is-card: #ffffff;
  --ui-is-line: #f0f0f0;
  --ui-is-ink: #171717;
  --ui-is-text: #404040;
  --ui-is-muted: #8f8f8f;
  --ui-is-accent: #2f6bff;
  --ui-is-ok: #1f8a4c;
  --ui-is-danger: #e5484d;
  --ui-is-accent-text: #2f6bff;
  --ui-is-border: #e5e5e5;
  --ui-is-ring: #e2e2e2;
  --ui-is-ring-strong: #d4d4d4;
  --ui-is-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  --ui-is-raised: #fff;
  --ui-is-raised-hover: #f7f7f7;
  --ui-is-well: #f5f5f5;
  --ui-is-well-hover: #efefef;
  --ui-is-field: #fff;
  --ui-is-hover: rgba(0, 0, 0, 0.05);
  --ui-is-switch-off: #d9d9d9;
  --ui-is-ok-soft: #f2fbf6;
  --ui-is-ok-ring: #cfeedd;
  --ui-is-track: #d4d4d4;
  --ui-is-placeholder: #b5b5b5;
  --ui-is-menu: #fff;
  --ui-is-menu-hover: #f5f5f5;
  --ui-is-menu-search: #f5f5f5;
  --ui-is-ease: cubic-bezier(0.22, 1, 0.36, 1);
  box-sizing: border-box;
  width: 100%;
  max-width: 560px;
  /* Like the Chat Composer: the header lives in the gray tray, the settings in the white card on top of it */
  background: var(--ui-is-tray);
  border-radius: 20px;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ui-is-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-is *, .ui-is *::before, .ui-is *::after { box-sizing: border-box; }
.ui-is button { margin: 0; font: inherit; color: inherit; cursor: pointer; }
.ui-is button:focus-visible { outline: 2px solid var(--ui-is-accent); outline-offset: 2px; }

.ui-is__head { display: flex; align-items: center; gap: 14px; padding: 14px 16px 14px 14px; }
.ui-is__logo {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--ui-is-raised);
  box-shadow: 0 0 0 1px var(--ui-is-border), 0 1px 2px rgba(0, 0, 0, 0.04);
}
.ui-is__logo svg { width: 22px; height: 22px; }
.ui-is__who { display: grid; flex: 1; min-width: 0; }
.ui-is__name { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 500; line-height: 22px; }
.ui-is__count {
  padding: 0 6px;
  border-radius: 6px;
  background: var(--ui-is-raised);
  box-shadow: inset 0 0 0 1px var(--ui-is-ring);
  font-size: 11.5px;
  font-weight: 500;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--ui-is-text);
}
.ui-is__meta { overflow: hidden; font-size: 13px; line-height: 19px; white-space: nowrap; text-overflow: ellipsis; color: var(--ui-is-muted); }

.ui-is__switch {
  position: relative;
  flex: none;
  width: 40px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--ui-is-switch-off);
  transition: background-color 220ms ease;
}
.ui-is__switch span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  transition: transform 280ms var(--ui-is-ease);
}
.ui-is__switch[aria-checked="true"] { background: var(--ui-is-accent); }
.ui-is__switch[aria-checked="true"] span { transform: translateX(16px); }

/* Switching off folds the settings away */
.ui-is__fold { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 420ms var(--ui-is-ease), opacity 260ms ease; opacity: 0; }
.ui-is__fold[data-open] { grid-template-rows: 1fr; opacity: 1; }
.ui-is__fold-inner { min-height: 0; overflow: hidden; }
.ui-is__fold[data-open] .ui-is__fold-inner { overflow: visible; }

.ui-is__card {
  background: var(--ui-is-card);
  border: 1px solid var(--ui-is-border);
  border-radius: 20px;
  box-shadow: var(--ui-is-shadow);
}
.ui-is__section { padding: 16px 18px 18px; }
.ui-is__section + .ui-is__section { border-top: 1px solid var(--ui-is-line); }
.ui-is__label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; line-height: 20px; }

.ui-is__generate {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 11px;
  background: var(--ui-is-well);
  font-size: 14px !important;
  color: var(--ui-is-muted) !important;
  text-align: left;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-is__generate:hover:not(:disabled) { background: var(--ui-is-well-hover); color: var(--ui-is-ink) !important; }
.ui-is__generate:disabled { cursor: progress; }
.ui-is__key {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 42px;
  padding: 0 6px 0 14px;
  border-radius: 11px;
  background: var(--ui-is-well);
  animation: ui-is-in 320ms var(--ui-is-ease);
}
.ui-is__key[data-new] { background: var(--ui-is-ok-soft); box-shadow: inset 0 0 0 1px var(--ui-is-ok-ring); }
.ui-is__key code {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--ui-is-text);
}
.ui-is__mini {
  display: grid;
  place-items: center;
  flex: none;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ui-is-muted) !important;
  transition: background-color 140ms ease, color 140ms ease;
}
.ui-is__mini:hover { background: var(--ui-is-hover); color: var(--ui-is-ink) !important; }
.ui-is__regen {
  display: grid;
  place-items: center;
  min-width: 92px;
  height: 30px;
  margin-left: 2px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: var(--ui-is-raised);
  box-shadow: 0 0 0 1px var(--ui-is-border);
  font-size: 12.5px !important;
  font-weight: 500;
}
.ui-is__regen:hover:not(:disabled) { background: var(--ui-is-raised-hover); }
.ui-is__note { margin: 8px 0 0; font-size: 12.5px; color: var(--ui-is-ok); }
.ui-is__spinner {
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--ui-is-track);
  border-top-color: var(--ui-is-ink);
  border-radius: 50%;
  animation: ui-is-spin 700ms linear infinite;
}

.ui-is__field {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 11px;
  background: var(--ui-is-field);
  box-shadow: 0 0 0 1px var(--ui-is-ring), 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: box-shadow 160ms ease;
}
.ui-is__field:focus-within { box-shadow: 0 0 0 1px var(--ui-is-accent), 0 0 0 4px rgba(47, 107, 255, 0.12); }
.ui-is__field[data-invalid] { box-shadow: 0 0 0 1px var(--ui-is-danger), 0 0 0 4px rgba(229, 72, 77, 0.1); }
.ui-is__prefix { font-size: 14px; color: var(--ui-is-placeholder); }
.ui-is__field input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--ui-is-ink);
}
.ui-is__field input::placeholder { color: var(--ui-is-placeholder); }
.ui-is__ok { display: grid; color: var(--ui-is-ok); animation: ui-is-in 240ms var(--ui-is-ease); }
.ui-is__hint { margin: 8px 0 0; font-size: 13px; line-height: 18px; color: var(--ui-is-muted); }
.ui-is__hint[data-error] { color: var(--ui-is-danger); }

.ui-is__zone { position: relative; }
.ui-is__zone-btn { justify-content: space-between; font-size: 14px !important; text-align: left; }
.ui-is__zone-btn:hover { box-shadow: 0 0 0 1px var(--ui-is-ring-strong), 0 1px 2px rgba(0, 0, 0, 0.03); }
.ui-is__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 10;
  padding: 6px;
  border-radius: 14px;
  background: var(--ui-is-menu);
  box-shadow: 0 0 0 1px var(--ui-is-border), 0 14px 36px -10px rgba(0, 0, 0, 0.22);
  animation: ui-is-drop 180ms var(--ui-is-ease);
}
.ui-is__menu-search {
  width: 100%;
  height: 34px;
  margin-bottom: 4px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  outline: none;
  background: var(--ui-is-menu-search);
  font: inherit;
  font-size: 13px;
}
.ui-is__menu-list { display: grid; gap: 2px; max-height: 200px; overflow-y: auto; scrollbar-width: thin; }
.ui-is__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 13px !important;
  text-align: left;
}
.ui-is__option:hover { background: var(--ui-is-menu-hover); }
.ui-is__option[aria-selected="true"] { color: var(--ui-is-accent-text) !important; font-weight: 500; }
.ui-is__menu-empty { margin: 0; padding: 12px 10px; font-size: 13px; color: var(--ui-is-muted); }

/* Save bar in the gray extension, slides open when something changed */
.ui-is__save { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 360ms var(--ui-is-ease); }
.ui-is__save[data-open] { grid-template-rows: 1fr; }
.ui-is__save-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
  padding: 0 8px 0 18px;
  font-size: 13px;
  color: var(--ui-is-text);
}
.ui-is__save[data-open] .ui-is__save-inner { padding-top: 8px; padding-bottom: 8px; }
.ui-is__save-actions { display: flex; gap: 6px; }
.ui-is__btn {
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: var(--ui-is-raised);
  box-shadow: 0 0 0 1px var(--ui-is-border), 0 1px 2px rgba(0, 0, 0, 0.04);
  font-size: 13px !important;
  font-weight: 500;
}
.ui-is__btn:hover { background: var(--ui-is-raised-hover); }
.ui-is__btn--primary {
  background: linear-gradient(#323137, #201e25);
  box-shadow: 0 0 0 1px #0d0d0d, 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  color: #fff !important;
}
.ui-is__btn--primary:hover { background: linear-gradient(#3b3a41, #26242b); }
.ui-is__btn--primary:disabled { opacity: 0.5; cursor: default; }

@keyframes ui-is-in { from { opacity: 0; transform: translateY(2px); } }
@keyframes ui-is-drop { from { opacity: 0; transform: translateY(-4px) scale(0.98); } }
@keyframes ui-is-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .ui-is__fold, .ui-is__save, .ui-is__switch, .ui-is__switch span { transition: none; }
  .ui-is__key, .ui-is__menu, .ui-is__ok { animation: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-is {
  --ui-is-tray: #161618;
  --ui-is-card: #232326;
  --ui-is-line: rgba(255, 255, 255, 0.08);
  --ui-is-ink: #ededed;
  --ui-is-text: #c4c4c4;
  --ui-is-muted: #8f8f8f;
  --ui-is-ok: #3dbb6f;
  --ui-is-danger: #ff6369;
  --ui-is-accent-text: #6b95ff;
  --ui-is-border: rgba(255, 255, 255, 0.08);
  --ui-is-ring: rgba(255, 255, 255, 0.08);
  --ui-is-ring-strong: rgba(255, 255, 255, 0.14);
  --ui-is-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  --ui-is-raised: #2a2a2d;
  --ui-is-raised-hover: #313135;
  --ui-is-well: #2a2a2d;
  --ui-is-well-hover: #313135;
  --ui-is-field: #2a2a2d;
  --ui-is-hover: rgba(255, 255, 255, 0.06);
  --ui-is-switch-off: #3a3a3e;
  --ui-is-ok-soft: rgba(61, 187, 111, 0.14);
  --ui-is-ok-ring: rgba(61, 187, 111, 0.3);
  --ui-is-track: rgba(255, 255, 255, 0.14);
  --ui-is-placeholder: #6b6b70;
  --ui-is-menu: #2a2a2d;
  --ui-is-menu-hover: #313135;
  --ui-is-menu-search: #1f1f21;
}
:where(.dark, [data-theme="dark"]) .ui-is__menu {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 14px 36px -10px rgba(0, 0, 0, 0.55);
}
:where(.dark, [data-theme="dark"]) .ui-is__menu-search { color: var(--ui-is-ink); }
:where(.dark, [data-theme="dark"]) .ui-is__menu-search::placeholder { color: var(--ui-is-placeholder); }
:where(.dark, [data-theme="dark"]) .ui-is__switch span { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45); }
:where(.dark, [data-theme="dark"]) .ui-is__field:focus-within { box-shadow: 0 0 0 1px var(--ui-is-accent), 0 0 0 4px rgba(47, 107, 255, 0.22); }
:where(.dark, [data-theme="dark"]) .ui-is__field[data-invalid] { box-shadow: 0 0 0 1px var(--ui-is-danger), 0 0 0 4px rgba(255, 99, 105, 0.16); }
:where(.dark, [data-theme="dark"]) .ui-is__btn--primary {
  background: linear-gradient(#f4f4f5, #e4e4e7);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.35), inset 0 1px 0 #ffffff;
  color: #121213 !important;
}
:where(.dark, [data-theme="dark"]) .ui-is__btn--primary:hover { background: linear-gradient(#ffffff, #ececef); }
`;
