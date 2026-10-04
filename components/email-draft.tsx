"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/*
 * Email Draft – an agent-written email waiting for review, in a single self-contained file.
 * The record it's about sits on the gray tray (reference, status, amount); the white card holds the email:
 * recipient you can switch, an attachment you can remove, tone variants, inline editing, Discard and Send.
 * Sending or discarding folds the card into a one-line receipt with Undo; heights glide throughout.
 * The styles are injected below, so no extra files are needed.
 */

export type DraftContact = { name: string; email: string };

export type DraftTone = { id: string; label: string; body: (contact: DraftContact) => string };

export type EmailDraftProps = {
  /** Reference of the record, e.g. a subscription or invoice number */
  reference?: string;
  /** Account or company under the reference */
  account?: string;
  /** Amount shown on the right */
  amount?: string;
  /** Status chip next to the reference */
  status?: string;
  /** Who wrote the draft */
  agent?: string;
  contacts?: DraftContact[];
  attachment?: string | null;
  /** Text variants to switch between – the first one is shown first */
  tones?: DraftTone[];
  /** Label and target of the link appended to the email */
  link?: { label: string; href: string };
  onSend?: (email: { to: DraftContact; body: string; attachment: string | null }) => void;
  onDiscard?: () => void;
  className?: string;
};

const defaultContacts: DraftContact[] = [
  { name: "Jonas Weber", email: "jonas@northwind.io" },
  { name: "Lena Hart", email: "lena@northwind.io" },
  { name: "Finance team", email: "billing@northwind.io" },
];

const first = (c: DraftContact) => c.name.split(" ")[0];

const defaultTones: DraftTone[] = [
  {
    id: "friendly",
    label: "Friendly",
    body: (c) =>
      `Hi ${first(c)}, a heads-up that your Growth plan renews on October 9 for $8,900 a year. If you'd like to add seats or switch to monthly billing, you can review the quote here:`,
  },
  {
    id: "short",
    label: "Short",
    body: (c) => `Hi ${first(c)}, your Growth plan renews on October 9 ($8,900/year). Quote for changes:`,
  },
  {
    id: "formal",
    label: "Formal",
    body: (c) =>
      `Dear ${c.name}, this is a reminder that your Growth subscription is scheduled to renew on October 9 at $8,900 per year. Should you wish to adjust seats or billing, please review the attached quote:`,
  },
];

type Phase = "draft" | "sending" | "sent" | "discarded";

export function EmailDraft({
  reference = "SUB-1182",
  account = "Northwind Logistics",
  amount = "$8,900",
  status = "Renews in 5 days",
  agent = "Renewal agent",
  contacts = defaultContacts,
  attachment = "Renewal-quote.pdf",
  tones = defaultTones,
  link = { label: "Review quote", href: "#" },
  onSend,
  onDiscard,
  className,
}: EmailDraftProps) {
  const [to, setTo] = useState(contacts[0]);
  const [file, setFile] = useState<string | null>(attachment);
  const [tone, setTone] = useState(tones[0].id);
  // Edited text wins over the generated variant until the tone or recipient changes
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState(false);
  const [phase, setPhase] = useState<Phase>("draft");
  const [toneKey, setToneKey] = useState(0);
  const inner = useRef<HTMLDivElement>(null);
  const outer = useSmoothHeight(inner);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const generated = tones.find((t) => t.id === tone)!.body(to);
  const body = edited ?? generated;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  // Close the recipient menu on outside click or Escape
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // The edit field grows with its text
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, body]);

  const startEditing = () => {
    setEdited(body);
    setEditing(true);
    requestAnimationFrame(() => {
      const el = textRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  };

  const pickTone = (id: string) => {
    if (id === tone && edited === null) return;
    setTone(id);
    setEdited(null);
    setEditing(false);
    setToneKey((k) => k + 1);
  };

  const pickContact = (c: DraftContact) => {
    setTo(c);
    setMenu(false);
    // Keep manual edits, but follow the new name in the generated text
    if (edited !== null) setEdited(edited.replace(new RegExp(`\\b${first(to)}\\b|${to.name}`, "g"), (m) => (m === to.name ? c.name : first(c))));
  };

  const send = () => {
    if (phase !== "draft") return;
    setEditing(false);
    setPhase("sending");
    timers.current.push(
      window.setTimeout(() => {
        setPhase("sent");
        onSend?.({ to, body: `${body} ${link.label}: ${link.href}`, attachment: file });
      }, 900),
    );
  };

  const discard = () => {
    setEditing(false);
    setPhase("discarded");
    onDiscard?.();
  };

  const undo = () => setPhase("draft");

  const open = phase === "draft" || phase === "sending";
  const badge =
    phase === "sent" ? { text: "Sent", tone: "ok" } : phase === "discarded" ? { text: "Discarded", tone: "muted" } : { text: "Ready for review", tone: "ok" };

  return (
    <div className={["ui-ed", className].filter(Boolean).join(" ")}>
      <style href="ui-email-draft" precedence="default">
        {css}
      </style>

      {/* The record the email is about */}
      <div className="ui-ed__record">
        <div className="ui-ed__ref">
          <span className="ui-ed__id">{reference}</span>
          <span className="ui-ed__status">{status}</span>
          <span className="ui-ed__amount">{amount}</span>
        </div>
        <span className="ui-ed__account">{account}</span>
      </div>

      {/* Card ↔ receipt, the height glides between them */}
      <div className="ui-ed__outer" ref={outer}>
        <div ref={inner}>
          {open ? (
            <div className="ui-ed__card" data-sending={phase === "sending" ? "" : undefined}>
              <div className="ui-ed__meta">
                <div className="ui-ed__to" ref={menuRef}>
                  <span className="ui-ed__label">to</span>
                  <button
                    type="button"
                    className="ui-ed__recipient"
                    aria-haspopup="listbox"
                    aria-expanded={menu}
                    onClick={() => setMenu((m) => !m)}
                  >
                    {to.name} <span className="ui-ed__email">({to.email})</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                  </button>
                  {menu && (
                    <ul className="ui-ed__menu" role="listbox" aria-label="Recipient">
                      {contacts.map((c) => (
                        <li key={c.email}>
                          <button type="button" role="option" aria-selected={c.email === to.email} onClick={() => pickContact(c)}>
                            <span className="ui-ed__avatar" aria-hidden="true">
                              {c.name
                                .split(" ")
                                .map((p) => p[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                            <span className="ui-ed__menu-text">
                              {c.name}
                              <small>{c.email}</small>
                            </span>
                            {c.email === to.email && (
                              <svg className="ui-ed__tick" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m6 12.5 4 4 8-9" />
                              </svg>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {file ? (
                  <span className="ui-ed__file">
                    <Icon>
                      <path d="m15.5 7.5-6.4 6.4a1.8 1.8 0 0 0 2.5 2.5l6.7-6.7a3.5 3.5 0 0 0-5-5l-6.9 6.9a5.2 5.2 0 0 0 7.4 7.4l6-6" />
                    </Icon>
                    {file}
                    <button type="button" aria-label={`Remove ${file}`} onClick={() => setFile(null)}>
                      <Icon>
                        <path d="M7 7l10 10M17 7 7 17" />
                      </Icon>
                    </button>
                  </span>
                ) : (
                  attachment && (
                    <button type="button" className="ui-ed__attach" onClick={() => setFile(attachment)}>
                      <Icon>
                        <path d="M12 6v12M6 12h12" />
                      </Icon>
                      Attach {attachment}
                    </button>
                  )
                )}
              </div>

              <div className="ui-ed__body">
                {editing ? (
                  <textarea
                    ref={textRef}
                    className="ui-ed__edit"
                    value={edited ?? ""}
                    onChange={(e) => setEdited(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        send();
                      }
                      if (e.key === "Escape") setEditing(false);
                    }}
                    onBlur={() => setEditing(false)}
                    aria-label="Email text"
                  />
                ) : (
                  <p key={toneKey} className="ui-ed__text" onClick={startEditing} title="Click to edit">
                    {body}{" "}
                    <a href={link.href} onClick={(e) => e.stopPropagation()}>
                      {link.label}
                    </a>
                  </p>
                )}
              </div>

              <div className="ui-ed__actions">
                <div className="ui-ed__tones" role="group" aria-label="Tone">
                  {tones.map((t) => (
                    <button key={t.id} type="button" aria-pressed={tone === t.id && edited === null} onClick={() => pickTone(t.id)}>
                      {t.label}
                    </button>
                  ))}
                  <button type="button" className="ui-ed__edit-btn" aria-pressed={editing} aria-label="Edit text" onClick={startEditing}>
                    <Icon>
                      <path d="M14.5 5.5 18.5 9.5M5 19l1-4L15.5 5.5l4 4L10 19l-5 0Z" />
                    </Icon>
                  </button>
                </div>
                <div className="ui-ed__buttons">
                  <button type="button" className="ui-ed__secondary" onClick={discard} disabled={phase === "sending"}>
                    Discard
                  </button>
                  <button type="button" className="ui-ed__primary" onClick={send} disabled={phase === "sending"}>
                    {phase === "sending" ? (
                      <>
                        <span className="ui-ed__spinner" aria-hidden="true" />
                        Sending
                      </>
                    ) : (
                      "Send email"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="ui-ed__receipt" role="status">
              <span className="ui-ed__receipt-icon" data-tone={phase === "sent" ? "ok" : "muted"} aria-hidden="true">
                <Icon>{phase === "sent" ? <path d="m6 12.5 4 4 8-9" /> : <path d="M7 7l10 10M17 7 7 17" />}</Icon>
              </span>
              <span className="ui-ed__receipt-text">
                {phase === "sent" ? (
                  <>
                    Sent to <b>{to.name}</b>
                    {file ? ` with ${file}` : ""}
                  </>
                ) : (
                  "Draft discarded"
                )}
              </span>
              <button type="button" className="ui-ed__undo" onClick={undo}>
                Undo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="ui-ed__foot">
        <span className="ui-ed__agent">{agent}</span>
        <span className="ui-ed__badge" data-tone={badge.tone} key={badge.text}>
          {badge.text}
        </span>
        {open && <span className="ui-ed__hint">⌘ Enter to send</span>}
      </div>
    </div>
  );
}

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

/** The outer box follows the inner box's height, with a transition after the first frame */
function useSmoothHeight(inner: RefObject<HTMLElement | null>) {
  const outer = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const sync = () => {
      o.style.height = `${i.offsetHeight}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(i);
    const frame = requestAnimationFrame(() => o.setAttribute("data-smooth", ""));
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [inner]);
  return outer;
}

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-ed {
  --ui-ed-tray: #f0f0f0;
  --ui-ed-card: #ffffff;
  --ui-ed-card-line: #e5e5e5;
  --ui-ed-line: #ececec;
  --ui-ed-ink: #171717;
  --ui-ed-text: #404040;
  --ui-ed-muted: #8f8f8f;
  --ui-ed-chip: #f5f5f5;
  --ui-ed-chip-line: #ebebeb;
  --ui-ed-hover: #f5f5f5;
  --ui-ed-warn: #c2570c;
  --ui-ed-warn-bg: #fdeedd;
  --ui-ed-ok: #2f7d32;
  --ui-ed-ok-bg: #e8f5e6;
  --ui-ed-btn-top: #323137;
  --ui-ed-btn-bottom: #201e25;
  --ui-ed-btn-ring: #0d0d0d;
  --ui-ed-btn-text: #ffffff;
  --ui-ed-focus: #2f6bff;
  --ui-ed-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  --ui-ed-ease: cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  max-width: 520px;
  padding: 6px;
  border-radius: 20px;
  background: var(--ui-ed-tray);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ui-ed-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-ed *, .ui-ed *::before, .ui-ed *::after { box-sizing: border-box; }
.ui-ed button { font: inherit; color: inherit; margin: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.ui-ed button:focus-visible, .ui-ed a:focus-visible { outline: 2px solid var(--ui-ed-focus); outline-offset: 2px; }
.ui-ed svg { width: 15px; height: 15px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

/* ---------- Record on the tray ---------- */

.ui-ed__record { display: grid; gap: 2px; padding: 8px 10px 10px; }
.ui-ed__ref { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ui-ed__id { font-size: 15px; font-weight: 500; letter-spacing: -0.01em; }
.ui-ed__status {
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--ui-ed-warn-bg);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ui-ed-warn);
  white-space: nowrap;
}
.ui-ed__amount { margin-left: auto; font-size: 15px; font-weight: 500; font-variant-numeric: tabular-nums; }
.ui-ed__account { font-size: 13px; color: var(--ui-ed-muted); }

.ui-ed__outer { position: relative; }
.ui-ed__outer[data-smooth] { transition: height 360ms var(--ui-ed-ease); }

/* ---------- Email card ---------- */

.ui-ed__card {
  border: 1px solid var(--ui-ed-card-line);
  border-radius: 16px;
  background: var(--ui-ed-card);
  box-shadow: var(--ui-ed-shadow);
  animation: ui-ed-in 320ms var(--ui-ed-ease) both;
  transition: opacity 220ms ease;
}
.ui-ed__card[data-sending] { opacity: 0.7; pointer-events: none; }

.ui-ed__meta {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 14px;
  padding: 12px 0 11px;
  border-bottom: 1px solid var(--ui-ed-line);
}
.ui-ed__to { position: relative; display: flex; align-items: center; gap: 6px; min-width: 0; }
.ui-ed__label { font-size: 13px; color: var(--ui-ed-muted); }
.ui-ed__recipient {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  height: 26px;
  padding: 0 6px 0 8px;
  border: 0;
  border-radius: 8px;
  background: var(--ui-ed-chip);
  box-shadow: inset 0 0 0 1px var(--ui-ed-chip-line);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  transition: background-color 160ms ease;
}
.ui-ed__recipient:hover { background: color-mix(in srgb, var(--ui-ed-chip) 80%, var(--ui-ed-ink) 6%); }
.ui-ed__email { overflow: hidden; text-overflow: ellipsis; color: var(--ui-ed-muted); }
.ui-ed__recipient svg { width: 14px; height: 14px; color: var(--ui-ed-muted); transition: transform 220ms var(--ui-ed-ease); }
.ui-ed__recipient[aria-expanded="true"] svg { transform: rotate(180deg); }

.ui-ed__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 18px;
  z-index: 5;
  display: grid;
  gap: 2px;
  min-width: 250px;
  margin: 0;
  padding: 5px;
  list-style: none;
  border-radius: 12px;
  background: var(--ui-ed-card);
  box-shadow: 0 0 0 1px var(--ui-ed-card-line), 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: ui-ed-menu 200ms var(--ui-ed-ease) both;
  transform-origin: top left;
}
.ui-ed__menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 8px;
  border: 0;
  border-radius: 8px;
  background: none;
  text-align: left;
  font-size: 13px;
}
.ui-ed__menu button:hover { background: var(--ui-ed-hover); }
.ui-ed__avatar {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex: none;
  border-radius: 50%;
  background: var(--ui-ed-chip);
  box-shadow: inset 0 0 0 1px var(--ui-ed-chip-line);
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ui-ed-text);
}
.ui-ed__menu-text { display: grid; flex: 1; min-width: 0; }
.ui-ed__menu-text small { font-size: 12px; color: var(--ui-ed-muted); overflow: hidden; text-overflow: ellipsis; }
.ui-ed__tick { color: var(--ui-ed-ink); }

.ui-ed__file {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--ui-ed-muted);
  white-space: nowrap;
}
.ui-ed__file button,
.ui-ed__attach {
  display: grid;
  place-items: center;
  border: 0;
  background: none;
  color: var(--ui-ed-muted) !important;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-ed__file button { width: 20px; height: 20px; padding: 0; border-radius: 6px; }
.ui-ed__file button svg { width: 13px; height: 13px; }
.ui-ed__file button:hover { background: var(--ui-ed-hover); color: var(--ui-ed-ink) !important; }
.ui-ed__attach { display: inline-flex; gap: 4px; padding: 3px 6px; border-radius: 8px; font-size: 13px; white-space: nowrap; }
.ui-ed__attach:hover { background: var(--ui-ed-hover); color: var(--ui-ed-ink) !important; }

/* Body */
.ui-ed__body { padding: 12px 14px 4px; }
.ui-ed__text {
  margin: -4px -6px;
  padding: 4px 6px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--ui-ed-text);
  cursor: text;
  transition: background-color 160ms ease;
  animation: ui-ed-fade 280ms ease both;
}
.ui-ed__text:hover { background: var(--ui-ed-hover); }
.ui-ed__text a {
  color: var(--ui-ed-text);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--ui-ed-text) 35%, transparent);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.ui-ed__text a:hover { text-decoration-color: currentColor; }
.ui-ed__edit {
  display: block;
  width: calc(100% + 12px);
  margin: -4px -6px;
  padding: 4px 6px;
  border: 0;
  border-radius: 8px;
  background: var(--ui-ed-hover);
  box-shadow: inset 0 0 0 1px var(--ui-ed-chip-line);
  outline: none;
  resize: none;
  overflow: hidden;
  font: inherit;
  font-size: 15px;
  line-height: 1.6;
  color: var(--ui-ed-ink);
}

/* Actions */
.ui-ed__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 10px 10px 14px;
}
.ui-ed__tones { display: flex; align-items: center; gap: 2px; }
.ui-ed__tones button {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 9px;
  border: 0;
  border-radius: 8px;
  background: none;
  font-size: 12.5px;
  color: var(--ui-ed-muted) !important;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-ed__tones button:hover { color: var(--ui-ed-ink) !important; }
.ui-ed__tones button[aria-pressed="true"] { background: var(--ui-ed-chip); color: var(--ui-ed-ink) !important; box-shadow: inset 0 0 0 1px var(--ui-ed-chip-line); }
.ui-ed__tones .ui-ed__edit-btn { width: 28px; padding: 0; justify-content: center; margin-left: 4px; }
.ui-ed__buttons { display: flex; gap: 8px; margin-left: auto; }
.ui-ed__secondary,
.ui-ed__primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 160ms ease, transform 160ms ease, filter 160ms ease;
}
.ui-ed__secondary { background: var(--ui-ed-card); box-shadow: inset 0 0 0 1px var(--ui-ed-card-line); color: var(--ui-ed-text) !important; }
.ui-ed__secondary:hover { background: var(--ui-ed-hover); }
.ui-ed__primary {
  background: linear-gradient(180deg, var(--ui-ed-btn-top), var(--ui-ed-btn-bottom));
  box-shadow: 0 0 0 1px var(--ui-ed-btn-ring), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  color: var(--ui-ed-btn-text) !important;
}
.ui-ed__primary:hover { filter: brightness(1.12); }
.ui-ed__secondary:active, .ui-ed__primary:active { transform: scale(0.98); }
.ui-ed__spinner {
  width: 13px;
  height: 13px;
  border: 1.8px solid color-mix(in srgb, var(--ui-ed-btn-text) 30%, transparent);
  border-top-color: var(--ui-ed-btn-text);
  border-radius: 50%;
  animation: ui-ed-spin 700ms linear infinite;
}

/* ---------- Receipt after send / discard ---------- */

.ui-ed__receipt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px 12px 12px;
  border: 1px solid var(--ui-ed-card-line);
  border-radius: 16px;
  background: var(--ui-ed-card);
  box-shadow: var(--ui-ed-shadow);
  font-size: 14px;
  color: var(--ui-ed-text);
  animation: ui-ed-in 320ms var(--ui-ed-ease) both;
}
.ui-ed__receipt b { font-weight: 500; color: var(--ui-ed-ink); }
.ui-ed__receipt-icon {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex: none;
  border-radius: 50%;
  background: var(--ui-ed-chip);
  color: var(--ui-ed-muted);
}
.ui-ed__receipt-icon[data-tone="ok"] { background: var(--ui-ed-ok-bg); color: var(--ui-ed-ok); }
.ui-ed__receipt-icon svg { width: 14px; height: 14px; stroke-width: 2.2; }
.ui-ed__receipt-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-ed__undo {
  padding: 4px 8px;
  border: 0;
  border-radius: 8px;
  background: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--ui-ed-ink) !important;
  transition: background-color 160ms ease;
}
.ui-ed__undo:hover { background: var(--ui-ed-hover); }

/* ---------- Footer on the tray ---------- */

.ui-ed__foot { display: flex; align-items: center; gap: 8px; padding: 10px 10px 6px; }
.ui-ed__agent { font-size: 14px; color: var(--ui-ed-ink); }
.ui-ed__badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  animation: ui-ed-fade 260ms ease both;
}
.ui-ed__badge[data-tone="ok"] { background: var(--ui-ed-ok-bg); color: var(--ui-ed-ok); }
.ui-ed__badge[data-tone="muted"] { background: var(--ui-ed-chip); color: var(--ui-ed-muted); }
.ui-ed__hint { margin-left: auto; font-size: 12px; color: var(--ui-ed-muted); }

@keyframes ui-ed-in { from { opacity: 0; transform: translateY(4px) scale(0.99); } }
@keyframes ui-ed-fade { from { opacity: 0; } }
@keyframes ui-ed-menu { from { opacity: 0; transform: scale(0.96) translateY(-4px); } }
@keyframes ui-ed-spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .ui-ed__email, .ui-ed__hint { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-ed__outer[data-smooth] { transition: none; }
  .ui-ed__card, .ui-ed__receipt, .ui-ed__text, .ui-ed__badge, .ui-ed__menu { animation: none; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-ed {
  --ui-ed-tray: #161618;
  --ui-ed-card: #232326;
  --ui-ed-card-line: rgba(255, 255, 255, 0.08);
  --ui-ed-line: rgba(255, 255, 255, 0.07);
  --ui-ed-ink: #ededed;
  --ui-ed-text: #c4c4c4;
  --ui-ed-muted: #8f8f8f;
  --ui-ed-chip: #2a2a2d;
  --ui-ed-chip-line: rgba(255, 255, 255, 0.08);
  --ui-ed-hover: rgba(255, 255, 255, 0.05);
  --ui-ed-warn: #fb9a4b;
  --ui-ed-warn-bg: rgba(251, 154, 75, 0.14);
  --ui-ed-ok: #6fd27a;
  --ui-ed-ok-bg: rgba(111, 210, 122, 0.14);
  --ui-ed-btn-top: #f4f4f5;
  --ui-ed-btn-bottom: #e4e4e7;
  --ui-ed-btn-ring: rgba(0, 0, 0, 0.6);
  --ui-ed-btn-text: #121213;
  --ui-ed-focus: #6b95ff;
  --ui-ed-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
`;
