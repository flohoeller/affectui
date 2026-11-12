"use client";

import { cloneElement, isValidElement, useId, type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";

/*
 * Form Field – a single self-contained file.
 * The frame around any control: a label, a required mark or "Optional", a quiet hint, an error that takes the hint's
 * place and a slot for a count. It hands the control its id, aria-describedby, aria-invalid and aria-required, so a
 * plain <input>, a <select>, a textarea or your own control is wired up without extra code.
 * The styles are injected below, so no extra files are needed.
 */

/** What the field hands its control – spread it onto the element that takes focus */
export type FormFieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
  /** The label's id – for controls a <label> can't name, like a radio group: pass it as aria-labelledby */
  labelId: string;
  disabled?: boolean;
};

export type FormFieldProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  /** Shown above the control and tied to it */
  label?: ReactNode;
  /** A quiet line under the control – the error takes its place while there is one */
  hint?: ReactNode;
  /** Marks the control invalid and shows this under it, in place of the hint; true marks it without a message */
  error?: ReactNode;
  /** A small mark after the label, and aria-required on the control */
  required?: boolean;
  /** "Optional" next to the label – for forms where most fields are required */
  optional?: boolean;
  /** Under the control at the end, e.g. "12/40" – read out with the hint */
  counter?: ReactNode;
  /** Dims the field and disables the control */
  disabled?: boolean;
  /** The control's id – it keeps its own id if it has one, otherwise one is made up */
  htmlFor?: string;
  /** One control element – it gets the ids and aria attributes – or a function that spreads them where they belong */
  children: ReactElement | ((control: FormFieldControlProps) => ReactNode);
};

export function FormField({
  label,
  hint,
  error,
  required = false,
  optional = false,
  counter,
  disabled = false,
  htmlFor,
  className,
  children,
  ...rest
}: FormFieldProps) {
  const autoId = useId();
  const child = typeof children === "function" ? null : isValidElement<Record<string, unknown>>(children) ? children : null;
  const childProps = (child?.props ?? {}) as Record<string, unknown>;

  const controlId = (typeof childProps.id === "string" && childProps.id) || htmlFor || `${autoId}-control`;
  const labelId = `${autoId}-label`;
  const messageId = `${autoId}-message`;
  const counterId = `${autoId}-count`;

  const invalid = Boolean(error);
  // Only text or elements count – error={true} marks the control invalid without leaving an empty line
  const message = shows(error) ? error : shows(hint) ? hint : null;
  const hasCounter = shows(counter);
  const describedBy =
    [typeof childProps["aria-describedby"] === "string" ? childProps["aria-describedby"] : null, message ? messageId : null, hasCounter ? counterId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const control: FormFieldControlProps = {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": invalid || undefined,
    "aria-required": required || undefined,
    labelId,
    disabled: disabled || undefined,
  };

  let body: ReactNode = null;
  if (typeof children === "function") body = children(control);
  else if (child) {
    const tag = typeof child.type === "string" ? child.type : null;
    const native = tag !== null && NATIVE.includes(tag);
    const named = childProps["aria-label"] != null || childProps["aria-labelledby"] != null;
    body = cloneElement(child, {
      id: controlId,
      "aria-describedby": describedBy,
      "aria-invalid": invalid || childProps["aria-invalid"] || undefined,
      "aria-required": required || childProps["aria-required"] || undefined,
      // A native control also gets required, so the browser checks it on submit
      ...(native && required ? { required: true } : null),
      // A <div role="radiogroup"> and the like can't be named by a <label> – point at it instead
      ...(tag !== null && !native && !named && label != null ? { "aria-labelledby": labelId } : null),
      ...(disabled ? { disabled: true } : null),
    });
  }

  return (
    <div
      {...rest}
      className={["ui-fld", className].filter(Boolean).join(" ")}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {/* React 19 hoists this into <head> once, no matter how many fields render */}
      <style href="ui-form-field" precedence="default">
        {css}
      </style>
      {label != null && (
        <div className="ui-fld__head">
          <label className="ui-fld__label" id={labelId} htmlFor={controlId}>
            {label}
            {required && (
              <span className="ui-fld__required" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optional && !required && <span className="ui-fld__optional">Optional</span>}
        </div>
      )}
      {body}
      {(message || hasCounter) && (
        <div className="ui-fld__foot">
          {/* The error swaps in where the hint was, so the form below doesn't move */}
          <p className="ui-fld__message" id={messageId} key={shows(error) ? "error" : "hint"} dir="auto" aria-live={shows(error) ? "polite" : undefined}>
            {message}
          </p>
          {hasCounter && (
            <span className="ui-fld__count" id={counterId}>
              {counter}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Elements a <label for> names and that take required */
const NATIVE = ["input", "select", "textarea"];
/** Text or an element – not true, false, null or an empty string */
const shows = (v: ReactNode) => v != null && typeof v !== "boolean" && v !== "";

const css = /* css */ `
/* Colors and motion as variables – override them on .ui-fld (see Theming in the docs) */
.ui-fld {
  --ui-fld-ink: var(--aui-ink, #171717);
  --ui-fld-muted: var(--aui-muted, #8f8f8f);
  --ui-fld-faint: var(--aui-placeholder, #b5b5b5);
  --ui-fld-danger: var(--aui-danger, #c4320a);
  --ui-fld-ease: cubic-bezier(0.22, 1, 0.36, 1);

  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  font-family: var(--aui-font, "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
  font-size: 13.5px;
  line-height: 20px;
  color: var(--ui-fld-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-fld[data-disabled] { opacity: 0.55; }

.ui-fld__head { display: flex; align-items: baseline; gap: 6px; min-width: 0; padding: 0 2px; }
.ui-fld__label { min-width: 0; font-size: 13px; font-weight: 500; color: var(--ui-fld-ink); overflow-wrap: anywhere; cursor: default; }
/* The required mark: quiet, right after the last word */
.ui-fld__required { margin-inline-start: 2px; color: var(--ui-fld-muted); font-weight: 400; white-space: nowrap; }
.ui-fld__optional { flex: none; font-size: 12px; line-height: 16px; color: var(--ui-fld-muted); }

/* Under the control: the hint, or the error in its place, and the count */
.ui-fld__foot { display: flex; align-items: flex-start; gap: 12px; min-width: 0; padding: 0 2px; }
.ui-fld__message {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12.5px;
  line-height: 17px;
  color: var(--ui-fld-muted);
  overflow-wrap: anywhere;
  animation: ui-fld-message 260ms var(--ui-fld-ease);
}
.ui-fld[data-invalid] .ui-fld__message { color: var(--ui-fld-danger); }
.ui-fld__count { flex: none; margin-inline-start: auto; font-size: 12px; line-height: 17px; font-variant-numeric: tabular-nums; color: var(--ui-fld-faint); white-space: nowrap; }

@keyframes ui-fld-message {
  from { opacity: 0; transform: translateY(-3px); filter: blur(2px); }
}
@media (prefers-reduced-motion: reduce) {
  .ui-fld__message { animation-duration: 1ms; }
}

/* Dark mode: follows a .dark class or data-theme="dark" on any ancestor, e.g. <html> */
:where(.dark, [data-theme="dark"]) .ui-fld {
  --ui-fld-ink: var(--aui-ink, #ededed);
  --ui-fld-muted: var(--aui-muted, #8b8b92);
  --ui-fld-faint: var(--aui-placeholder, #5c5c63);
  --ui-fld-danger: var(--aui-danger, #ff8a7a);
}
`;
