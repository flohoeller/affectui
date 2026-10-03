"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";

/*
 * Comments Panel – a comment feed with filters, runnable /edit commands and a composer, in a single self-contained file.
 * Filter by questions or edits, sort, run an edit and undo it, resolve comments, add new ones.
 * The styles are injected below, so no extra files are needed.
 */

export type CommentAuthor = { name: string; avatar?: string };

export type PanelComment = {
  id: string;
  author: CommentAuthor;
  /** When it was written – a Date or a timestamp */
  createdAt: Date | number;
  text: string;
};

export type CommentsPanelProps = {
  comments: PanelComment[];
  /** Who writes new comments */
  currentUser: CommentAuthor;
  title?: string;
  /** Runs an /edit command – resolve when done; without it the edit is only marked as applied */
  onRunEdit?: (comment: PanelComment) => Promise<void> | void;
  onAdd?: (comment: PanelComment) => void;
  /** Shows a close button in the header */
  onClose?: () => void;
  className?: string;
};

type Tab = "all" | "questions" | "edits";
type EditState = "idle" | "running" | "done";

const isEdit = (c: PanelComment) => /^\/edit\b/i.test(c.text.trim());
const isQuestion = (c: PanelComment) => !isEdit(c) && c.text.trim().endsWith("?");

function ago(time: number, now: number) {
  const s = Math.max(0, Math.round((now - time) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function CommentsPanel({
  comments: initial,
  currentUser,
  title = "Comments",
  onRunEdit,
  onAdd,
  onClose,
  className,
}: CommentsPanelProps) {
  const [comments, setComments] = useState(initial);
  const [tab, setTab] = useState<Tab>("all");
  const [newest, setNewest] = useState(true);
  const [menu, setMenu] = useState(false);
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const morphRef = useSmoothHeight(listRef);

  // Keep "2min ago" honest while the panel is open
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const away = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [menu]);

  const open = comments.filter((c) => !resolved.has(c.id));
  const pendingEdits = open.filter((c) => isEdit(c) && edits[c.id] !== "done").length;
  const counts = { all: open.length, questions: open.filter(isQuestion).length, edits: pendingEdits };

  const shown = useMemo(() => {
    const list = comments.filter((c) => tab === "all" || (tab === "questions" ? isQuestion(c) : isEdit(c)));
    return [...list].sort((a, b) => (+b.createdAt - +a.createdAt) * (newest ? 1 : -1));
  }, [comments, tab, newest]);

  const run = async (c: PanelComment) => {
    setEdits((e) => ({ ...e, [c.id]: "running" }));
    try {
      await (onRunEdit ? onRunEdit(c) : new Promise((r) => setTimeout(r, 1100)));
      setEdits((e) => ({ ...e, [c.id]: "done" }));
    } catch {
      setEdits((e) => ({ ...e, [c.id]: "idle" }));
    }
  };

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const comment: PanelComment = { id: `c-${Date.now()}`, author: currentUser, createdAt: Date.now(), text };
    setComments((list) => [comment, ...list]);
    setDraft("");
    setTab("all");
    setNewest(true);
    setNow(Date.now());
    onAdd?.(comment);
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <>
      <style href="ui-comments-panel" precedence="default">
        {css}
      </style>
      <section className={["ui-cp", className].filter(Boolean).join(" ")} aria-label={title}>
        <header className="ui-cp__head">
          <h3 className="ui-cp__title">{title}</h3>
          {onClose && (
            <button type="button" className="ui-cp__icon-btn" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>
              <Icon d="m4 4 8 8M12 4l-8 8" />
            </button>
          )}
        </header>

        <div className="ui-cp__card">
          <div className="ui-cp__bar">
            <div className="ui-cp__tabs" role="tablist" aria-label="Filter comments">
              {(["all", "questions", "edits"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  className="ui-cp__tab"
                  onClick={() => setTab(t)}
                >
                  {{ all: "All", questions: "Questions", edits: "Edits" }[t]}
                  {t === "edits" && counts.edits > 0 && <span className="ui-cp__badge">{counts.edits}</span>}
                </button>
              ))}
            </div>
            <div className="ui-cp__sort" ref={menuRef}>
              <button
                type="button"
                className="ui-cp__icon-btn"
                aria-label="Sort comments"
                aria-haspopup="menu"
                aria-expanded={menu}
                onClick={() => setMenu((m) => !m)}
              >
                <Icon d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3" />
              </button>
              {menu && (
                <div className="ui-cp__menu" role="menu">
                  {[
                    { label: "Newest first", value: true },
                    { label: "Oldest first", value: false },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      role="menuitemradio"
                      aria-checked={newest === o.value}
                      className="ui-cp__menu-item"
                      onClick={() => {
                        setNewest(o.value);
                        setMenu(false);
                      }}
                    >
                      {o.label}
                      {newest === o.value && <Icon d="m3.5 8.5 3 3 6-7" size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ui-cp__morph" ref={morphRef}>
          <ul className="ui-cp__list" ref={listRef} aria-live="polite">
            {shown.length === 0 && (
              <li className="ui-cp__empty">{tab === "questions" ? "No open questions." : "No edits to run."}</li>
            )}
            {shown.map((c) => {
              const edit = isEdit(c);
              const state = edits[c.id] ?? "idle";
              const isResolved = resolved.has(c.id);
              return (
                <li key={c.id} className="ui-cp__item" data-resolved={isResolved || undefined}>
                  <div className="ui-cp__meta">
                    <Avatar author={c.author} />
                    <span className="ui-cp__name">{c.author.name}</span>
                    <time className="ui-cp__time" dateTime={new Date(c.createdAt).toISOString()}>
                      {ago(+c.createdAt, now)}
                    </time>
                    <button
                      type="button"
                      className="ui-cp__resolve"
                      aria-pressed={isResolved}
                      aria-label={isResolved ? "Reopen comment" : "Resolve comment"}
                      title={isResolved ? "Reopen" : "Resolve"}
                      onClick={() =>
                        setResolved((r) => {
                          const next = new Set(r);
                          if (next.has(c.id)) next.delete(c.id);
                          else next.add(c.id);
                          return next;
                        })
                      }
                    >
                      <Icon d="m3.5 8.5 3 3 6-7" size={14} />
                    </button>
                  </div>
                  <p className="ui-cp__text">
                    {edit ? (
                      <>
                        <span className="ui-cp__command">/Edit</span> {c.text.trim().replace(/^\/edit\s*/i, "")}
                      </>
                    ) : (
                      c.text
                    )}
                  </p>
                  {edit && !isResolved && (
                    <div className="ui-cp__actions">
                      {state === "done" ? (
                        <>
                          <span className="ui-cp__done" role="status">
                            <Icon d="m3.5 8.5 3 3 6-7" size={14} />
                            Edit applied
                          </span>
                          <button type="button" className="ui-cp__link" onClick={() => setEdits((e) => ({ ...e, [c.id]: "idle" }))}>
                            Undo
                          </button>
                        </>
                      ) : (
                        <button type="button" className="ui-cp__btn" disabled={state === "running"} onClick={() => run(c)}>
                          {state === "running" ? (
                            <>
                              <span className="ui-cp__spinner" aria-hidden="true" /> Running…
                            </>
                          ) : (
                            "Run edit"
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          </div>
        </div>

        <form
          className="ui-cp__composer"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Avatar author={currentUser} />
          <input
            className="ui-cp__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment or /edit…"
            aria-label="Add a comment"
          />
          <button type="submit" className="ui-cp__send" aria-label="Send comment" disabled={!draft.trim()}>
            <Icon d="M8 13V3M3.5 7.5 8 3l4.5 4.5" size={14} />
          </button>
        </form>
      </section>
    </>
  );
}

function Avatar({ author }: { author: CommentAuthor }) {
  const initials = author.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return author.avatar ? (
    <img className="ui-cp__avatar" src={author.avatar} alt="" width={22} height={22} loading="lazy" />
  ) : (
    <span className="ui-cp__avatar ui-cp__avatar--initials" aria-hidden="true">
      {initials}
    </span>
  );
}

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
.ui-cp {
  --ui-cp-tray: #f0f0f0;
  --ui-cp-card: #ffffff;
  --ui-cp-line: #f0f0f0;
  --ui-cp-ink: #171717;
  --ui-cp-text: #404040;
  --ui-cp-muted: #8f8f8f;
  --ui-cp-accent: #2f6bff;
  --ui-cp-ok: #1f8a4c;
  --ui-cp-ease: cubic-bezier(0.22, 1, 0.36, 1);
  box-sizing: border-box;
  width: 100%;
  max-width: 400px;
  /* Like the Chat Composer: a gray tray with heading and composer, the white card sits on top of it */
  background: var(--ui-cp-tray);
  border-radius: 20px;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ui-cp-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-cp *, .ui-cp *::before, .ui-cp *::after { box-sizing: border-box; }
.ui-cp button { margin: 0; font: inherit; color: inherit; cursor: pointer; }
.ui-cp button:focus-visible, .ui-cp input:focus-visible { outline: 2px solid var(--ui-cp-accent); outline-offset: 2px; }

.ui-cp__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 6px 10px 6px 18px;
}
.ui-cp__title { margin: 0; font-size: 15px; font-weight: 500; line-height: 22px; }
.ui-cp__icon-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ui-cp-muted) !important;
  transition: background-color 140ms ease, color 140ms ease;
}
.ui-cp__icon-btn:hover { background: rgba(0, 0, 0, 0.05); color: var(--ui-cp-ink) !important; }

.ui-cp__card {
  overflow: hidden;
  background: var(--ui-cp-card);
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.ui-cp__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 12px 14px;
  border-bottom: 1px solid var(--ui-cp-line);
}
.ui-cp__tabs { display: flex; gap: 6px; }
.ui-cp__tab {
  position: relative;
  height: 30px;
  padding: 0 11px;
  border: 0;
  border-radius: 9px;
  background: #f5f5f5;
  font-size: 13px !important;
  color: var(--ui-cp-muted) !important;
  transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
}
.ui-cp__tab:hover { color: var(--ui-cp-ink) !important; }
.ui-cp__tab[aria-selected="true"] {
  background: #fff;
  box-shadow: 0 0 0 1px #e5e5e5, 0 1px 2px rgba(0, 0, 0, 0.04);
  color: var(--ui-cp-ink) !important;
  font-weight: 500;
}
.ui-cp__badge {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--ui-cp-ink);
  box-shadow: 0 0 0 2px #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: #fff;
}
.ui-cp__sort { position: relative; }
.ui-cp__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 5;
  display: grid;
  gap: 2px;
  min-width: 160px;
  padding: 4px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 0 0 1px #e5e5e5, 0 10px 28px -8px rgba(0, 0, 0, 0.18);
  animation: ui-cp-drop 180ms var(--ui-cp-ease);
}
.ui-cp__menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-size: 13px !important;
  text-align: left;
}
.ui-cp__menu-item:hover { background: #f5f5f5; }
.ui-cp__menu-item[aria-checked="true"] { color: var(--ui-cp-accent) !important; font-weight: 500; }

.ui-cp__list {
  max-height: var(--ui-cp-max-height, 360px);
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  scrollbar-width: thin;
}
.ui-cp__item {
  padding: 14px 16px 16px;
  border-top: 1px solid var(--ui-cp-line);
  animation: ui-cp-in 360ms var(--ui-cp-ease) both;
  transition: opacity 220ms ease;
}
.ui-cp__item:first-child { border-top: 0; }
.ui-cp__item[data-resolved] { opacity: 0.45; }
.ui-cp__meta { display: flex; align-items: center; gap: 8px; }
.ui-cp__avatar {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.ui-cp__avatar--initials {
  display: grid;
  place-items: center;
  background: #eef3ff;
  font-size: 9px;
  font-weight: 600;
  color: var(--ui-cp-accent);
}
.ui-cp__name { font-size: 14px; font-weight: 500; line-height: 20px; }
.ui-cp__time { margin-left: auto; font-size: 12.5px; font-variant-numeric: tabular-nums; color: var(--ui-cp-muted); }
.ui-cp__resolve {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-right: -4px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--ui-cp-muted) !important;
  opacity: 0;
  transition: opacity 140ms ease, background-color 140ms ease, color 140ms ease;
}
.ui-cp__item:hover .ui-cp__resolve,
.ui-cp__resolve:focus-visible,
.ui-cp__resolve[aria-pressed="true"] { opacity: 1; }
.ui-cp__resolve:hover { background: #f2fbf6; color: var(--ui-cp-ok) !important; }
.ui-cp__resolve[aria-pressed="true"] { color: var(--ui-cp-ok) !important; }
.ui-cp__text {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 21px;
  color: var(--ui-cp-text);
}
.ui-cp__item[data-resolved] .ui-cp__text { text-decoration: line-through; text-decoration-color: #c4c4c4; }
.ui-cp__command { color: var(--ui-cp-muted); }
.ui-cp__actions { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
.ui-cp__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  background: #f3f3f3;
  font-size: 13px !important;
  font-weight: 500;
  transition: background-color 160ms ease;
}
.ui-cp__btn:hover:not(:disabled) { background: #ebebeb; }
.ui-cp__btn:disabled { color: var(--ui-cp-muted) !important; cursor: progress; }
.ui-cp__spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid #d4d4d4;
  border-top-color: var(--ui-cp-ink);
  border-radius: 50%;
  animation: ui-cp-spin 700ms linear infinite;
}
.ui-cp__done {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ui-cp-ok);
  animation: ui-cp-in 300ms var(--ui-cp-ease);
}
.ui-cp__link {
  padding: 0;
  border: 0;
  background: none;
  font-size: 13px !important;
  color: var(--ui-cp-muted) !important;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.ui-cp__link:hover { color: var(--ui-cp-ink) !important; }
.ui-cp__empty { padding: 28px 16px; font-size: 13px; text-align: center; color: var(--ui-cp-muted); }

/* Composer in the gray extension */
.ui-cp__composer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 9px 9px 16px;
}
.ui-cp__input {
  flex: 1;
  min-width: 0;
  height: 32px;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 14px;
  color: var(--ui-cp-ink);
}
.ui-cp__input::placeholder { color: #a3a3a3; }
.ui-cp__input:focus-visible { outline: none; }
.ui-cp__send {
  display: grid;
  place-items: center;
  flex: none;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(#323137, #201e25);
  box-shadow: 0 0 0 1px #0d0d0d, 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #fff !important;
  transition: opacity 160ms ease, transform 160ms ease;
}
.ui-cp__send:disabled { opacity: 0.3; cursor: default; }
.ui-cp__send:not(:disabled):active { transform: scale(0.94); }

@keyframes ui-cp-in { from { opacity: 0; transform: translateY(3px); } }
@keyframes ui-cp-drop { from { opacity: 0; transform: translateY(-4px) scale(0.98); } }
@keyframes ui-cp-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .ui-cp__item, .ui-cp__menu, .ui-cp__done { animation: none; }
}

/* Height changes glide instead of jumping */
.ui-cp__morph { overflow: hidden; }
.ui-cp__morph[data-smooth] { transition: height 380ms cubic-bezier(0.22, 1, 0.36, 1); }
@media (prefers-reduced-motion: reduce) { .ui-cp__morph[data-smooth] { transition: none; } }
`;
