"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ClipboardEvent, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

/*
 * OTP Input (Clean) – the verification code field, in a single self-contained file.
 * Clean style: white cells with hairline shadows, a thin blue focus outline and caret, quiet gray helper text
 * and a tab-style "Resend code" button.
 * One real input sits under the boxes, so typing, Backspace, paste and the SMS autofill of
 * iOS and Android all work natively; the boxes only draw what it holds.
 * The focus ring glides from box to box with a soft blinking caret, digits pop in, a pasted code
 * fills the boxes one after another. Verifying shimmers, a wrong code shakes and clears for retyping,
 * a right one folds the boxes into a single faintly green "Verified" chip. A resend button counts down below.
 * The styles are injected below, so no extra files are needed.
 */

export type OtpStatus = "idle" | "verifying" | "error" | "success";

export type OtpInputProps = {
  /** Number of boxes */
  length?: number;
  /** A small dash between the boxes – `true` puts it in the middle, a number after that many boxes */
  separator?: boolean | number;
  /** Digits only (numeric keyboard on phones); `false` allows letters too, shown in capitals */
  numeric?: boolean;
  /** The code – makes it controlled */
  value?: string;
  /** Starting code when uncontrolled */
  defaultValue?: string;
  onChange?: (code: string) => void;
  /** Called once the last box is filled – typed, pasted or autofilled */
  onComplete?: (code: string) => void;
  status?: OtpStatus;
  /** Shown below the boxes while `status` is "error" */
  errorMessage?: ReactNode;
  /** Clears the boxes shortly after an error, ready for the next try */
  clearOnError?: boolean;
  /** Text in the pill after a successful check */
  successLabel?: string;
  /** Shows "Resend code" below the boxes once the countdown is over */
  onResend?: () => void;
  /** Seconds until the code can be resent */
  resendIn?: number;
  /** Center the boxes and the lines below them */
  align?: "start" | "center";
  disabled?: boolean;
  autoFocus?: boolean;
  /** Accessible name of the field */
  label?: string;
  className?: string;
};

/* ---------- Helpers ---------- */

const pad = (n: number) => String(n).padStart(2, "0");
/** "0:24", "1:05:00", "3d 1h" */
const clock = (s: number) => {
  if (s >= 86400) return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
  if (s >= 3600) return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
};

/** Longest code the boxes are drawn for – past that the cells get too small to read */
const MAX_LENGTH = 24;

/** Full-width (１２３) and Arabic-Indic digits (٤٨٢) count as the digits they are */
const normalize = (text: string) =>
  text
    .normalize("NFKC")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x6f0));

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const icons = {
  check: "M5.5 12.5l4 4L18.5 8",
  alert: "M12 8v4.5M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
};

export function OtpInput({
  length: lengthProp = 6,
  separator = false,
  numeric = true,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  status = "idle",
  errorMessage = "That code didn't work. Try again.",
  clearOnError = true,
  successLabel = "Verified",
  onResend,
  resendIn: resendInProp = 30,
  align = "start",
  disabled = false,
  autoFocus = false,
  label = "Verification code",
  className,
}: OtpInputProps) {
  // A NaN or fractional length and a NaN countdown fall back instead of breaking the field
  const length = Number.isFinite(lengthProp) ? Math.min(MAX_LENGTH, Math.max(1, Math.floor(lengthProp))) : 6;
  const resendIn = Number.isFinite(resendInProp) && resendInProp > 0 ? Math.floor(resendInProp) : 0;

  /** Keeps allowed characters only – spaces and dashes of a pasted "482 913" fall away */
  const clean = (text: string) => {
    let out = "";
    for (const ch of normalize(String(text ?? ""))) {
      const c = numeric ? (/[0-9]/.test(ch) ? ch : "") : /[a-z0-9]/i.test(ch) ? ch.toUpperCase() : "";
      if (c && out.length < length) out += c;
    }
    return out;
  };

  const [inner, setInner] = useState(() => clean(defaultValue));
  const code = clean(value ?? inner);
  const [idx, setIdx] = useState(Math.min(code.length, length - 1));
  const [focused, setFocused] = useState(false);
  const [errorShown, setErrorShown] = useState(false);
  const [clearing, setClearing] = useState(false); // the wrong code fades out
  const [locked, setLocked] = useState(false); // no typing between the shake and the clearing
  const [left, setLeft] = useState(resendIn);
  const [announce, setAnnounce] = useState("");

  const input = useRef<HTMLInputElement>(null);
  const slots = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const pillInner = useRef<HTMLSpanElement>(null);
  const boxes = useRef<(HTMLSpanElement | null)[]>([]);
  const timers = useRef<number[]>([]);
  const id = useId();

  // Every character remembers when it arrived, so it pops in once; pasted codes arrive one after another
  const prevCode = useRef(code);
  const stamps = useRef<number[]>([]);
  const delays = useRef<number[]>([]);
  const counter = useRef(0);
  if (prevCode.current !== code) {
    const before = prevCode.current;
    const changed = [...code].map((c, i) => c !== before[i]);
    const first = changed.indexOf(true);
    const bulk = changed.filter(Boolean).length > 1;
    changed.forEach((ch, i) => {
      if (!ch) return;
      stamps.current[i] = ++counter.current;
      delays.current[i] = bulk ? (i - first) * 45 : 0;
    });
    prevCode.current = code;
  }

  // An outside change of the value (or a shorter code) keeps the active box in reach
  const active = Math.min(idx, code.length, length - 1);

  const sepAt = separator === true ? Math.floor(length / 2) : typeof separator === "number" ? separator : 0;
  const busy = status === "verifying" || status === "success";
  const readOnly = busy || locked || disabled;
  const showError = status === "error" && errorShown;
  // The ring shows where the next character goes: while focused, or mid-way through a code
  const showRing = !busy && !disabled && (focused || (code.length > 0 && code.length < length));

  const commit = (next: string, nextIdx: number, user = true) => {
    if (value === undefined) setInner(next);
    if (next !== code) onChange?.(next);
    setIdx(Math.max(0, Math.min(nextIdx, next.length, length - 1)));
    if (!user) return;
    if (errorShown && next.length) setErrorShown(false);
    if (next.length === length && next !== code) onComplete?.(next);
  };

  /* ---------- Native input ---------- */

  const onInput = (el: HTMLInputElement) => {
    if (readOnly) return;
    const raw = el.value;
    const caretRaw = el.selectionStart ?? raw.length;
    const next = clean(raw);
    // The caret counts the kept characters in front of it
    const caret = clean(raw.slice(0, caretRaw)).length;
    if (next === code) {
      el.value = code;
      syncSelection();
      return;
    }
    commit(next, caret);
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (readOnly) return;
    const text = clean(e.clipboardData.getData("text"));
    if (!text) return;
    // A whole code replaces everything; a part is written from the active box on
    if (text.length >= length) return commit(text.slice(0, length), length - 1);
    const next = (code.slice(0, active) + text + code.slice(active + text.length)).slice(0, length);
    commit(next, active + text.length);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = Math.min(code.length, length - 1);
    const moves: Record<string, number> = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: last, ArrowUp: 0, ArrowDown: last };
    if (e.key in moves && !e.shiftKey && !e.metaKey) {
      e.preventDefault();
      setIdx(Math.max(0, Math.min(moves[e.key], last)));
    }
  };

  /** A tap or click picks the box under the pointer – never beyond the first empty one */
  const pick = (x: number) => {
    let i = boxes.current.findIndex((b) => b && x < b.getBoundingClientRect().right + 4);
    if (i < 0) i = length - 1;
    setIdx(Math.min(i, code.length, length - 1));
    requestAnimationFrame(syncSelection);
  };

  // The real input selects the active character, so typing replaces it and Backspace removes it
  const syncSelection = () => {
    const el = input.current;
    if (!el || document.activeElement !== el) return;
    const i = Math.min(idx, code.length, length - 1);
    if (i < code.length) el.setSelectionRange(i, i + 1);
    else el.setSelectionRange(i, i);
  };
  useLayoutEffect(syncSelection);

  useEffect(() => {
    if (autoFocus) input.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  /* ---------- The gliding ring and the success pill ---------- */

  useLayoutEffect(() => {
    const r = ring.current;
    const box = boxes.current[active];
    if (r && box) {
      const first = !r.dataset.ready;
      if (first) r.style.transition = "none";
      r.style.width = `${box.offsetWidth}px`;
      r.style.height = `${box.offsetHeight}px`;
      r.style.transform = `translate(${box.offsetLeft}px, ${box.offsetTop}px)`;
      if (first) {
        r.dataset.ready = "1";
        void r.offsetWidth;
        r.style.transition = "";
      }
    }
    // The pill starts as wide as all the boxes and morphs down to its label
    const p = pill.current;
    const s = slots.current;
    if (p && s && pillInner.current) {
      const w = status === "success" ? pillInner.current.offsetWidth : s.offsetWidth;
      p.style.width = `${w}px`;
      // A label wider than the boxes slides back inside the field instead of hanging over its edge
      const root = s.parentElement?.parentElement;
      let shift = 0;
      if (root && w > s.offsetWidth) {
        const box = root.getBoundingClientRect();
        const own = s.getBoundingClientRect();
        const left = own.left + own.width / 2 - w / 2;
        shift = Math.min(Math.max(left, box.left), box.right - w) - left;
      }
      p.style.marginLeft = shift ? `${shift}px` : "";
    }
  });

  // Phones turning, containers resizing: ring and pill follow
  useEffect(() => {
    const s = slots.current;
    if (!s) return;
    const ro = new ResizeObserver(() => {
      const r = ring.current;
      const box = boxes.current[active];
      if (r && box) {
        r.style.width = `${box.offsetWidth}px`;
        r.style.height = `${box.offsetHeight}px`;
        r.style.transform = `translate(${box.offsetLeft}px, ${box.offsetTop}px)`;
      }
      if (pill.current && status !== "success") pill.current.style.width = `${s.offsetWidth}px`;
    });
    ro.observe(s);
    return () => ro.disconnect();
  }, [active, status]);

  /* ---------- Status ---------- */

  const prevStatus = useRef(status);
  useEffect(() => {
    const before = prevStatus.current;
    prevStatus.current = status;
    if (status === before) return;
    if (status === "verifying") setAnnounce("Verifying code");
    if (status === "success") setAnnounce(successLabel);
    if (status !== "error") {
      setErrorShown(false);
      return;
    }
    setErrorShown(true);
    setAnnounce(typeof errorMessage === "string" ? errorMessage : "That code didn't work");
    // A calm shake, then the wrong code fades out so the next try starts fresh
    if (!reduced()) {
      slots.current?.animate(
        [{ transform: "none" }, { transform: "translateX(-6px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(2px)" }, { transform: "none" }],
        { duration: 420, easing: "ease-out" },
      );
    }
    if (!clearOnError) return;
    setLocked(true);
    timers.current.push(
      window.setTimeout(() => setClearing(true), 700),
      window.setTimeout(() => {
        setClearing(false);
        setLocked(false);
        commit("", 0, false);
      }, 980),
    );
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---------- Resend countdown ---------- */

  useEffect(() => {
    if (left <= 0) {
      if (onResend && resendIn > 0) setAnnounce("You can resend the code now");
      return;
    }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const resend = () => {
    onResend?.();
    setLeft(resendIn);
    setAnnounce("A new code is on its way");
  };

  /* ---------- Render ---------- */

  const cells: ReactNode[] = [];
  for (let i = 0; i < length; i++) {
    if (sepAt > 0 && sepAt < length && i === sepAt) cells.push(<span key="sep" className="ui-otpc__sep" />);
    const ch = code[i];
    cells.push(
      <span
        key={i}
        ref={(el) => {
          boxes.current[i] = el;
        }}
        className="ui-otpc__box"
        data-filled={ch ? "" : undefined}
        style={{ "--i": i } as CSSProperties}
      >
        {ch && (
          <span key={stamps.current[i]} className="ui-otpc__char" style={{ animationDelay: `${delays.current[i] ?? 0}ms` }}>
            {ch}
          </span>
        )}
      </span>,
    );
  }

  return (
    <div
      className={["ui-otpc", className].filter(Boolean).join(" ")}
      data-status={status}
      data-error={showError || undefined}
      data-align={align}
      data-disabled={disabled || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many fields render */}
      <style href="ui-otp-input-clean" precedence="default">
        {css}
      </style>

      <div className="ui-otpc__field">
        <div
          ref={slots}
          className="ui-otpc__slots"
          dir="ltr"
          data-clearing={clearing || undefined}
          style={{ "--n": length, "--sep-w": sepAt > 0 && sepAt < length ? "calc(var(--ui-otpc-gap) + 8px)" : "0px" } as CSSProperties}
        >
          {cells}
          <span ref={ring} className="ui-otpc__ring" data-show={showRing || undefined} aria-hidden="true">
            <span className="ui-otpc__caret" data-show={(focused && !code[active] && !readOnly) || undefined} />
          </span>
          <span ref={pill} className="ui-otpc__pill" aria-hidden="true">
            <span ref={pillInner} className="ui-otpc__pill-inner">
              <svg viewBox="0 0 24 24" className="ui-otpc__check" aria-hidden="true">
                <path d={icons.check} pathLength={1} />
              </svg>
              <span className="ui-otpc__pill-text" title={successLabel}>
                {successLabel}
              </span>
            </span>
          </span>
          <input
            ref={input}
            className="ui-otpc__input"
            type="text"
            value={code}
            inputMode={numeric ? "numeric" : "text"}
            pattern={numeric ? "[0-9]*" : undefined}
            autoComplete="one-time-code"
            autoCapitalize={numeric ? "off" : "characters"}
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label={`${label}, ${length} ${numeric ? (length === 1 ? "digit" : "digits") : length === 1 ? "character" : "characters"}`}
            aria-invalid={showError || undefined}
            aria-describedby={showError ? `${id}-msg` : undefined}
            disabled={disabled}
            readOnly={busy || locked}
            onChange={(e) => onInput(e.currentTarget)}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            onFocus={() => {
              setFocused(true);
              requestAnimationFrame(syncSelection);
            }}
            onBlur={() => setFocused(false)}
            onPointerUp={(e) => pick(e.clientX)}
            onSelect={(e) => {
              // A native caret move (long press, mouse drag) snaps back to a single box
              const el = e.currentTarget;
              const want = active < code.length ? [active, active + 1] : [active, active];
              if (el.selectionStart !== want[0] || el.selectionEnd !== want[1]) syncSelection();
            }}
          />
        </div>
      </div>

      {/* The error message slides in below and folds away once retyping starts */}
      <div className="ui-otpc__msg" data-show={showError || undefined}>
        <div className="ui-otpc__msg-inner">
          <p id={`${id}-msg`} className="ui-otpc__msg-text">
            <svg viewBox="0 0 24 24" className="ui-otpc__alert" aria-hidden="true">
              <path d={icons.alert} />
            </svg>
            <span>{errorMessage}</span>
          </p>
        </div>
      </div>

      {onResend && (
        <div className="ui-otpc__resend" data-hidden={status === "success" || undefined}>
          <span className="ui-otpc__resend-q">Didn't get a code?</span>{" "}
          {left > 0 ? (
            <span key="wait" className="ui-otpc__swap ui-otpc__wait">
              Resend in{"\u00a0"}
              <span className="ui-otpc__time">{clock(left)}</span>
            </span>
          ) : (
            <button key="go" type="button" className="ui-otpc__swap ui-otpc__resend-btn" onClick={resend} disabled={disabled || busy}>
              Resend code
            </button>
          )}
        </div>
      )}

      <span className="ui-otpc__live" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}

/* ---------- Styles ---------- */


const css = /* css */ `
/* Colors, size and motion as variables – override them on .ui-otpc */
.ui-otpc {
  --ui-otpc-box: 40px;
  --ui-otpc-gap: 8px;
  --ui-otpc-card: var(--aui-surface, #ffffff);
  --ui-otpc-ink: var(--aui-ink, rgba(0, 0, 0, 0.88));
  --ui-otpc-strong: #000000;
  --ui-otpc-text: var(--aui-muted, rgba(0, 0, 0, 0.61));
  --ui-otpc-muted: var(--aui-muted, rgba(0, 0, 0, 0.45));
  --ui-otpc-faint: rgba(0, 0, 0, 0.27);
  --ui-otpc-icon: rgba(0, 0, 0, 0.447);
  --ui-otpc-line: var(--aui-border, rgba(0, 0, 0, 0.06));
  --ui-otpc-fill: rgba(0, 0, 0, 0.06);
  --ui-otpc-wash: var(--aui-subtle, rgba(0, 0, 0, 0.03));
  --ui-otpc-shine: rgba(255, 255, 255, 0.82);
  --ui-otpc-accent: rgba(0, 96, 226, 0.765);
  --ui-otpc-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-otpc-halo: rgba(0, 96, 226, 0.35);
  --ui-otpc-danger: var(--aui-red, #f04438);
  --ui-otpc-success: var(--aui-success, #1e8a4f);
  --ui-otpc-danger-tint: color-mix(in srgb, var(--aui-red, #f04438) 8%, transparent);
  --ui-otpc-success-tint: color-mix(in srgb, var(--aui-green, #5fc88a) 8%, transparent);
  /* Strokes are shadows: a 0.5px hairline plus a soft lift */
  --ui-otpc-lift: 0 1px 1px -1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ui-otpc-shadow: var(--aui-shadow-card, 0 0 0 0.5px var(--ui-otpc-line), var(--ui-otpc-lift));
  --ui-otpc-ease: var(--aui-ease, cubic-bezier(0.22, 1, 0.36, 1));
  box-sizing: border-box;
  container-type: inline-size;
  display: grid;
  justify-self: stretch; /* it sizes the boxes from its own width, so it must never shrink to fit them */
  width: 100%;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  font-weight: 400;
  color: var(--ui-otpc-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-otpc *, .ui-otpc *::before, .ui-otpc *::after { box-sizing: border-box; }
:where(.ui-otpc) button { margin: 0; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; }
.ui-otpc[data-align="center"] { justify-items: center; text-align: center; }
.ui-otpc[data-disabled] { opacity: 0.55; }

.ui-otpc__field { display: flex; min-width: 0; padding: 3px 0; }
.ui-otpc[data-align="center"] .ui-otpc__field { justify-content: center; }

/* The cells scale down to fit their container (phones at 320px), up to --ui-otpc-box */
.ui-otpc__slots {
  --size: min(var(--ui-otpc-box), calc((100cqi - 6px - (var(--n) - 1) * var(--ui-otpc-gap) - var(--sep-w)) / var(--n)));
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ui-otpc-gap);
}
/* White cells with the card's hairline shadow */
.ui-otpc__box {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  width: var(--size);
  height: calc(var(--size) * 1.1);
  overflow: hidden;
  border-radius: calc(var(--size) * 0.2);
  background: var(--ui-otpc-card);
  box-shadow: var(--ui-otpc-shadow);
  font-size: min(15px, calc(var(--size) * 0.375));
  line-height: 24px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--ui-otpc-ink);
  transition: box-shadow 220ms ease, background-color 220ms ease, color 220ms ease, transform 380ms var(--ui-otpc-ease), opacity 260ms ease;
}
.ui-otpc__sep { flex: none; width: 8px; height: 1px; border-radius: 1px; background: var(--ui-otpc-faint); transition: opacity 200ms ease; }

/* Digits pop in – a small lift out of a blur, no bounce */
.ui-otpc__char { display: block; animation: ui-otpc-pop 280ms var(--ui-otpc-ease) both; }
.ui-otpc__slots[data-clearing] .ui-otpc__char { animation: ui-otpc-out 240ms ease both; animation-delay: calc((var(--n) - var(--i)) * 22ms) !important; }

/* One blue outline glides from cell to cell; its thin caret blinks softly in an empty cell */
.ui-otpc__ring {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  border-radius: calc(var(--size) * 0.2);
  box-shadow: 0 0 0 0.5px var(--ui-otpc-accent), 0 0 0 2px var(--ui-otpc-halo);
  opacity: 0;
  pointer-events: none;
  transition: transform 260ms var(--ui-otpc-ease), width 260ms var(--ui-otpc-ease), opacity 180ms ease, box-shadow 220ms ease;
}
.ui-otpc__ring[data-show] { opacity: 1; }
.ui-otpc__caret { width: 1px; height: 18px; max-height: 42%; border-radius: 1px; background: var(--ui-otpc-accent); opacity: 0; }
.ui-otpc__caret[data-show] { animation: ui-otpc-blink 1.1s ease-in-out infinite; }

/* The real input lies over the cells, invisible – it takes taps, keys, paste and SMS autofill */
.ui-otpc__input {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: transparent;
  -webkit-text-fill-color: transparent;
  caret-color: transparent;
  font-size: 16px; /* iOS doesn't zoom into inputs of 16px and up */
  letter-spacing: -1em;
  cursor: text;
  appearance: none;
}
.ui-otpc__input::selection { background: transparent; }
.ui-otpc__input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px transparent inset; transition: background-color 9999s; }
.ui-otpc__input[readonly], .ui-otpc__input:disabled { cursor: default; }

/* Verifying: the digits turn gray and a lighter band passes over the cells, one after another */
.ui-otpc__box::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 20%, var(--ui-otpc-shine) 50%, transparent 80%);
  transform: translateX(-120%);
  opacity: 0;
  pointer-events: none;
}
.ui-otpc[data-status="verifying"] .ui-otpc__box::after { opacity: 1; animation: ui-otpc-shimmer 1.3s ease-in-out infinite; animation-delay: calc(var(--i) * 70ms); }
.ui-otpc[data-status="verifying"] .ui-otpc__box { background: var(--ui-otpc-wash); box-shadow: 0 0 0 0.5px var(--ui-otpc-line); color: var(--ui-otpc-text); }

/* Error: no red strokes – the cells get a faint red fill and the digits turn red */
.ui-otpc[data-error] .ui-otpc__box { background: var(--ui-otpc-danger-tint); color: var(--ui-otpc-danger); }

/* Success: the cells slide together and fade while one frame morphs into the "Verified" chip */
.ui-otpc__pill {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  display: grid;
  place-items: center;
  height: calc(var(--size) * 1.1);
  overflow: hidden;
  border-radius: calc(var(--size) * 0.2);
  background: var(--ui-otpc-card);
  box-shadow: var(--ui-otpc-shadow);
  opacity: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: width 300ms var(--ui-otpc-ease), background-color 300ms ease, opacity 160ms ease 140ms;
}
.ui-otpc__pill-inner {
  display: inline-flex;
  max-width: 100cqi; /* a long label shortens instead of leaving the field */
  align-items: center;
  gap: 6px;
  padding: 0 14px 0 12px;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  white-space: nowrap;
  color: var(--ui-otpc-ink);
  opacity: 0;
  transition: opacity 160ms ease;
}
.ui-otpc__pill-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ui-otpc__check { width: 16px; height: 16px; flex: none; fill: none; stroke: var(--ui-otpc-success); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.ui-otpc__check path { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 120ms ease; }
.ui-otpc[data-status="success"] .ui-otpc__box {
  transform: translateX(calc(((var(--n) - 1) / 2 - var(--i)) * (var(--size) + var(--ui-otpc-gap)))) scale(0.7);
  opacity: 0;
  transition: transform 340ms var(--ui-otpc-ease), opacity 220ms ease 120ms;
}
.ui-otpc[data-status="success"] .ui-otpc__sep { opacity: 0; }
.ui-otpc[data-status="success"] .ui-otpc__pill {
  background: var(--ui-otpc-success-tint);
  opacity: 1;
  transition: width 460ms var(--ui-otpc-ease) 220ms, background-color 300ms ease 300ms, opacity 160ms ease 120ms;
}
.ui-otpc[data-status="success"] .ui-otpc__pill-inner { opacity: 1; transition: opacity 240ms ease 460ms; }
.ui-otpc[data-status="success"] .ui-otpc__check path { stroke-dashoffset: 0; transition: stroke-dashoffset 380ms var(--ui-otpc-ease) 560ms; }

/* The error message grows in below, then folds away */
.ui-otpc__msg { display: grid; grid-template-rows: 0fr; width: 100%; transition: grid-template-rows 300ms var(--ui-otpc-ease); }
.ui-otpc__msg[data-show] { grid-template-rows: 1fr; }
.ui-otpc__msg-inner { min-height: 0; overflow: hidden; }
.ui-otpc__msg-text {
  margin: 0;
  overflow-wrap: anywhere;
  padding-top: 8px;
  font-size: 12px;
  line-height: 16px;
  text-wrap: balance;
  color: var(--ui-otpc-text);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 200ms ease, transform 300ms var(--ui-otpc-ease);
}
.ui-otpc__msg[data-show] .ui-otpc__msg-text { opacity: 1; transform: none; transition-delay: 60ms; }
/* The icon sits inline, so a wrapped message stays centered with it */
.ui-otpc__alert { display: inline-block; width: 14px; height: 14px; margin-right: 6px; vertical-align: -3px; fill: none; stroke: var(--ui-otpc-danger); stroke-width: 1.7; stroke-linecap: round; }

/* Resend: a countdown that turns into a tab-style button */
.ui-otpc__resend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  min-height: 28px;
  margin-top: 12px;
  font-size: 12px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  color: var(--ui-otpc-muted);
  transition: opacity 220ms ease;
}
.ui-otpc[data-align="center"] .ui-otpc__resend { justify-content: center; }
.ui-otpc__resend[data-hidden] { opacity: 0; visibility: hidden; transition: opacity 220ms ease, visibility 0s 220ms; }
.ui-otpc__swap { display: inline-block; animation: ui-otpc-in 260ms var(--ui-otpc-ease) both; }
.ui-otpc__wait { color: var(--ui-otpc-text); }
.ui-otpc__time { display: inline-block; min-width: 3.4ch; text-align: left; color: var(--ui-otpc-ink); }
.ui-otpc__resend-btn {
  position: relative;
  padding: 4px 10px;
  border-radius: calc(var(--aui-radius-sm, 5px) + 1px);
  box-shadow: inset 0 0 0 0.5px var(--ui-otpc-line);
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  color: var(--ui-otpc-text);
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-otpc__resend-btn:hover { background: var(--ui-otpc-wash); color: var(--ui-otpc-ink); }
.ui-otpc__resend-btn:active { background: var(--ui-otpc-fill); }
.ui-otpc__resend-btn:focus-visible { outline: 2px solid var(--ui-otpc-focus); outline-offset: 2px; }
.ui-otpc__resend-btn:disabled { color: var(--aui-placeholder, var(--ui-otpc-faint)); background: none; cursor: default; }
.ui-otpc__live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@keyframes ui-otpc-pop { from { opacity: 0; transform: translateY(4px) scale(0.7); filter: blur(3px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes ui-otpc-out { to { opacity: 0; transform: translateY(-4px) scale(0.8); filter: blur(2px); } }
@keyframes ui-otpc-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes ui-otpc-shimmer { 0% { transform: translateX(-120%); } 55%, 100% { transform: translateX(120%); } }
@keyframes ui-otpc-in { from { opacity: 0; transform: translateY(3px); filter: blur(2px); } to { opacity: 1; transform: none; filter: none; } }

/* Narrow containers (phones): tighter gaps, the question before "Resend" drops first */
@container (max-width: 340px) {
  .ui-otpc__slots { --ui-otpc-gap: 6px; }
  .ui-otpc__sep { width: 6px; }
}
@container (max-width: 250px) {
  .ui-otpc__resend-q { display: none; }
}
/* Touch screens: a taller Resend button */
@media (hover: none) and (pointer: coarse) {
  .ui-otpc__resend-btn { padding: 7px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .ui-otpc *, .ui-otpc *::before, .ui-otpc *::after { animation: none !important; transition: none !important; }
  .ui-otpc__caret[data-show] { opacity: 1; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-otpc {
  --ui-otpc-card: var(--aui-surface, #1c1c1e);
  --ui-otpc-ink: var(--aui-ink, rgba(255, 255, 255, 0.9));
  --ui-otpc-strong: #ffffff;
  --ui-otpc-text: var(--aui-muted, rgba(255, 255, 255, 0.62));
  --ui-otpc-muted: var(--aui-muted, rgba(255, 255, 255, 0.46));
  --ui-otpc-faint: rgba(255, 255, 255, 0.3);
  --ui-otpc-icon: rgba(255, 255, 255, 0.5);
  --ui-otpc-line: var(--aui-border, rgba(255, 255, 255, 0.1));
  --ui-otpc-fill: rgba(255, 255, 255, 0.08);
  --ui-otpc-wash: var(--aui-subtle, rgba(255, 255, 255, 0.03));
  --ui-otpc-shine: rgba(255, 255, 255, 0.1);
  --ui-otpc-accent: var(--aui-blue, #4fb0fe);
  --ui-otpc-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
  --ui-otpc-halo: rgba(77, 141, 255, 0.5);
  --ui-otpc-danger: var(--aui-red, #ff6b5f);
  --ui-otpc-success: var(--aui-green, #5fc88a);
  --ui-otpc-danger-tint: color-mix(in srgb, var(--aui-red, #ff6b5f) 14%, transparent);
  --ui-otpc-success-tint: color-mix(in srgb, var(--aui-green, #7dcf9f) 14%, transparent);
  --ui-otpc-lift: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
}
`;
