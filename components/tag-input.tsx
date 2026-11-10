"use client";

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode, type Ref } from "react";

/*
 * Tag Input – a single self-contained file.
 * Several values in one field, as chips: Enter, comma or Tab adds what you typed, a pasted list becomes many chips at
 * once, a value that doesn't pass the check stays in the field with a message, and a duplicate flashes the chip it
 * repeats. Backspace on an empty field takes the last chip back into the text; ← and → walk the chips.
 * The field has the Text Field's look. The styles are injected below, so no extra files are needed.
 */

export type TagInputProps = {
  /** The chips – makes it controlled */
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  /** Shown above the field and tied to it */
  label?: ReactNode;
  /** A quiet line under the field – a message takes its place while there is one */
  hint?: ReactNode;
  /** Marks the field invalid and shows this under it */
  error?: ReactNode;
  /** "Optional" next to the label */
  optional?: boolean;
  placeholder?: string;
  /** Checks a value before it becomes a chip: true to accept, or a message that says what's wrong */
  validate?: (tag: string) => true | string;
  /** Cleans a value before it's checked, e.g. trims and lowercases an email (default: trim) */
  normalize?: (tag: string) => string;
  /** Also split on spaces – right for emails and single words, wrong for names with spaces */
  splitOnSpace?: boolean;
  /** At most this many chips */
  max?: number;
  /** A small circle with the first letter on every chip, e.g. for people */
  avatar?: boolean;
  disabled?: boolean;
  /** Sends the chips with a form, as one hidden input per chip */
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
  ref?: Ref<HTMLInputElement>;
};

export function TagInput({
  value,
  defaultValue = [],
  onChange,
  label,
  hint,
  error,
  optional = false,
  placeholder = "Add…",
  validate,
  normalize = (t) => t.trim(),
  splitOnSpace = false,
  max,
  avatar = false,
  disabled = false,
  name,
  id,
  className,
  "aria-label": ariaLabel,
  ref,
}: TagInputProps) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const labelId = `${autoId}-label`;
  const messageId = `${autoId}-message`;
  const liveId = `${autoId}-live`;

  const [own, setOwn] = useState<string[]>(defaultValue);
  const tags = value ?? own;
  const [draft, setDraft] = useState("");
  const [problem, setProblem] = useState("");
  const [armed, setArmed] = useState(false);
  const [flash, setFlash] = useState<{ tag: string; n: number } | null>(null);
  const [said, setSaid] = useState("");
  const input = useRef<HTMLInputElement | null>(null);
  const box = useRef<HTMLDivElement | null>(null);

  const full = max != null && tags.length >= max;
  const shownError = error != null && typeof error !== "boolean" && error !== "" ? error : problem || null;
  const invalid = Boolean(error) || Boolean(problem);
  const message = shownError ?? (hint != null && typeof hint !== "boolean" && hint !== "" ? hint : null);
  const split = splitOnSpace ? /[\s,;]+/ : /[,;\n]+/;

  const set = (next: string[]) => {
    if (value === undefined) setOwn(next);
    onChange?.(next);
  };

  // Adds every good value in the text; whatever doesn't pass stays in the field with a message, ahead of `rest`
  const commit = (text: string, rest = "") => {
    const parts = text.split(split).map(normalize).filter(Boolean);
    if (!parts.length) {
      setDraft(rest);
      return;
    }
    const added: string[] = [];
    const left: string[] = [];
    let why = "";
    for (const p of parts) {
      const check = validate ? validate(p) : true;
      if (check !== true) {
        left.push(p);
        why ||= check;
      } else if (tags.includes(p) || added.includes(p)) {
        setFlash({ tag: p, n: Date.now() });
      } else if (max != null && tags.length + added.length >= max) {
        left.push(p);
        why ||= `Up to ${max} at a time.`;
      } else added.push(p);
    }
    if (added.length) {
      set([...tags, ...added]);
      setSaid(added.length === 1 ? `${added[0]} added` : `${added.length} added`);
    }
    setDraft([left.join(splitOnSpace ? " " : ", "), rest].filter(Boolean).join(splitOnSpace ? " " : ", "));
    setProblem(why);
  };

  const remove = (tag: string, focusInput = true) => {
    set(tags.filter((t) => t !== tag));
    setSaid(`${tag} removed`);
    if (focusInput) input.current?.focus();
  };

  const chips = () => [...(box.current?.querySelectorAll<HTMLElement>(".ui-tag__chip") ?? [])];

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    const sep = e.key === "," || e.key === ";" || (splitOnSpace && e.key === " ");
    if ((e.key === "Enter" || e.key === "Tab" || sep) && draft.trim()) {
      e.preventDefault();
      commit(draft);
      return;
    }
    if (sep) {
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace" && !draft && tags.length) {
      // First press marks the last chip, the second takes it out
      e.preventDefault();
      if (armed) {
        remove(tags[tags.length - 1]);
        setArmed(false);
      } else setArmed(true);
      return;
    }
    if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0 && tags.length) {
      e.preventDefault();
      chips().at(-1)?.focus();
      return;
    }
    if (e.key === "Escape" && draft) {
      e.preventDefault();
      setDraft("");
      setProblem("");
    }
    setArmed(false);
  };

  const onChipKey = (e: KeyboardEvent<HTMLElement>, i: number) => {
    const list = chips();
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      list[Math.max(0, i - 1)]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (i + 1 < list.length) list[i + 1].focus();
      else input.current?.focus();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const next = list[i + 1] ?? null;
      remove(tags[i], false);
      // Focus moves on to the next chip, or back to the field
      window.setTimeout(() => (next && next.isConnected ? next.focus() : input.current?.focus()));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!split.test(text.trim())) return;
    e.preventDefault();
    commit(draft + (draft ? (splitOnSpace ? " " : ",") : "") + text);
  };

  return (
    <div className={["ui-tag", className].filter(Boolean).join(" ")} data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
      {/* React 19 hoists this into <head> once, no matter how many fields render */}
      <style href="ui-tag-input" precedence="default">
        {css}
      </style>
      {label != null && (
        <div className="ui-tag__head">
          <label className="ui-tag__label" id={labelId} htmlFor={inputId}>
            {label}
          </label>
          {optional && <span className="ui-tag__optional">Optional</span>}
        </div>
      )}
      {/* A click on the box's empty space puts the caret in the field */}
      <div
        ref={box}
        className="ui-tag__box"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            input.current?.focus();
          }
        }}
      >
        {tags.map((t, i) => (
          <span
            key={t}
            className="ui-tag__chip"
            tabIndex={-1}
            title={t}
            data-armed={(armed && i === tags.length - 1) || undefined}
            data-flash={flash?.tag === t ? flash.n : undefined}
            onKeyDown={(e) => onChipKey(e, i)}
            onAnimationEnd={(e) => e.animationName === "ui-tag-flash" && setFlash(null)}
          >
            {avatar && (
              <span className="ui-tag__avatar" aria-hidden="true">
                {(Array.from(t)[0] ?? "").toUpperCase()}
              </span>
            )}
            <span className="ui-tag__text">{t}</span>
            {!disabled && (
              <button
                type="button"
                className="ui-tag__remove"
                tabIndex={-1}
                aria-label={`Remove ${t}`}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => remove(t)}
              >
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
              </button>
            )}
          </span>
        ))}
        <input
          ref={(el) => {
            input.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) ref.current = el;
          }}
          id={inputId}
          className="ui-tag__input"
          value={draft}
          placeholder={full ? "" : tags.length ? "Add more…" : placeholder}
          disabled={disabled || full}
          dir="auto"
          autoComplete="off"
          spellCheck={false}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={[message ? messageId : null, liveId].filter(Boolean).join(" ")}
          onChange={(e) => {
            const v = e.target.value;
            setArmed(false);
            if (problem) setProblem("");
            // A separator typed anywhere – also by phone keyboards that don't report the key – turns what's before it into chips
            const parts = v.split(split);
            if (parts.length > 1) commit(parts.slice(0, -1).join(","), parts[parts.length - 1]);
            else setDraft(v);
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => {
            setArmed(false);
            if (draft.trim()) commit(draft);
          }}
        />
      </div>
      {name && tags.map((t) => <input key={t} type="hidden" name={name} value={t} />)}
      {(message || max != null) && (
        <div className="ui-tag__foot">
          {message && (
            <p className="ui-tag__message" id={messageId} key={shownError ? "error" : "hint"} aria-live={shownError ? "polite" : undefined}>
              {message}
            </p>
          )}
          {max != null && (
            <span className="ui-tag__count" data-full={full || undefined}>
              {tags.length}/{max}
            </span>
          )}
        </div>
      )}
      <span className="ui-tag__sr" id={liveId} role="status">
        {said}
      </span>
    </div>
  );
}

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-tag (see Theming in the docs) */
.ui-tag {
  --ui-tag-title: var(--aui-ink, #171717);
  --ui-tag-ink: var(--aui-ink, #171717);
  --ui-tag-muted: var(--aui-muted, #404040);
  --ui-tag-subtle: var(--aui-muted, #8f8f8f);
  --ui-tag-faint: var(--aui-placeholder, #b5b5b5);
  --ui-tag-surface: var(--aui-surface, #ffffff);
  --ui-tag-line: var(--aui-border, #e6e6e8);
  --ui-tag-edge: var(--aui-border-strong, #d4d4d8);
  --ui-tag-edge-focus: var(--aui-border-strong, #b4b4bb);
  --ui-tag-chip: #f4f4f5;
  --ui-tag-chip-edge: #e6e6e8;
  --ui-tag-chip-armed: #e4e4e7;
  --ui-tag-avatar: #e9e9ec;
  --ui-tag-flash: rgba(0, 96, 226, 0.14);
  --ui-tag-danger: var(--aui-danger, #c4320a);
  --ui-tag-danger-edge: #ff8a7a;
  --ui-tag-danger-wash: color-mix(in srgb, var(--aui-red, #f04438) 4%, transparent);
  --ui-tag-focus: var(--aui-focus, rgba(0, 96, 226, 0.7));
  --ui-tag-ease: cubic-bezier(0.22, 1, 0.36, 1);

  --fs: 13.5px;

  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  font-family: var(--aui-font, "Inter", "InterVariable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  line-height: 20px;
  color: var(--ui-tag-ink);
  -webkit-font-smoothing: antialiased;
}
@media (pointer: coarse) {
  .ui-tag { --fs: 16px; }
}

.ui-tag__head { display: flex; align-items: baseline; gap: 6px; min-width: 0; padding: 0 2px; }
.ui-tag__label { min-width: 0; font-size: 13px; font-weight: 500; color: var(--ui-tag-title); overflow-wrap: anywhere; cursor: default; }
.ui-tag__optional { flex: none; font-size: 12px; line-height: 16px; color: var(--ui-tag-subtle); }

/* The box: the Text Field's look; chips wrap onto new lines and it grows with them */
.ui-tag__box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
  min-height: 36px;
  min-width: 0;
  max-height: 168px;
  padding: 5px 6px;
  border-radius: var(--aui-radius, 10px);
  background: var(--ui-tag-surface);
  box-shadow: 0 0 0 1px var(--ui-tag-line), 0 1px 2px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  cursor: text;
  transition: box-shadow 140ms ease;
}
.ui-tag__box:hover { box-shadow: 0 0 0 1px var(--ui-tag-edge), 0 1px 2px rgba(0, 0, 0, 0.04); }
.ui-tag__box:focus-within { box-shadow: 0 0 0 1px var(--ui-tag-edge-focus), 0 1px 2px rgba(0, 0, 0, 0.04); }
.ui-tag[data-invalid] .ui-tag__box { background: var(--ui-tag-danger-wash); box-shadow: 0 0 0 1px var(--ui-tag-danger-edge), 0 1px 2px rgba(0, 0, 0, 0.04); }
.ui-tag[data-disabled] { opacity: 0.55; }
.ui-tag[data-disabled] .ui-tag__box { cursor: not-allowed; }

/* A chip: a soft gray pill with the text and a small × */
.ui-tag__chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  height: 24px;
  box-sizing: border-box;
  padding: 0 3px 0 8px;
  border-radius: 7px;
  background: var(--ui-tag-chip);
  box-shadow: inset 0 0 0 1px var(--ui-tag-chip-edge);
  font-size: 13px;
  color: var(--ui-tag-ink);
  outline: none;
  animation: ui-tag-in 220ms var(--ui-tag-ease) both;
  transition: background-color 140ms ease;
}
.ui-tag__chip:has(.ui-tag__avatar) { padding-left: 3px; }
.ui-tag__chip:focus-visible { outline: 2px solid var(--ui-tag-focus); outline-offset: 2px; }
.ui-tag__chip[data-armed] { background: var(--ui-tag-chip-armed); }
.ui-tag__chip[data-flash] { animation: ui-tag-flash 700ms ease; }
.ui-tag__avatar { display: grid; flex: none; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: var(--ui-tag-avatar); font-size: 10px; font-weight: 500; color: var(--ui-tag-muted); }
.ui-tag__text { min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ui-tag__remove {
  position: relative;
  display: grid;
  flex: none;
  place-items: center;
  width: 18px;
  height: 18px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--ui-tag-subtle);
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease;
}
.ui-tag__remove::before { content: ""; position: absolute; inset: -4px; }
.ui-tag__remove:hover { background: var(--ui-tag-chip-armed); color: var(--ui-tag-ink); }
.ui-tag__remove svg { display: block; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; }

.ui-tag__input {
  flex: 1 0 80px;
  min-width: 80px;
  height: 24px;
  margin: 0;
  padding: 0 6px;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: var(--fs);
  color: var(--ui-tag-ink);
}
.ui-tag__input::placeholder { color: var(--ui-tag-faint); opacity: 1; }
.ui-tag__input:disabled { cursor: not-allowed; }

.ui-tag__foot { display: flex; align-items: flex-start; gap: 12px; min-width: 0; padding: 0 2px; }
.ui-tag__message { flex: 1; min-width: 0; margin: 0; font-size: 12.5px; line-height: 17px; color: var(--ui-tag-subtle); overflow-wrap: anywhere; animation: ui-tag-message 260ms var(--ui-tag-ease); }
.ui-tag[data-invalid] .ui-tag__message { color: var(--ui-tag-danger); }
.ui-tag__count { flex: none; margin-left: auto; font-size: 12px; line-height: 16px; font-variant-numeric: tabular-nums; color: var(--ui-tag-faint); }
.ui-tag__count[data-full] { color: var(--ui-tag-muted); }
.ui-tag__sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

/* Touch screens: taller chips and a bigger × */
@media (pointer: coarse) {
  .ui-tag__box { min-height: 40px; }
  .ui-tag__chip { height: 30px; font-size: 14px; }
  .ui-tag__remove { width: 24px; height: 24px; }
  .ui-tag__input { height: 30px; }
}

@keyframes ui-tag-in {
  from { opacity: 0; transform: scale(0.85); filter: blur(2px); }
}
@keyframes ui-tag-flash {
  20%, 60% { background: var(--ui-tag-flash); }
}
@keyframes ui-tag-message {
  from { opacity: 0; transform: translateY(-3px); filter: blur(2px); }
}

@media (prefers-reduced-motion: reduce) {
  .ui-tag * { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-tag {
  --ui-tag-title: var(--aui-ink, #ededed);
  --ui-tag-ink: var(--aui-ink, #ededed);
  --ui-tag-muted: var(--aui-muted, #c8c8cc);
  --ui-tag-subtle: var(--aui-muted, #8b8b92);
  --ui-tag-faint: var(--aui-placeholder, #5c5c63);
  --ui-tag-surface: var(--aui-surface, #19191b);
  --ui-tag-line: var(--aui-border, #2a2a2e);
  --ui-tag-edge: var(--aui-border-strong, #3a3a40);
  --ui-tag-edge-focus: var(--aui-border-strong, #4e4e55);
  --ui-tag-chip: #232326;
  --ui-tag-chip-edge: #2f2f34;
  --ui-tag-chip-armed: #303035;
  --ui-tag-avatar: #2c2c31;
  --ui-tag-flash: rgba(77, 141, 255, 0.28);
  --ui-tag-danger: var(--aui-danger, #ff8a7a);
  --ui-tag-danger-edge: color-mix(in srgb, var(--aui-red, #ff6b5f) 45%, transparent);
  --ui-tag-danger-wash: color-mix(in srgb, var(--aui-red, #ff6b5f) 6%, transparent);
  --ui-tag-focus: var(--aui-focus, rgba(77, 141, 255, 0.8));
}
`;
