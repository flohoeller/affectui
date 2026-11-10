"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

/*
 * Comment Thread (Clean) – one comment with its replies, including an assistant that reports what it did, in a single
 * self-contained file. Clean style: no tray – one white card with hairline shadows: the heading on top, the
 * conversation in the middle and the reply field lying right in the card as its last row.
 * Assistant replies can fold open to show the details; replying shows a shimmering thinking state
 * while an async answer comes back. The styles are injected below, so no extra files are needed.
 */

export type ThreadAuthor = { name: string; avatar?: ReactNode | string; assistant?: boolean };

export type ThreadMessage = {
  id: string;
  author: ThreadAuthor;
  createdAt: Date | number;
  text: string;
  /** Assistant replies: a short status line that folds open to show these details */
  status?: string;
  details?: string[];
};

export type CommentThreadProps = {
  title?: string;
  messages: ThreadMessage[];
  currentUser: ThreadAuthor;
  /** The assistant that answers – used for the thinking state */
  assistant?: ThreadAuthor;
  /**
   * Called with every new reply. Return a message (or a promise of one) to let the assistant answer;
   * return nothing to just post the reply.
   */
  onReply?: (text: string) => ThreadMessage | Promise<ThreadMessage | void> | void;
  onClose?: () => void;
  className?: string;
};

function ago(time: number, now: number) {
  const s = Math.max(0, Math.round((now - time) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return d < 365 ? `${Math.round(d / 30)}mo ago` : `${Math.round(d / 365)}y ago`;
}

// 1284 → "1,284"
const count = new Intl.NumberFormat("en");

/** Two initials from whole letters – skips emoji and stray spaces, so "🦊 Fox" gives "F" */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => Array.from(w).find((c) => /[\p{L}\p{N}]/u.test(c)))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function CommentThread({
  title = "Comment",
  messages: initial,
  currentUser,
  assistant,
  onReply,
  onClose,
  className,
}: CommentThreadProps) {
  const [messages, setMessages] = useState(initial);
  // Assistant replies that are there from the start come in a beat after the comment above them
  const [firstIds] = useState(() => new Set(initial.filter((m) => m.author.assistant).map((m) => m.id)));
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const listRef = useRef<HTMLDivElement>(null);
  const morphRef = useSmoothHeight(listRef);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  // Follow the conversation as it grows
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, thinking]);

  const send = async () => {
    const text = draft.trim();
    if (!text || thinking) return;
    setDraft("");
    setNow(Date.now());
    lockHeight(true);
    setMessages((m) => [...m, { id: `m-${Date.now()}`, author: currentUser, createdAt: Date.now(), text }]);
    const answer = onReply?.(text);
    if (!answer) return;
    setThinking(true);
    try {
      const reply = await answer;
      if (reply) setMessages((m) => [...m, { ...reply, createdAt: Date.now() }]);
    } finally {
      setThinking(false);
      setNow(Date.now());
    }
  };

  // New messages keep the card at its height and the conversation scrolls up; folding details lets it grow again
  const lockHeight = (on: boolean) => {
    const list = listRef.current;
    if (list) list.style.maxHeight = on ? `${list.offsetHeight}px` : "";
  };

  const toggle = (id: string) => {
    lockHeight(false);
    setOpen((o) => {
      const next = new Set(o);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <style href="ui-comment-thread-clean" precedence="default">
        {css}
      </style>
      <section className={["ui-ctc", className].filter(Boolean).join(" ")} aria-label={title}>
        <header className="ui-ctc__head">
          <h3 className="ui-ctc__title" title={title} dir="auto">
            {title}
          </h3>
          <span className="ui-ctc__count">
            {count.format(messages.length)} {messages.length === 1 ? "message" : "messages"}
          </span>
          {onClose && (
            <button type="button" className="ui-ctc__icon-btn" aria-label="Close comment" onClick={onClose}>
              <Icon d="m4.5 4.5 7 7M11.5 4.5l-7 7" />
            </button>
          )}
        </header>

        {/* Only the conversation glides to its new height – the reply row below always stays in view */}
        <div className="ui-ctc__morph" ref={morphRef}>
          <div className="ui-ctc__scroll" ref={listRef} aria-live="polite">
            {messages.map((m) => {
              const isOpen = open.has(m.id);
              const command = /^\/edit\b/i.test(m.text.trim());
              return (
                <article key={m.id} className="ui-ctc__msg" data-delayed={firstIds.has(m.id) || undefined}>
                  <div className="ui-ctc__meta">
                    <Avatar author={m.author} />
                    <span className="ui-ctc__name" title={m.author.name} dir="auto">
                    {m.author.name}
                  </span>
                    <time className="ui-ctc__time" dateTime={new Date(m.createdAt).toISOString()}>
                      {ago(+m.createdAt, now)}
                    </time>
                  </div>
                  {m.text && (
                    <p className="ui-ctc__text" dir="auto">
                      {command ? (
                        <>
                          <span className="ui-ctc__command">/edit</span> {m.text.trim().replace(/^\/edit\s*/i, "")}
                        </>
                      ) : (
                        m.text
                      )}
                    </p>
                  )}
                  {m.status && (
                    <div className="ui-ctc__status">
                      <button
                        type="button"
                        className="ui-ctc__status-btn"
                        aria-expanded={isOpen}
                        disabled={!m.details?.length}
                        onClick={() => toggle(m.id)}
                      >
                        <svg viewBox="0 0 16 16" className="ui-ctc__check" aria-hidden="true">
                          <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm8.9-1.2a.5.5 0 0 0-.8-.6L7.44 9.23 6.35 8.15a.5.5 0 1 0-.7.7l1.5 1.5a.5.5 0 0 0 .76-.06l2.5-3.5Z" />
                        </svg>
                        <span className="ui-ctc__status-text" title={m.status} dir="auto">
                          {m.status}
                        </span>
                        {!!m.details?.length && (
                          <span className="ui-ctc__chevron">
                            <Icon d="m5 6.5 3 3 3-3" />
                          </span>
                        )}
                      </button>
                      {!!m.details?.length && (
                        <div className="ui-ctc__details" data-open={isOpen || undefined} inert={!isOpen}>
                          <ul>
                            {m.details.map((d, i) => (
                              <li key={i} dir="auto" style={{ "--i": i } as CSSProperties}>
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
            {thinking && assistant && (
              <article className="ui-ctc__msg" aria-label={`${assistant.name} is thinking`}>
                <div className="ui-ctc__meta">
                  <Avatar author={assistant} />
                  <span className="ui-ctc__name">{assistant.name}</span>
                </div>
                <p className="ui-ctc__text">
                  <span className="ui-ctc__thinking" data-text="Thinking…">
                    Thinking…
                  </span>
                </p>
              </article>
            )}
          </div>
        </div>

        {/* The reply row lies right in the card – no own fill, no line above */}
        <form
          className="ui-ctc__composer"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            className="ui-ctc__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={assistant ? `Reply, or ask @${assistant.name}…` : "Add comment…"}
            aria-label="Reply"
          />
          <button type="submit" className="ui-ctc__send" aria-label="Send reply" disabled={!draft.trim() || thinking}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 12.5v-9M4.25 7.25 8 3.5l3.75 3.75" />
            </svg>
          </button>
        </form>
      </section>
    </>
  );
}

function Avatar({ author }: { author: ThreadAuthor }) {
  // A picture that fails to load falls back to the initials
  const [failed, setFailed] = useState(false);
  if (author.avatar && typeof author.avatar !== "string") return <span className="ui-ctc__avatar">{author.avatar}</span>;
  if (typeof author.avatar === "string" && !failed) {
    return <img className="ui-ctc__avatar" src={author.avatar} alt="" width={20} height={20} loading="lazy" onError={() => setFailed(true)} />;
  }
  return (
    <span className="ui-ctc__avatar ui-ctc__avatar--initials" aria-hidden="true">
      {initials(author.name)}
    </span>
  );
}

/** A simple assistant mark: a full circle with a blue-to-violet gradient – pass your own logo as `avatar` instead */
export function AssistantMark() {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fill`} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5b9dff" />
          <stop offset="0.5" stopColor="#2f6bff" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill={`url(#${id}-fill)`} />
    </svg>
  );
}

/** 16px icons with thin, round lines */
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" className="ui-ctc__glyph" aria-hidden="true">
    <path d={d} />
  </svg>
);

/**
 * Lets a box glide to the height of its content instead of jumping: the outer box follows the inner one
 * with a height transition whenever the content grows or shrinks.
 */
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
    // Transitions switch on after the first measurement, so the first render doesn't animate
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
/* Colors and motion as variables – override them on .ui-ctc */
.ui-ctc {
  --ui-ctc-card: var(--aui-surface, #ffffff);
  --ui-ctc-strong: var(--aui-ink, #000000);
  --ui-ctc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-ctc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-ctc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-ctc-faint: var(--aui-placeholder, rgba(0, 0, 0, 0.27));
  --ui-ctc-icon: var(--aui-muted, rgba(0, 0, 0, 0.447));
  --ui-ctc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-ctc-tree: rgba(0, 0, 0, 0.1);
  --ui-ctc-fill: rgba(0, 0, 0, 0.06);
  --ui-ctc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-ctc-solid: var(--aui-primary, rgba(0, 0, 0, 0.88));
  --ui-ctc-on-solid: var(--aui-on-primary, #fcfcfc);
  --ui-ctc-accent: rgba(0, 96, 226, 0.765);
  --ui-ctc-ok: var(--aui-success, #1e8a4f);
  --ui-ctc-shine: rgba(255, 255, 255, 0.82);
  --ui-ctc-avatar-ring: rgba(0, 0, 0, 0.08);
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-ctc-shadow: var(--aui-shadow-card, 0 0 0 0.5px var(--aui-border, rgba(0, 0, 0, 0.06)), 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  --ui-ctc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-ctc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
  border-radius: var(--aui-radius-lg, 10px);
  background: var(--ui-ctc-card);
  box-shadow: var(--ui-ctc-shadow);
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  color: var(--ui-ctc-ink);
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}
.ui-ctc *, .ui-ctc *::before, .ui-ctc *::after { box-sizing: border-box; }
:where(.ui-ctc) button {
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
:where(.ui-ctc) svg { display: block; flex: none; }
.ui-ctc button:focus-visible { outline: 2px solid var(--ui-ctc-focus); outline-offset: 2px; }
.ui-ctc__glyph { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }

/* ---------- Header ---------- */
.ui-ctc__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  padding: 10px 10px 10px 16px;
  border-bottom: 0.5px solid var(--ui-ctc-line);
}
/* A long title takes two lines at most – the count and close stay in place */
.ui-ctc__title { display: -webkit-box; min-width: 0; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow-wrap: anywhere; margin: 0; font-size: 13px; font-weight: 500; line-height: 20px; color: var(--ui-ctc-strong); }
.ui-ctc__count { flex: none; margin-right: auto; white-space: nowrap; font-size: 12px; line-height: 16px; color: var(--ui-ctc-muted); font-variant-numeric: tabular-nums; }
/* Close: a ghost icon button */
.ui-ctc__icon-btn {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  color: var(--ui-ctc-icon);
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-ctc__icon-btn:hover { background: var(--ui-ctc-wash); color: var(--ui-ctc-ink); }

/* ---------- The conversation ---------- */
.ui-ctc__scroll {
  display: grid;
  gap: 16px;
  align-content: start;
  min-height: var(--ui-ctc-min-height, 0px);
  max-height: var(--ui-ctc-max-height, 340px);
  padding: 16px 16px 12px;
  overflow-y: auto;
  scrollbar-width: none;
  /* Soft edges at the top and towards the reply row, so nothing ends in a hard cut */
  -webkit-mask-image: linear-gradient(transparent, #000 12px, #000 calc(100% - 10px), transparent);
  mask-image: linear-gradient(transparent, #000 12px, #000 calc(100% - 10px), transparent);
}
.ui-ctc__scroll::-webkit-scrollbar { display: none; }
/* Each message builds up piece by piece: name row, text, status – the assistant's first reply a beat later */
.ui-ctc__msg { --ui-ctc-d: 0ms; min-width: 0; }
.ui-ctc__msg[data-delayed] { --ui-ctc-d: 700ms; }
.ui-ctc__msg > * { animation: ui-ctc-in 420ms var(--ui-ctc-ease) both; animation-delay: var(--ui-ctc-d); }
.ui-ctc__msg > :nth-child(2) { animation-delay: calc(var(--ui-ctc-d) + 80ms); }
.ui-ctc__msg > :nth-child(3) { animation-delay: calc(var(--ui-ctc-d) + 160ms); }
.ui-ctc__meta { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ui-ctc__avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
}
img.ui-ctc__avatar { box-shadow: 0 0 0 0.5px var(--ui-ctc-avatar-ring); }
.ui-ctc__avatar svg { width: 100%; height: 100%; }
.ui-ctc__avatar--initials { background: var(--ui-ctc-fill); font-size: 9px; font-weight: 500; line-height: 1; color: var(--ui-ctc-text); }
.ui-ctc__name { min-width: 0; overflow: hidden; font-size: 13px; font-weight: 500; line-height: 20px; white-space: nowrap; text-overflow: ellipsis; color: var(--ui-ctc-strong); }
.ui-ctc__time { flex: none; margin-left: auto; font-size: 12px; line-height: 16px; white-space: nowrap; color: var(--ui-ctc-faint); font-variant-numeric: tabular-nums; }
/* Text and status line up with the name, not the avatar */
.ui-ctc__text { margin: 4px 0 0 28px; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; white-space: pre-line; text-align: start; color: var(--ui-ctc-ink); }
/* "/edit": a small gray tag */
.ui-ctc__command {
  display: inline-block;
  margin-right: 1px;
  padding: 0 5px;
  border-radius: var(--aui-radius-sm, 5px);
  background: var(--aui-subtle, var(--ui-ctc-fill));
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: var(--ui-ctc-text);
}

/* Status: a ghost row – a green check, the line, and a chevron to fold the details open */
.ui-ctc__status { margin: 4px 0 0 22px; }
.ui-ctc__status-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  height: 28px;
  padding: 0 4px 0 6px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: var(--ui-ctc-ink);
  transition: background-color 160ms ease;
}
.ui-ctc__status-btn:hover:not(:disabled) { background: var(--ui-ctc-wash); }
.ui-ctc__status-btn:disabled { cursor: default; }
.ui-ctc__status-text { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ui-ctc__check { width: 16px; height: 16px; fill: var(--ui-ctc-ok); }
.ui-ctc__chevron { display: grid; flex: none; color: var(--ui-ctc-icon); transition: transform 260ms var(--ui-ctc-ease), color 160ms ease; }
.ui-ctc__status-btn:hover .ui-ctc__chevron { color: var(--ui-ctc-ink); }
.ui-ctc__status-btn[aria-expanded="true"] .ui-ctc__chevron { transform: rotate(180deg); }
.ui-ctc__details {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 320ms var(--ui-ctc-ease);
}
.ui-ctc__details[data-open] { grid-template-rows: 1fr; }
.ui-ctc__details ul {
  min-height: 0;
  overflow: hidden;
  margin: 0;
  padding: 0 0 0 28px;
  list-style: none;
}
.ui-ctc__details li {
  position: relative;
  margin-top: 4px;
  font-size: 13px;
  line-height: 20px;
  overflow-wrap: anywhere;
  text-align: start;
  color: var(--ui-ctc-text);
  /* Closing: lines fade out quickly while the box folds */
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 160ms ease, transform 220ms var(--ui-ctc-ease);
}
/* Opening: lines come in one after another */
.ui-ctc__details[data-open] li {
  opacity: 1;
  transform: none;
  transition-duration: 320ms, 420ms;
  transition-delay: calc(60ms + var(--i, 0) * 60ms);
}
/* Thin tree lines: each line gets its own corner – down on the axis of the check icon, then a rounded turn right */
.ui-ctc__details li:first-child { margin-top: 2px; }
.ui-ctc__details li::before {
  content: "";
  position: absolute;
  left: -14.5px;
  top: -3px;
  width: 9px;
  height: 13.5px;
  border-left: 1px solid var(--ui-ctc-tree);
  border-bottom: 1px solid var(--ui-ctc-tree);
  border-bottom-left-radius: 5px;
}
/* The first branch starts with a small gap under the check icon */
.ui-ctc__details li:first-child::before { top: -6px; height: 16.5px; }

/* "Thinking…": a lighter band sweeps across the gray text */
.ui-ctc__thinking { position: relative; display: inline-block; color: var(--ui-ctc-muted); }
.ui-ctc__thinking::after {
  content: attr(data-text);
  content: attr(data-text) / "";
  position: absolute;
  inset: 0;
  white-space: nowrap;
  color: transparent;
  background: linear-gradient(90deg, transparent 38%, var(--ui-ctc-shine) 50%, transparent 62%) 100% 0 / 300% 100% no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  animation: ui-ctc-sweep 1.4s linear infinite;
  pointer-events: none;
}

/* ---------- Reply row: lies right in the card ---------- */
.ui-ctc__composer {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 4px 10px 10px 16px;
}
.ui-ctc__input {
  flex: 1;
  min-width: 0;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-ctc-strong);
  caret-color: var(--ui-ctc-accent);
}
.ui-ctc__input::placeholder { color: var(--ui-ctc-faint); opacity: 1; }
/* Send: the dark chip – a quiet gray tile until there is something to send */
.ui-ctc__send {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  background: var(--ui-ctc-solid);
  color: var(--ui-ctc-on-solid);
  transition: background-color 180ms ease, color 180ms ease, transform 160ms var(--ui-ctc-ease);
}
.ui-ctc__send:disabled { background: var(--ui-ctc-fill); color: var(--ui-ctc-faint); cursor: default; }
.ui-ctc__send:not(:disabled):active { transform: scale(0.94); }
.ui-ctc__send svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }

@keyframes ui-ctc-in { from { opacity: 0; transform: translateY(4px); } }
@keyframes ui-ctc-sweep { from { background-position: 100% 0; } to { background-position: 0% 0; } }

/* Height changes glide instead of jumping */
.ui-ctc__morph { flex: none; overflow: hidden; }
.ui-ctc__morph[data-smooth] { transition: height 380ms var(--ui-ctc-ease); }

/* Narrow containers: a little less padding */
@container (max-width: 340px) {
  .ui-ctc__head { padding-left: 12px; }
  .ui-ctc__scroll { padding-left: 12px; padding-right: 12px; }
  .ui-ctc__composer { padding-left: 12px; }
}
/* Touch screens: taller hit targets */
@media (pointer: coarse) {
  .ui-ctc__icon-btn, .ui-ctc__send { width: 34px; height: 34px; }
  .ui-ctc__status-btn { height: 34px; }
  .ui-ctc__input { height: 34px; }
  .ui-ctc__details li:first-child::before { top: -9px; height: 19.5px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-ctc__msg > *, .ui-ctc__thinking::after { animation: none; }
  .ui-ctc__details, .ui-ctc__details li, .ui-ctc__chevron, .ui-ctc__morph[data-smooth] { transition: none; }
}

/* Text fields: no focus box while typing – also against global :focus-visible rules of the host page */
.ui-ctc input:not([type="checkbox"]):not([type="radio"]):focus-visible,
.ui-ctc textarea:focus-visible,
.ui-ctc [contenteditable]:focus-visible { outline: none; }

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-ctc {
  --ui-ctc-card: var(--aui-surface, #1c1c1e);
  --ui-ctc-strong: var(--aui-ink, #ffffff);
  --ui-ctc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-ctc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-ctc-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-ctc-faint: var(--aui-placeholder, rgba(255, 255, 255, 0.3));
  --ui-ctc-icon: var(--aui-muted, rgba(255, 255, 255, 0.5));
  --ui-ctc-line: var(--aui-border, rgba(255, 255, 255, 0.08));
  --ui-ctc-tree: rgba(255, 255, 255, 0.14);
  --ui-ctc-fill: rgba(255, 255, 255, 0.08);
  --ui-ctc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.04));
  --ui-ctc-solid: var(--aui-primary, rgba(255, 255, 255, 0.92));
  --ui-ctc-on-solid: var(--aui-on-primary, #161618);
  --ui-ctc-accent: var(--aui-blue, #4fb0fe);
  --ui-ctc-ok: var(--aui-green, #5fc88a);
  --ui-ctc-shine: #ffffff;
  --ui-ctc-avatar-ring: rgba(255, 255, 255, 0.1);
  --ui-ctc-shadow: var(--aui-shadow-card, 0 0 0 0.5px var(--aui-border, rgba(255, 255, 255, 0.1)), 0 1px 2px 0 rgba(0, 0, 0, 0.4));
  --ui-ctc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
