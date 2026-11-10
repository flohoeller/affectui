"use client";

import { Fragment, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from "react";

/*
 * Message Actions – the small bar under an AI chat message, in one self-contained file.
 *   · Copy: the icon turns into a check and the tooltip says "Copied"
 *   · Regenerate: the arrow spins once; with more than one version a "‹ 2 / 3 ›" switcher unfolds next to it
 *   · Thumbs up / down fill with a little pop; thumbs down unfolds a short feedback row with reasons and a send button
 *   · Read aloud: the speaker becomes a tiny equalizer while it plays, a second press stops it
 * The bar stays quiet (faded) until the message is hovered or something inside it is focused.
 * MessageText (also exported) crossfades the message itself when the version changes.
 * The styles are injected below, so no extra files are needed.
 */

export type MessageActionKey = "copy" | "regenerate" | "feedback" | "speak";
export type FeedbackKind = "up" | "down";

export type MessageActionsProps = {
  /** The message text – copied to the clipboard by Copy and used to time Read aloud */
  text?: string;
  /** Which actions to show, in this order */
  actions?: MessageActionKey[];
  /** All versions of the message, or just how many there are. From 2 on the version switcher shows */
  versions?: number | string[];
  /** Controlled version (0-based index) */
  version?: number;
  /** Starting version when uncontrolled – defaults to the newest */
  defaultVersion?: number;
  /** Called with the version index picked in the switcher */
  onVersionChange?: (index: number) => void;
  /** Called after Copy, with `text` */
  onCopy?: (text?: string) => void;
  /** Called when Regenerate is pressed – add a version and the switcher jumps to it */
  onRegenerate?: () => void;
  /** Keeps the regenerate arrow spinning while a new version is written */
  regenerating?: boolean;
  /** "up" or "down" when a thumb is pressed, null when it is taken back, and "down" with a reason when the feedback row is sent */
  onFeedback?: (kind: FeedbackKind | null, reason?: string) => void;
  /** Quick reasons in the feedback row. "Other" opens a small text field */
  reasons?: string[];
  /** Called with true when Read aloud starts and false when it stops */
  onSpeak?: (playing: boolean) => void;
  /** Controlled playing state, e.g. tied to your speech player */
  speaking?: boolean;
  /** How long an uncontrolled read aloud plays, in ms – defaults to an estimate from `text` */
  speakDuration?: number;
  /** Faded until the message is hovered (default true). Put data-ui-message on the message wrapper */
  quiet?: boolean;
  /** Accessible name of the bar */
  label?: string;
  className?: string;
};

/* ---------- Helpers ---------- */

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Text that changes without a jump: the old one fades out underneath while the new one fades in */
function Swap({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  type Line = { id: string; node: ReactNode };
  const last = useRef<Line>({ id, node: children });
  const [shownId, setShownId] = useState(id);
  const [out, setOut] = useState<Line | null>(null);
  if (shownId !== id) {
    setShownId(id);
    setOut(last.current);
  }
  last.current = { id, node: children };
  useEffect(() => {
    if (!out) return;
    const timer = window.setTimeout(() => setOut(null), 300);
    return () => window.clearTimeout(timer);
  }, [out]);
  return (
    <span className={["ui-ma__swap", className].filter(Boolean).join(" ")}>
      {out && (
        <span key={`out-${out.id}`} className="ui-ma__swap-item" data-out="" aria-hidden="true">
          {out.node}
        </span>
      )}
      <span key={id} className="ui-ma__swap-item">
        {children}
      </span>
    </span>
  );
}

/**
 * The message itself, crossfading when `version` changes: the old text fades out underneath while the new one fades in,
 * and the block eases to its new height.
 */
export function MessageText({ version, children, className }: { version: string | number; children: ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = inner.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className={["ui-ma-text", className].filter(Boolean).join(" ")} style={{ height }}>
      <style href="ui-message-actions" precedence="default">
        {css}
      </style>
      <div ref={inner} className="ui-ma-text__inner" dir="auto">
        <Swap id={String(version)} className="ui-ma-text__swap">
          {children}
        </Swap>
      </div>
    </div>
  );
}

/* ---------- Icons ---------- */

const Glyph = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="ui-ma__glyph" aria-hidden="true">
    <path d={d} />
  </svg>
);
const icons = {
  copy: "M9 9.5A1.5 1.5 0 0 1 10.5 8h8A1.5 1.5 0 0 1 20 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 9 18.5zM15 8V5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H9",
  check: "M5.5 12.5l4.2 4.2L18.5 7.8",
  redo: "M19.5 12a7.5 7.5 0 1 1-2.2-5.3L19.5 9M19.5 4.5V9H15",
  thumb: "M7.5 10.5v9M7.5 10.5l3.3-6a1.8 1.8 0 0 1 3.3 1.2l-.6 3.8H18a2 2 0 0 1 2 2.3l-1.2 6.4a2 2 0 0 1-2 1.8H5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1z",
  speaker: "M11 5.5 6.8 9H4v6h2.8l4.2 3.5zM15.2 9.2a4 4 0 0 1 0 5.6M17.9 6.6a7.8 7.8 0 0 1 0 10.8",
  prev: "m14.5 7-5 5 5 5",
  next: "m9.5 7 5 5-5 5",
  close: "m7.5 7.5 9 9m0-9-9 9",
};

const DEFAULT_ACTIONS: MessageActionKey[] = ["copy", "regenerate", "feedback", "speak"];
/** Known actions only, each once – an unknown key or a repeat would render a stray or doubled button */
const cleanActions = (list: unknown): MessageActionKey[] =>
  Array.isArray(list) ? [...new Set(list)].filter((k): k is MessageActionKey => DEFAULT_ACTIONS.includes(k)) : DEFAULT_ACTIONS;
/** A whole, finite number or the fallback */
const whole = (n: unknown, fallback: number) => (typeof n === "number" && Number.isFinite(n) ? Math.floor(n) : fallback);
const fmt = (n: number) => n.toLocaleString("en-US");
const DEFAULT_REASONS = ["Not accurate", "Too long", "Didn't follow instructions", "Other"];

export function MessageActions({
  text,
  actions: actionsProp = DEFAULT_ACTIONS,
  versions,
  version,
  defaultVersion,
  onVersionChange,
  onCopy,
  onRegenerate,
  regenerating = false,
  onFeedback,
  reasons = DEFAULT_REASONS,
  onSpeak,
  speaking,
  speakDuration,
  quiet = true,
  label = "Message actions",
  className,
}: MessageActionsProps) {
  const uid = useId();
  const actions = cleanActions(actionsProp);
  const count = Math.max(1, whole(typeof versions === "number" ? versions : Array.isArray(versions) ? versions.length : 1, 1));

  /* ----- Versions ----- */
  const [inner, setInner] = useState(() => Math.min(count - 1, Math.max(0, whole(defaultVersion, count - 1))));
  const [seenCount, setSeenCount] = useState(count);
  const [vote, setVote] = useState<FeedbackKind | null>(null);
  const [panel, setPanel] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [other, setOther] = useState("");
  const [sent, setSent] = useState(false);
  if (seenCount !== count) {
    // A new version arrived: show it, and its vote starts fresh
    if (count > seenCount) {
      setInner(count - 1);
      setVote(null);
      setPanel(false);
    }
    setSeenCount(count);
  }
  const index = Math.min(count - 1, Math.max(0, whole(version, inner)));
  const goTo = (i: number) => {
    const next = Math.min(count - 1, Math.max(0, i));
    if (next === index) return;
    if (version === undefined) setInner(next);
    onVersionChange?.(next);
    announce(`Version ${fmt(next + 1)} of ${fmt(count)}`);
  };

  /* ----- Status line for screen readers ----- */
  const [status, setStatus] = useState("");
  const announce = (s: string) => setStatus((old) => (old === s ? `${s} ` : s));

  /* ----- Copy ----- */
  const [copied, setCopied] = useState(0);
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(0), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);
  const copy = () => {
    try {
      if (text !== undefined) navigator.clipboard?.writeText(text).catch(() => {});
    } catch {
      // No clipboard here (insecure page, old browser) – the check still confirms the press
    }
    onCopy?.(text);
    setCopied(Date.now());
    announce("Copied");
  };

  /* ----- Regenerate ----- */
  const [spin, setSpin] = useState(0);
  const regenerate = () => {
    setSpin((s) => s + 1);
    onRegenerate?.();
    announce("Regenerating");
  };

  /* ----- Feedback ----- */
  const thumbsUp = () => {
    if (vote === "up") {
      setVote(null);
      onFeedback?.(null);
      return;
    }
    setVote("up");
    setPanel(false);
    onFeedback?.("up");
    announce("Marked as good response");
  };
  const thumbsDown = () => {
    if (vote === "down") {
      setVote(null);
      setPanel(false);
      onFeedback?.(null);
      return;
    }
    setVote("down");
    setPanel(true);
    setSent(false);
    setReason(null);
    setOther("");
    onFeedback?.("down");
    announce("Marked as bad response. Tell us what went wrong below");
  };
  const send = () => {
    if (!reason || sent) return;
    onFeedback?.("down", reason === "Other" ? other.trim() || "Other" : reason);
    setSent(true);
    announce("Thanks for the feedback");
  };
  useEffect(() => {
    if (!sent) return;
    const t = window.setTimeout(() => setPanel(false), reduced() ? 1200 : 1500);
    return () => window.clearTimeout(t);
  }, [sent]);
  const downRef = useRef<HTMLButtonElement>(null);
  const closePanel = () => {
    setPanel(false);
    downRef.current?.focus();
  };

  /* ----- Read aloud ----- */
  const [innerSpeaking, setInnerSpeaking] = useState(false);
  const playing = speaking ?? innerSpeaking;
  const words = text ? text.trim().split(/\s+/).length : 0;
  const duration = typeof speakDuration === "number" && speakDuration > 0 ? speakDuration : Math.max(2600, words * 380);
  useEffect(() => {
    if (speaking !== undefined || !innerSpeaking) return;
    const t = window.setTimeout(() => {
      setInnerSpeaking(false);
      onSpeak?.(false);
      announce("Finished reading");
    }, duration);
    return () => window.clearTimeout(t);
    // onSpeak is read when the timer ends – a new function each render must not restart it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerSpeaking, speaking, duration]);
  const speak = () => {
    const next = !playing;
    if (speaking === undefined) setInnerSpeaking(next);
    onSpeak?.(next);
    announce(next ? "Reading aloud" : "Stopped reading");
  };

  const active = Boolean(copied) || panel || playing || regenerating;

  /* ----- One button with its tooltip ----- */
  const button = (o: {
    key: string;
    tip: string;
    labelText: string;
    onClick: () => void;
    children: ReactNode;
    pressed?: boolean;
    flash?: boolean;
    extra?: Record<string, string | undefined>;
    expanded?: boolean;
    controls?: string;
    refEl?: Ref<HTMLButtonElement>;
  }) => (
    <span className="ui-ma__item" key={o.key} data-flash={o.flash ? "" : undefined}>
      <button
        ref={o.refEl}
        type="button"
        className={`ui-ma__btn ui-ma__btn--${o.key}`}
        aria-label={o.labelText}
        aria-pressed={o.pressed}
        aria-expanded={o.expanded}
        aria-controls={o.controls}
        onClick={o.onClick}
        {...o.extra}
      >
        {o.children}
      </button>
      <span className="ui-ma__tip" aria-hidden="true">
        <Swap id={o.tip}>{o.tip}</Swap>
      </span>
    </span>
  );

  const parts: ReactNode[] = actions.map((key) => {
    if (key === "copy")
      return button({
        key: "copy",
        tip: copied ? "Copied" : "Copy",
        labelText: copied ? "Copied" : "Copy message",
        onClick: copy,
        flash: Boolean(copied),
        extra: { "data-done": copied ? "" : undefined },
        children: (
          <span className="ui-ma__icon ui-ma__morph">
            <span className="ui-ma__layer" data-on={copied ? undefined : ""}>
              <Glyph d={icons.copy} />
            </span>
            <span className="ui-ma__layer ui-ma__layer--check" data-on={copied ? "" : undefined}>
              <Glyph d={icons.check} />
            </span>
          </span>
        ),
      });
    if (key === "regenerate")
      return (
        <span className="ui-ma__regen" key="regenerate">
          {button({
            key: "regenerate",
            tip: regenerating ? "Writing…" : "Regenerate",
            labelText: "Regenerate response",
            onClick: regenerate,
            extra: { "data-busy": regenerating ? "" : undefined },
            children: (
              <span className="ui-ma__icon">
                <span className="ui-ma__spin" key={spin} data-spin={spin ? "" : undefined}>
                  <Glyph d={icons.redo} />
                </span>
              </span>
            ),
          })}
          <span className="ui-ma__versions" data-open={count > 1 ? "" : undefined} inert={count < 2}>
            <span className="ui-ma__versions-clip" role="group" aria-label="Versions">
              <button
                type="button"
                className="ui-ma__step"
                data-dir="prev"
                aria-label="Previous version"
                disabled={index === 0}
                onClick={() => goTo(index - 1)}
              >
                <Glyph d={icons.prev} />
              </button>
              <span className="ui-ma__count" aria-label={`Version ${fmt(index + 1)} of ${fmt(count)}`}>
                <Swap id={String(index)} className="ui-ma__count-now">
                  {fmt(index + 1)}
                </Swap>
                <span aria-hidden="true">/</span>
                <Swap id={String(count)}>{fmt(count)}</Swap>
              </span>
              <button
                type="button"
                className="ui-ma__step"
                data-dir="next"
                aria-label="Next version"
                disabled={index >= count - 1}
                onClick={() => goTo(index + 1)}
              >
                <Glyph d={icons.next} />
              </button>
            </span>
          </span>
        </span>
      );
    if (key === "feedback")
      return (
        <Fragment key="feedback">
          {button({
          key: "up",
          tip: vote === "up" ? "Thanks!" : "Good response",
          labelText: "Good response",
          pressed: vote === "up",
          onClick: thumbsUp,
          children: (
            <span className="ui-ma__icon ui-ma__thumb">
              <Glyph d={icons.thumb} />
            </span>
          ),
        })}
        {button({
          key: "down",
          tip: "Bad response",
          labelText: "Bad response",
          pressed: vote === "down",
          expanded: panel,
          controls: `${uid}-feedback`,
          onClick: thumbsDown,
          refEl: downRef,
          children: (
            <span className="ui-ma__icon ui-ma__thumb">
              <Glyph d={icons.thumb} />
            </span>
          ),
        })}
        </Fragment>
      );
    return button({
      key: "speak",
      tip: playing ? "Stop" : "Read aloud",
      labelText: playing ? "Stop reading" : "Read aloud",
      pressed: playing,
      onClick: speak,
      children: (
        <span className="ui-ma__icon ui-ma__morph">
          <span className="ui-ma__layer" data-on={playing ? undefined : ""}>
            <Glyph d={icons.speaker} />
          </span>
          <span className="ui-ma__layer ui-ma__eq" data-on={playing ? "" : undefined}>
            <i />
            <i />
            <i />
            <i />
          </span>
        </span>
      ),
    });
  });

  const onPanelKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closePanel();
    }
  };

  return (
    <div
      className={["ui-ma", className].filter(Boolean).join(" ")}
      data-quiet={quiet ? "" : undefined}
      data-active={active ? "" : undefined}
    >
      <style href="ui-message-actions" precedence="default">
        {css}
      </style>

      <div className="ui-ma__bar" role="group" aria-label={label}>
        {parts}
      </div>

      {actions.includes("feedback") && (
        <div id={`${uid}-feedback`} className="ui-ma__fold" data-open={panel ? "" : undefined} inert={!panel}>
          <div className="ui-ma__clip">
            <div className="ui-ma__panel" role="group" aria-labelledby={`${uid}-ask`} onKeyDown={onPanelKey}>
              <div className="ui-ma__panel-head">
                <span id={`${uid}-ask`} className="ui-ma__ask">
                  What went wrong?
                </span>
                <button type="button" className="ui-ma__close" aria-label="Close feedback" onClick={closePanel}>
                  <Glyph d={icons.close} />
                </button>
              </div>
              <div className="ui-ma__chips">
                {(Array.isArray(reasons) ? reasons : []).map((r, i) => (
                  <button
                    key={`${r}-${i}`}
                    type="button"
                    className="ui-ma__chip"
                    aria-pressed={reason === r}
                    disabled={sent}
                    onClick={() => setReason(reason === r ? null : r)}
                    title={r}
                    dir="auto"
                  >
                    {r}
                  </button>
                ))}
                <button
                  type="button"
                  className="ui-ma__send"
                  data-sent={sent ? "" : undefined}
                  disabled={!reason}
                  aria-disabled={sent || undefined}
                  onClick={send}
                >
                  <Swap id={sent ? "sent" : "send"}>
                    {sent ? (
                      <>
                        <Glyph d={icons.check} />
                        Thanks!
                      </>
                    ) : (
                      "Send"
                    )}
                  </Swap>
                </button>
              </div>
              {Array.isArray(reasons) && reasons.includes("Other") && (
                <div className="ui-ma__fold" data-open={reason === "Other" && !sent ? "" : undefined} inert={reason !== "Other" || sent}>
                  <div className="ui-ma__clip">
                    <input
                      className="ui-ma__input"
                      value={other}
                      placeholder="Tell us more (optional)"
                      dir="auto"
                      aria-label="What went wrong, in your words"
                      onChange={(e) => setOther(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") send();
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <span className="ui-ma__sr" aria-live="polite">
        {status}
      </span>
    </div>
  );
}

const css = /* css */ `
.ui-ma {
  --ui-ma-card: var(--aui-surface, #ffffff);
  --ui-ma-line: #ececec;
  --ui-ma-ink: var(--aui-ink, #171717);
  --ui-ma-text: var(--aui-ink, #404040);
  --ui-ma-muted: var(--aui-muted, #8f8f8f);
  --ui-ma-well: var(--aui-subtle, #f4f4f5);
  --ui-ma-hover: var(--aui-subtle, rgba(23, 23, 23, 0.06));
  --ui-ma-accent: var(--aui-blue, #4fb0fe);
  --ui-ma-accent-bg: color-mix(in srgb, var(--aui-blue, #0190fe) 10%, transparent);
  --ui-ma-ok: var(--aui-success, #1e8a4f);
  --ui-ma-ok-bg: color-mix(in srgb, var(--aui-green, #5fc88a) 11%, transparent);
  --ui-ma-tip-bg: #171717;
  --ui-ma-tip-text: #ffffff;
  --ui-ma-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-ma-ease: cubic-bezier(0.32, 0.72, 0.24, 1);
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-width: 0;
  container-type: inline-size;
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-ma-text);
  text-align: left;
  -webkit-font-smoothing: antialiased;
}
.ui-ma *, .ui-ma *::before, .ui-ma *::after { box-sizing: border-box; }
:where(.ui-ma) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; text-align: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.ui-ma button:focus-visible { outline: 2px solid var(--ui-ma-focus); outline-offset: 2px; }
/* Typing in a field: no ring – the caret shows where you are, the edge only firms up a little */
.ui-ma .ui-ma__input:is(:focus, :focus-visible) { outline: none; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-ma-ink) 14%, transparent); }
.ui-ma svg { display: block; flex: none; }
.ui-ma__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* ----- The bar: quiet until the message is hovered, something inside is focused or busy ----- */
/* Wraps to a second row in a very narrow message instead of running out of it */
.ui-ma__bar { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; min-height: 30px; transition: opacity 240ms ease; }
.ui-ma[data-quiet] .ui-ma__bar { opacity: 0.6; }
.ui-ma[data-quiet]:hover .ui-ma__bar,
.ui-ma[data-quiet]:focus-within .ui-ma__bar,
.ui-ma[data-quiet][data-active] .ui-ma__bar,
:where([data-ui-message]:hover, [data-ui-message]:focus-within) .ui-ma[data-quiet] .ui-ma__bar { opacity: 1; }

.ui-ma__item { position: relative; display: inline-flex; flex: none; }
.ui-ma__btn { display: grid; place-items: center; width: 30px; height: 30px; border-radius: calc(var(--aui-radius-sm, 7px) + 1px); color: var(--ui-ma-muted); transition: background-color 160ms ease, color 160ms ease; }
.ui-ma__btn:hover { background: var(--ui-ma-hover); color: var(--ui-ma-ink); }
.ui-ma__btn:active .ui-ma__icon { transform: scale(0.9); }
.ui-ma__btn[aria-pressed="true"] { color: var(--ui-ma-ink); }
.ui-ma__btn--speak[aria-pressed="true"] { color: var(--ui-ma-accent); background: var(--ui-ma-accent-bg); }
.ui-ma__btn--copy[data-done] { color: var(--ui-ma-ok); }

.ui-ma__icon { position: relative; display: grid; place-items: center; width: 16px; height: 16px; transition: transform 160ms var(--ui-ma-ease); }
.ui-ma__glyph { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

/* Two icons on top of each other – one blurs away while the other comes in */
.ui-ma__morph { display: grid; }
.ui-ma__layer { grid-area: 1 / 1; display: grid; place-items: center; opacity: 0; transform: scale(0.6); filter: blur(2px); transition: opacity 200ms ease, transform 300ms var(--ui-ma-ease), filter 200ms ease; }
.ui-ma__layer[data-on] { opacity: 1; transform: none; filter: none; }
.ui-ma__layer--check .ui-ma__glyph { stroke-width: 2; stroke-dasharray: 22; stroke-dashoffset: 22; }
.ui-ma__layer--check[data-on] .ui-ma__glyph { stroke-dashoffset: 0; transition: stroke-dashoffset 340ms var(--ui-ma-ease) 60ms; }

/* Regenerate spins once per press, and keeps going while busy */
.ui-ma__spin { display: grid; place-items: center; }
.ui-ma__spin[data-spin] { animation: ui-ma-spin 640ms var(--ui-ma-ease); }
.ui-ma__btn[data-busy] { color: var(--ui-ma-ink); }
.ui-ma__btn[data-busy] .ui-ma__spin { animation: ui-ma-spin 900ms linear infinite; }

/* Thumbs: down is the same glyph turned around; a vote fills it with a little pop */
.ui-ma__btn--down .ui-ma__glyph { transform: rotate(180deg); }
.ui-ma__thumb .ui-ma__glyph { transition: fill 200ms ease; }
.ui-ma__btn[aria-pressed="true"] .ui-ma__thumb { animation: ui-ma-pop 420ms var(--ui-ma-ease); }
.ui-ma__btn[aria-pressed="true"] .ui-ma__thumb .ui-ma__glyph { fill: currentColor; }

/* Read aloud: four bars that bounce while it plays */
.ui-ma__eq { display: flex; align-items: center; justify-content: center; gap: 2px; width: 16px; height: 16px; }
.ui-ma__eq i { display: block; width: 2px; height: 12px; border-radius: 1px; background: currentColor; transform: scaleY(0.3); }
.ui-ma__eq[data-on] i { animation: ui-ma-eq 900ms ease-in-out infinite; }
.ui-ma__eq[data-on] i:nth-child(2) { animation-delay: -300ms; animation-duration: 760ms; }
.ui-ma__eq[data-on] i:nth-child(3) { animation-delay: -520ms; animation-duration: 1000ms; }
.ui-ma__eq[data-on] i:nth-child(4) { animation-delay: -140ms; animation-duration: 820ms; }

/* ----- Tooltips: above the button, on hover after a beat, on keyboard focus, and briefly after Copy ----- */
.ui-ma__tip { position: absolute; bottom: calc(100% + 6px); left: 50%; z-index: 3; display: block; width: max-content; padding: 3px 7px; border-radius: 6px; background: var(--ui-ma-tip-bg); font-size: 11.5px; font-weight: 500; line-height: 16px; color: var(--ui-ma-tip-text); white-space: nowrap; pointer-events: none; opacity: 0; transform: translate(-50%, 3px); transition: opacity 140ms ease, transform 200ms var(--ui-ma-ease); }
.ui-ma__btn:focus-visible + .ui-ma__tip,
.ui-ma__item[data-flash] .ui-ma__tip { opacity: 1; transform: translate(-50%, 0); transition-delay: 0ms; }
@media (hover: hover) {
  .ui-ma__item:hover .ui-ma__tip { opacity: 1; transform: translate(-50%, 0); transition-delay: 380ms; }
}

/* ----- Version switcher: unfolds next to Regenerate once there are two versions ----- */
.ui-ma__regen { display: inline-flex; align-items: center; flex: none; }
.ui-ma__versions { display: grid; grid-template-columns: 0fr; opacity: 0; transition: grid-template-columns 420ms var(--ui-ma-ease), opacity 220ms ease; }
.ui-ma__versions[data-open] { grid-template-columns: 1fr; opacity: 1; transition: grid-template-columns 420ms var(--ui-ma-ease), opacity 320ms ease 100ms; }
.ui-ma__versions-clip { display: flex; align-items: center; min-width: 0; overflow: hidden; padding-right: 2px; }
.ui-ma__step { display: grid; flex: none; place-items: center; width: 20px; height: 30px; border-radius: var(--aui-radius-sm, 7px); color: var(--ui-ma-muted); transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease; }
.ui-ma__step .ui-ma__glyph { width: 14px; height: 14px; }
.ui-ma__step:hover:not(:disabled) { background: var(--ui-ma-hover); color: var(--ui-ma-ink); }
.ui-ma__step:disabled { cursor: default; opacity: 0.4; }
.ui-ma__count { display: inline-flex; align-items: center; gap: 2px; padding: 0 1px; font-size: 12px; color: var(--ui-ma-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.ui-ma__count-now { color: var(--ui-ma-ink); font-weight: 500; }

/* ----- Swapping text ----- */
.ui-ma__swap { display: inline-grid; min-width: 0; }
.ui-ma__swap-item { grid-area: 1 / 1; display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 0; animation: ui-ma-in 300ms ease both; }
.ui-ma__swap-item[data-out] { animation: ui-ma-out 220ms ease both; }

/* ----- Feedback row: unfolds below the bar ----- */
.ui-ma__fold { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows 420ms var(--ui-ma-ease), opacity 220ms ease; }
.ui-ma__fold[data-open] { grid-template-rows: 1fr; opacity: 1; transition: grid-template-rows 420ms var(--ui-ma-ease), opacity 320ms ease 80ms; }
.ui-ma__clip { min-height: 0; overflow: hidden; margin: -1px; padding: 1px; }  /* the 1px keeps the card's hairline from being clipped */
.ui-ma__panel { max-width: 440px; margin: 6px 0 0; padding: 12px 14px 14px; border-radius: var(--aui-radius-lg, 16px); background: var(--ui-ma-card); box-shadow: var(--aui-shadow-card, 0 0 0 1px var(--aui-border, var(--ui-ma-line)), 0 1px 2px rgba(0, 0, 0, 0.04)); }
.ui-ma__panel-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 24px; }
.ui-ma__ask { font-size: 12.5px; font-weight: 500; color: var(--ui-ma-ink); }
.ui-ma__close { display: grid; flex: none; place-items: center; width: 24px; height: 24px; margin-right: -4px; border-radius: var(--aui-radius-sm, 7px); color: var(--ui-ma-muted); transition: background-color 160ms ease, color 160ms ease; }
.ui-ma__close .ui-ma__glyph { width: 14px; height: 14px; }
.ui-ma__close:hover { background: var(--ui-ma-hover); color: var(--ui-ma-ink); }
.ui-ma__chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 6px; }
.ui-ma__chip { max-width: 100%; overflow: hidden; text-overflow: ellipsis; height: 26px; padding: 0 9px; border-radius: calc(var(--aui-radius-sm, 7px) + 1px); background: var(--ui-ma-well); font-size: 12px; color: var(--ui-ma-text); white-space: nowrap; transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease, opacity 200ms ease; }
.ui-ma__chip:hover:not(:disabled) { background: var(--ui-ma-line); color: var(--ui-ma-ink); }
.ui-ma__chip[aria-pressed="true"], .ui-ma__chip[aria-pressed="true"]:hover:not(:disabled) { background: var(--ui-ma-accent-bg); color: var(--ui-ma-accent); }
.ui-ma__chip:disabled { cursor: default; }
.ui-ma__chip:disabled:not([aria-pressed="true"]) { opacity: 0.45; }
.ui-ma__send { display: inline-flex; align-items: center; justify-content: center; min-width: 58px; height: 26px; margin-left: auto; padding: 0 11px; border-radius: calc(var(--aui-radius-sm, 7px) + 1px); background: var(--aui-primary, var(--ui-ma-ink)); font-size: 12px; font-weight: 500; color: var(--aui-on-primary, var(--ui-ma-card)); white-space: nowrap; transition: background-color 220ms ease, color 220ms ease, opacity 200ms ease; }
.ui-ma__send:disabled { cursor: default; opacity: 0.32; }
.ui-ma__send[data-sent] { cursor: default; background: var(--ui-ma-ok-bg); color: var(--ui-ma-ok); }
.ui-ma__send .ui-ma__glyph { width: 13px; height: 13px; stroke-width: 2.2; }
.ui-ma__input { display: block; width: 100%; height: 30px; margin-top: 8px; padding: 0 10px; border: 0; border-radius: calc(var(--aui-radius, 10px) - 2px); background: var(--ui-ma-well); font: inherit; font-size: 12.5px; color: var(--ui-ma-ink); outline: none; }
.ui-ma__input::placeholder { color: var(--aui-placeholder, var(--ui-ma-muted)); }

/* ----- Message text that crossfades between versions (MessageText) ----- */
.ui-ma-text { overflow: hidden; transition: height 360ms var(--ui-ma-ease, cubic-bezier(0.32, 0.72, 0.24, 1)); }
.ui-ma-text__swap { display: grid; }
.ui-ma-text__inner { min-width: 0; overflow-wrap: anywhere; }
.ui-ma-text__swap > .ui-ma__swap-item { display: block; animation: ui-ma-text-in 420ms ease both; }
.ui-ma-text__swap > .ui-ma__swap-item[data-out] { animation: ui-ma-out 260ms ease both; }

@keyframes ui-ma-in { from { opacity: 0; filter: blur(2px); } }
@keyframes ui-ma-text-in { from { opacity: 0; filter: blur(3px); } }
@keyframes ui-ma-out { from { opacity: 1; } to { opacity: 0; filter: blur(2px); } }
@keyframes ui-ma-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes ui-ma-pop { 0% { transform: scale(1); } 40% { transform: scale(1.28) rotate(-8deg); } 100% { transform: scale(1); } }
@keyframes ui-ma-eq { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }

/* Narrow: the feedback row stacks its send button under the chips */
@container (max-width: 320px) {
  .ui-ma__send { flex-basis: 100%; }
}

@media (pointer: coarse) {
  .ui-ma[data-quiet] .ui-ma__bar { opacity: 1; }
  .ui-ma__btn { width: 38px; height: 38px; border-radius: calc(var(--aui-radius-sm, 7px) + 3px); }
  .ui-ma__step { width: 28px; height: 38px; }
  .ui-ma__chip, .ui-ma__send { height: 34px; }
  .ui-ma__close { width: 32px; height: 32px; }
  .ui-ma__input { height: 38px; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-ma *, .ui-ma *::before, .ui-ma *::after, .ui-ma-text, .ui-ma-text * { animation: none !important; transition: none !important; }
  .ui-ma__eq[data-on] i:nth-child(odd) { transform: scaleY(0.8); }
  .ui-ma__eq[data-on] i:nth-child(even) { transform: scaleY(0.5); }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-ma {
  --ui-ma-card: var(--aui-surface, #19191b);
  --ui-ma-line: #2a2a2e;
  --ui-ma-ink: var(--aui-ink, #ededed);
  --ui-ma-text: var(--aui-ink, #c8c8cc);
  --ui-ma-muted: var(--aui-muted, #8b8b92);
  --ui-ma-well: var(--aui-subtle, #222225);
  --ui-ma-hover: var(--aui-subtle, rgba(255, 255, 255, 0.07));
  --ui-ma-accent: #90cdfe;
  --ui-ma-accent-bg: color-mix(in srgb, var(--aui-blue, #4fb0fe) 16%, transparent);
  --ui-ma-ok: var(--aui-success, #7dcf9f);
  --ui-ma-ok-bg: color-mix(in srgb, var(--aui-green, #7dcf9f) 12%, transparent);
  --ui-ma-tip-bg: #ededed;
  --ui-ma-tip-text: #171717;
  --ui-ma-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
