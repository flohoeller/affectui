"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/*
 * Email Draft (Clean) – an agent-written email waiting for review, in a single self-contained file.
 * Clean style: no tray – one white card with hairline shadows. The record it's about (reference, status, amount)
 * heads the card; below it the email: recipient you can switch, an attachment you can remove, tone variants,
 * inline editing. The last row holds who wrote it, its state, Discard and Send.
 * Sending or discarding folds the email into a one-line receipt with Undo; only the content glides to its new height.
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

const first = (c: DraftContact) => c.name.trim().split(/\s+/)[0] ?? "";
// Two capitals from whole letters – emoji and stray spaces are skipped
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w.match(/[\p{L}\p{N}]/u)?.[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Without contacts there is no one to send to – the recipient button and Send step back
const NO_ONE: DraftContact = { name: "", email: "" };

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
  const [to, setTo] = useState<DraftContact>(contacts[0] ?? NO_ONE);
  const [file, setFile] = useState<string | null>(attachment);
  const [tone, setTone] = useState(tones[0]?.id ?? "");
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

  const generated = tones.find((t) => t.id === tone)?.body(to) ?? "";
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
    // Keep manual edits, but follow the new name in the generated text – the full name first, then the first name alone
    const full = to.name.trim();
    const parts = [full && escape(full), first(to) && `\\b${escape(first(to))}\\b`].filter(Boolean);
    if (edited !== null && parts.length) setEdited(edited.replace(new RegExp(parts.join("|"), "g"), (m) => (m === full ? c.name.trim() : first(c))));
  };

  const send = () => {
    if (phase !== "draft" || !to.email) return;
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
    <div className={["ui-edc", className].filter(Boolean).join(" ")} data-phase={phase}>
      <style href="ui-email-draft-clean" precedence="default">
        {css}
      </style>

      {/* The record the email is about */}
      <div className="ui-edc__record">
        <div className="ui-edc__ref">
          <span className="ui-edc__id" title={reference}>
            {reference}
          </span>
          {status && (
            <span className="ui-edc__status" dir="auto" title={status}>
              {status}
            </span>
          )}
          <span className="ui-edc__amount">{amount}</span>
        </div>
        <span className="ui-edc__account" dir="auto">
          {account}
        </span>
      </div>

      {/* Email ↔ receipt – only this part glides to its new height, the last row below always stays in view */}
      <div className="ui-edc__outer" ref={outer} data-menu={menu ? "" : undefined}>
        <div ref={inner}>
          {open ? (
            <div className="ui-edc__draft" data-sending={phase === "sending" ? "" : undefined}>
              <div className="ui-edc__meta">
                <div className="ui-edc__to" ref={menuRef}>
                  <span className="ui-edc__label">To</span>
                  {to.email ? (
                    <button
                      type="button"
                      className="ui-edc__recipient"
                      aria-haspopup="listbox"
                      aria-expanded={menu}
                      title={`${to.name} <${to.email}>`}
                      onClick={() => setMenu((m) => !m)}
                    >
                      <span className="ui-edc__name" dir="auto">
                        {to.name}
                      </span>
                      <span className="ui-edc__email">{to.email}</span>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m8 10 4 4 4-4" />
                      </svg>
                    </button>
                  ) : (
                    <span className="ui-edc__email">No recipient</span>
                  )}
                  {menu && (
                    <ul className="ui-edc__menu" role="listbox" aria-label="Recipient">
                      {contacts.map((c, i) => (
                        <li key={`${c.email}-${i}`}>
                          <button type="button" role="option" aria-selected={c.email === to.email} onClick={() => pickContact(c)}>
                            <span className="ui-edc__avatar" aria-hidden="true">
                              {initials(c.name)}
                            </span>
                            <span className="ui-edc__menu-text" dir="auto">
                              {c.name}
                              <small>{c.email}</small>
                            </span>
                            {c.email === to.email && (
                              <svg className="ui-edc__tick" viewBox="0 0 24 24" aria-hidden="true">
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
                  <span className="ui-edc__file">
                    <Icon>
                      <path d="m15.5 7.5-6.4 6.4a1.8 1.8 0 0 0 2.5 2.5l6.7-6.7a3.5 3.5 0 0 0-5-5l-6.9 6.9a5.2 5.2 0 0 0 7.4 7.4l6-6" />
                    </Icon>
                    <span className="ui-edc__file-name" title={file}>
                      {file}
                    </span>
                    <button type="button" aria-label={`Remove ${file}`} onClick={() => setFile(null)}>
                      <Icon>
                        <path d="M7 7l10 10M17 7 7 17" />
                      </Icon>
                    </button>
                  </span>
                ) : (
                  attachment && (
                    <button type="button" className="ui-edc__attach" onClick={() => setFile(attachment)}>
                      <Icon>
                        <path d="M12 6v12M6 12h12" />
                      </Icon>
                      <span className="ui-edc__file-name" title={attachment}>
                        Attach {attachment}
                      </span>
                    </button>
                  )
                )}
              </div>

              <div className="ui-edc__body">
                {editing ? (
                  <textarea
                    ref={textRef}
                    className="ui-edc__edit"
                    dir="auto"
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
                  <p key={toneKey} className="ui-edc__text" dir="auto" onClick={startEditing} title="Click to edit">
                    {body}{" "}
                    <a href={link.href} onClick={(e) => e.stopPropagation()}>
                      {link.label}
                    </a>
                  </p>
                )}
              </div>

              <div className="ui-edc__tune">
                <div className="ui-edc__tones" role="group" aria-label="Tone">
                  {tones.map((t) => (
                    <button key={t.id} type="button" aria-pressed={tone === t.id && edited === null} onClick={() => pickTone(t.id)}>
                      {t.label}
                    </button>
                  ))}
                  <button type="button" className="ui-edc__edit-btn" aria-pressed={editing} aria-label="Edit text" onClick={startEditing}>
                    <Icon>
                      <path d="M14.5 5.5 18.5 9.5M5 19l1-4L15.5 5.5l4 4L10 19l-5 0Z" />
                    </Icon>
                  </button>
                </div>
                <span className="ui-edc__hint">⌘ Enter to send</span>
              </div>
            </div>
          ) : (
            <div className="ui-edc__receipt" role="status">
              <span className="ui-edc__receipt-icon" data-tone={phase === "sent" ? "ok" : "muted"} aria-hidden="true">
                <Icon>{phase === "sent" ? <path d="m6 12.5 4 4 8-9" /> : <path d="M7 7l10 10M17 7 7 17" />}</Icon>
              </span>
              <span className="ui-edc__receipt-text">
                {phase === "sent" ? (
                  <>
                    Sent to <b dir="auto">{to.name}</b>
                    {file ? ` with ${file}` : ""}
                  </>
                ) : (
                  "Draft discarded"
                )}
              </span>
              <button type="button" className="ui-edc__undo" onClick={undo}>
                Undo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* The last row of the card: who wrote it, its state, and the decision */}
      <div className="ui-edc__foot">
        <span className="ui-edc__agent" title={agent}>
          {agent}
        </span>
        <span className="ui-edc__badge" data-tone={badge.tone} key={badge.text}>
          {badge.text}
        </span>
        {open && (
          <div className="ui-edc__buttons">
            <button type="button" className="ui-edc__secondary" onClick={discard} disabled={phase === "sending"}>
              Discard
            </button>
            <button type="button" className="ui-edc__primary" onClick={send} disabled={phase === "sending" || !to.email}>
              {phase === "sending" ? (
                <>
                  <span className="ui-edc__spinner" aria-hidden="true" />
                  Sending
                </>
              ) : (
                "Send email"
              )}
            </button>
          </div>
        )}
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
/* Colors and motion as variables – override them on .ui-edc */
.ui-edc {
  --ui-edc-card: #ffffff;
  --ui-edc-strong: #000000;
  --ui-edc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-edc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-edc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-edc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.27));
  --ui-edc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-edc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-edc-fill: rgba(0, 0, 0, 0.06);
  --ui-edc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-edc-solid: var(--aui-primary, rgba(0, 0, 0, 0.88));
  --ui-edc-on-solid: var(--aui-on-primary, #fcfcfc);
  --ui-edc-accent: rgba(0, 96, 226, 0.765);
  --ui-edc-ok: var(--aui-success, #1e8a4f);
  --ui-edc-ok-bg: color-mix(in srgb, var(--aui-green, #5fc88a) 8%, transparent);
  --ui-edc-warn: #b48906;
  --ui-edc-warn-bg: color-mix(in srgb, var(--aui-amber, #e8b000) 12%, transparent);
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-edc-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-edc-shadow-pop: var(--aui-shadow-popover, 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 12px 28px -10px rgba(0, 0, 0, 0.16), 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  --ui-edc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-edc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  position: relative;
  box-sizing: border-box;
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--aui-surface, var(--ui-edc-card));
  box-shadow: var(--aui-shadow-card, var(--ui-edc-shadow));
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  color: var(--ui-edc-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-edc *, .ui-edc *::before, .ui-edc *::after { box-sizing: border-box; }
:where(.ui-edc) button {
  appearance: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.ui-edc button:focus-visible, .ui-edc a:focus-visible { outline: 2px solid var(--ui-edc-focus); outline-offset: 2px; }
:where(.ui-edc) svg {
  display: block;
  width: 16px;
  height: 16px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ---------- The record, heading the card ---------- */

.ui-edc__record { display: grid; padding: 12px 16px; border-bottom: 0.5px solid var(--ui-edc-line); }
.ui-edc__ref { display: flex; align-items: center; gap: 8px; min-width: 0; }
/* The status gives way first, then the reference – the amount never does */
.ui-edc__id { flex: 0 1 auto; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 15px; font-weight: 500; line-height: 24px; color: var(--ui-edc-strong); }
.ui-edc__status {
  flex: 0 100 auto;
  min-width: 0;
  overflow: hidden;
  padding: 2px 6px;
  border-radius: var(--aui-radius-sm, 5px);
  background: var(--ui-edc-warn-bg);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: var(--ui-edc-warn);
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ui-edc__amount {
  flex: none;
  margin-left: auto;
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
  font-variant-numeric: tabular-nums;
  color: var(--ui-edc-strong);
}
.ui-edc__account { overflow-wrap: anywhere; font-size: 12px; line-height: 16px; color: var(--ui-edc-text); }

/* ---------- The email: only this part changes height ---------- */

.ui-edc__outer { position: relative; overflow: hidden; overflow: clip; }
/* The recipient menu may reach out of the card while it's open – the height doesn't move then */
.ui-edc__outer[data-menu] { overflow: visible; z-index: 2; }
.ui-edc__outer[data-smooth] { transition: height 360ms var(--ui-edc-ease); }

.ui-edc__draft { animation: ui-edc-in 320ms var(--ui-edc-ease) both; transition: opacity 220ms ease; }
.ui-edc__draft[data-sending] { opacity: 0.6; pointer-events: none; }

.ui-edc__meta {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 10px 16px;
  border-bottom: 0.5px solid var(--ui-edc-line);
}
.ui-edc__to { position: relative; display: flex; align-items: center; gap: 8px; min-width: 0; }
.ui-edc__label { flex: none; font-size: 13px; color: var(--ui-edc-muted); }
/* Recipient: the button-switch look – a hairline, the address in gray */
.ui-edc__recipient {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  height: 28px;
  padding: 0 6px 0 10px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  box-shadow: inset 0 0 0 0.5px var(--ui-edc-line);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  color: var(--ui-edc-ink);
  transition: background-color 160ms ease;
}
.ui-edc__recipient:hover,
.ui-edc__recipient[aria-expanded="true"] { background: var(--ui-edc-wash); }
/* A long name shortens; the address gives way before it */
.ui-edc__name { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ui-edc__email { flex: 0 100 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-weight: 400; color: var(--ui-edc-muted); }
.ui-edc__recipient svg { color: var(--ui-edc-icon); transition: transform 220ms var(--ui-edc-ease); }
.ui-edc__recipient[aria-expanded="true"] svg { transform: rotate(180deg); }

/* Recipient menu: a white popover */
.ui-edc__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 26px;
  z-index: 5;
  display: grid;
  gap: 2px;
  width: 260px;
  max-width: calc(100cqw - 40px);
  max-height: 288px;
  overflow-y: auto;
  overscroll-behavior: contain;
  margin: 0;
  padding: 4px;
  list-style: none;
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--aui-overlay, var(--ui-edc-card));
  box-shadow: var(--ui-edc-shadow-pop);
  animation: ui-edc-menu 200ms var(--ui-edc-ease) both;
  transform-origin: top left;
}
.ui-edc__menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 6px 8px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  text-align: left;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-edc-ink);
}
.ui-edc__menu button:hover { background: var(--ui-edc-fill); }
.ui-edc__avatar {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 6px;
  background: var(--ui-edc-fill);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--ui-edc-text);
}
.ui-edc__menu-text { display: grid; flex: 1; min-width: 0; overflow-wrap: anywhere; }
.ui-edc__menu-text small { overflow: hidden; font-size: 12px; line-height: 16px; white-space: nowrap; text-overflow: ellipsis; color: var(--ui-edc-muted); }
.ui-edc__tick { color: var(--ui-edc-accent); stroke-width: 1.8; }

/* Attachment */
.ui-edc__file {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 13px;
  white-space: nowrap;
  color: var(--ui-edc-text);
}
.ui-edc__file > svg { color: var(--ui-edc-icon); }
.ui-edc__file-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ui-edc__file button {
  display: grid;
  place-items: center;
  flex: none;
  width: 24px;
  height: 24px;
  margin-left: -2px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  color: var(--ui-edc-icon);
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-edc__file button svg { width: 14px; height: 14px; }
.ui-edc__file button:hover { background: var(--ui-edc-wash); color: var(--ui-edc-ink); }
.ui-edc__attach {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  height: 28px;
  padding: 0 8px 0 6px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  font-size: 13px;
  white-space: nowrap;
  color: var(--ui-edc-text);
  transition: background-color 160ms ease, color 160ms ease;
  animation: ui-edc-fade 220ms ease both;
}
.ui-edc__attach svg { color: var(--ui-edc-icon); }
.ui-edc__attach:hover { background: var(--ui-edc-wash); color: var(--ui-edc-ink); }

/* Body */
.ui-edc__body { padding: 14px 16px 2px; }
.ui-edc__text {
  margin: -4px -6px;
  padding: 4px 6px;
  border-radius: calc(var(--aui-radius, 7px) - 1px);
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-edc-ink);
  white-space: pre-line;
  overflow-wrap: anywhere;
  cursor: text;
  transition: background-color 160ms ease;
  animation: ui-edc-fade 280ms ease both;
}
.ui-edc__text:hover { background: var(--ui-edc-wash); }
.ui-edc__text a {
  color: var(--ui-edc-strong);
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: var(--ui-edc-faint);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: text-decoration-color 160ms ease;
}
.ui-edc__text a:hover { text-decoration-color: currentColor; }
.ui-edc__edit {
  display: block;
  width: calc(100% + 12px);
  margin: -4px -6px;
  padding: 4px 6px;
  border: 0;
  border-radius: calc(var(--aui-radius, 7px) - 1px);
  background: var(--ui-edc-wash);
  box-shadow: inset 0 0 0 0.5px var(--ui-edc-line);
  outline: none;
  resize: none;
  overflow: hidden;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-edc-strong);
  caret-color: var(--ui-edc-accent);
}

/* Tones and the pencil */
.ui-edc__tune {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px 14px 16px;
}
.ui-edc__tones { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; min-width: 0; }
.ui-edc__tones button {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 4px 10px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  box-shadow: inset 0 0 0 0.5px var(--ui-edc-line);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  color: var(--ui-edc-text);
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-edc__tones button:hover { background: var(--ui-edc-wash); color: var(--ui-edc-ink); }
.ui-edc__tones button[aria-pressed="true"] { background: var(--ui-edc-fill); color: var(--ui-edc-ink); }
/* Edit: a ghost icon button */
.ui-edc__tones .ui-edc__edit-btn {
  justify-content: center;
  width: 28px;
  margin-left: 4px;
  padding: 0;
  box-shadow: none;
  color: var(--ui-edc-icon);
}
.ui-edc__tones .ui-edc__edit-btn:hover { color: var(--ui-edc-ink); }
.ui-edc__tones .ui-edc__edit-btn[aria-pressed="true"] { background: var(--ui-edc-fill); color: var(--ui-edc-ink); }
.ui-edc__hint { flex: none; font-size: 12px; line-height: 16px; white-space: nowrap; color: var(--ui-edc-faint); }

/* ---------- Receipt after send / discard ---------- */

.ui-edc__receipt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px 12px 16px;
  font-size: 13px;
  color: var(--ui-edc-text);
  animation: ui-edc-in 320ms var(--ui-edc-ease) both;
}
.ui-edc__receipt b { font-weight: 500; color: var(--ui-edc-strong); }
.ui-edc__receipt-icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex: none;
  border-radius: 6px;
  background: var(--ui-edc-fill);
  color: var(--ui-edc-icon);
}
.ui-edc__receipt-icon[data-tone="ok"] { background: var(--ui-edc-ok-bg); color: var(--ui-edc-ok); }
.ui-edc__receipt-icon svg { width: 14px; height: 14px; stroke-width: 2; }
.ui-edc__receipt-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ui-edc__undo {
  flex: none;
  height: 28px;
  padding: 0 10px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  font-size: 13px;
  font-weight: 500;
  color: var(--ui-edc-ink);
  transition: background-color 160ms ease;
}
.ui-edc__undo:hover { background: var(--ui-edc-wash); }

/* ---------- The last row ---------- */

/* Discard and Send drop to their own row when the row runs out of room */
.ui-edc__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px 10px 10px 16px;
  border-top: 0.5px solid var(--ui-edc-line);
}
.ui-edc__agent { min-width: 0; overflow: hidden; font-size: 13px; white-space: nowrap; text-overflow: ellipsis; color: var(--ui-edc-ink); }
.ui-edc__badge {
  flex: none;
  padding: 2px 6px;
  border-radius: var(--aui-radius-sm, 5px);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
  animation: ui-edc-fade 260ms ease both;
}
.ui-edc__badge[data-tone="ok"] { background: var(--ui-edc-ok-bg); color: var(--ui-edc-ok); }
.ui-edc__badge[data-tone="muted"] { background: var(--ui-edc-fill); color: var(--ui-edc-text); }
.ui-edc__buttons { display: flex; flex: none; gap: 8px; margin-left: auto; }
.ui-edc__secondary,
.ui-edc__primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: calc(var(--aui-radius, 7px) - 1px);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms var(--ui-edc-ease);
}
/* Discard: white with the card's hairline shadow */
.ui-edc__secondary { background: var(--ui-edc-card); box-shadow: var(--ui-edc-shadow); color: var(--ui-edc-strong); }
.ui-edc__secondary:hover:not(:disabled) { background: linear-gradient(var(--ui-edc-wash), var(--ui-edc-wash)), var(--ui-edc-card); }
/* Send: the dark chip */
.ui-edc__primary { background: var(--ui-edc-solid); color: var(--ui-edc-on-solid); }
.ui-edc__primary:hover:not(:disabled) { background: var(--ui-edc-strong); }
.ui-edc__secondary:disabled, .ui-edc__primary:disabled { cursor: default; }
.ui-edc__secondary:not(:disabled):active, .ui-edc__primary:not(:disabled):active { transform: scale(0.97); }
.ui-edc__spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid color-mix(in srgb, var(--ui-edc-on-solid) 30%, transparent);
  border-top-color: var(--ui-edc-on-solid);
  border-radius: 50%;
  animation: ui-edc-spin 700ms linear infinite;
}

@keyframes ui-edc-in { from { opacity: 0; transform: translateY(4px); } }
@keyframes ui-edc-fade { from { opacity: 0; } }
@keyframes ui-edc-menu { from { opacity: 0; transform: scale(0.97) translateY(-4px); } }
@keyframes ui-edc-spin { to { transform: rotate(360deg); } }

/* Narrow containers (phones): the address, hint and author step back */
@container (max-width: 440px) {
  .ui-edc__email, .ui-edc__hint { display: none; }
}
@container (max-width: 380px) {
  .ui-edc__record { padding: 12px 14px; }
  .ui-edc__meta, .ui-edc__tune, .ui-edc__receipt, .ui-edc__foot { padding-left: 14px; }
  .ui-edc__body { padding-left: 14px; padding-right: 14px; }
  .ui-edc[data-phase="draft"] .ui-edc__agent,
  .ui-edc[data-phase="sending"] .ui-edc__agent { display: none; }
  .ui-edc__tones { gap: 2px; }
  .ui-edc__tones button { padding: 4px 8px; }
  .ui-edc__tones .ui-edc__edit-btn { margin-left: 2px; }
}
/* Touch screens: taller hit targets */
@media (pointer: coarse) {
  .ui-edc__recipient, .ui-edc__tones button, .ui-edc__secondary, .ui-edc__primary, .ui-edc__undo, .ui-edc__attach { height: 34px; }
  .ui-edc__tones .ui-edc__edit-btn { width: 34px; }
  .ui-edc__file button { width: 30px; height: 30px; }
  .ui-edc__menu button { padding: 9px 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-edc__outer[data-smooth] { transition: none; }
  .ui-edc__draft, .ui-edc__receipt, .ui-edc__text, .ui-edc__badge, .ui-edc__menu, .ui-edc__attach { animation: none; }
}

/* Text fields: no focus box while typing – also against global :focus-visible rules of the host page */
.ui-edc input:not([type="checkbox"]):not([type="radio"]):focus-visible,
.ui-edc textarea:focus-visible,
.ui-edc [contenteditable]:focus-visible { outline: none; }

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-edc {
  --ui-edc-card: #1c1c1e;
  --ui-edc-strong: #ffffff;
  --ui-edc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-edc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-edc-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-edc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.3));
  --ui-edc-icon: var(--aui-muted, rgba(255, 255, 255, 0.5));
  --ui-edc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-edc-fill: rgba(255, 255, 255, 0.08);
  --ui-edc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-edc-solid: var(--aui-primary, rgba(255, 255, 255, 0.92));
  --ui-edc-on-solid: var(--aui-on-primary, #161618);
  --ui-edc-accent: var(--aui-blue, #4fb0fe);
  --ui-edc-ok: var(--aui-green, #5fc88a);
  --ui-edc-ok-bg: color-mix(in srgb, var(--aui-green, #7dcf9f) 14%, transparent);
  --ui-edc-warn: var(--aui-amber, #e6c24d);
  --ui-edc-warn-bg: color-mix(in srgb, var(--aui-amber, #e6c24d) 14%, transparent);
  --ui-edc-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --ui-edc-shadow-pop: var(--aui-shadow-popover, 0 0 0 0.5px rgba(255, 255, 255, 0.12), 0 12px 28px -10px rgba(0, 0, 0, 0.6));
  --ui-edc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
:where(.dark, [data-theme="dark"]) .ui-edc__primary:hover:not(:disabled) { background: #ffffff; }
`;
