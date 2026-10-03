"use client";

import { useState } from "react";

/*
 * Setup Guide – an onboarding panel with a progress bar and collapsible task groups, in a single self-contained file.
 * Tasks unlock one after another; finished tasks and groups are struck through.
 * The styles are injected below, so no extra files are needed.
 */

export type SetupTask = {
  id: string;
  label: string;
  done?: boolean;
};

export type SetupGroup = {
  id: string;
  title: string;
  tasks: SetupTask[];
};

export type SetupGuideProps = {
  title?: string;
  groups: SetupGroup[];
  /** Shows an "Edit" link in the header */
  onEdit?: () => void;
  /** Shows a close button in the header */
  onClose?: () => void;
  /** Called with the ids of all finished tasks */
  onChange?: (done: string[]) => void;
  className?: string;
};

export function SetupGuide({ title = "Setup guide", groups, onEdit, onClose, onChange, className }: SetupGuideProps) {
  const [done, setDone] = useState(
    () => new Set(groups.flatMap((g) => g.tasks.filter((t) => t.done).map((t) => t.id))),
  );
  const firstOpen = groups.find((g) => g.tasks.some((t) => !done.has(t.id)));
  const [open, setOpen] = useState<string | null>(firstOpen?.id ?? null);
  const [minimized, setMinimized] = useState(false);

  const total = groups.reduce((n, g) => n + g.tasks.length, 0);
  const progress = total ? done.size / total : 0;

  const toggle = (group: SetupGroup, id: string) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDone(next);
    onChange?.([...next]);
    // A finished group folds away and the next open one unfolds
    if (group.tasks.every((t) => next.has(t.id))) {
      const following = groups.find((g) => g.tasks.some((t) => !next.has(t.id)));
      window.setTimeout(() => setOpen(following?.id ?? null), 420);
    }
  };

  return (
    <>
      <style href="ui-setup-guide" precedence="default">
        {css}
      </style>
      <section className={["ui-sg", className].filter(Boolean).join(" ")} aria-label={title}>
        <header className="ui-sg__head">
          <h3 className="ui-sg__title">{title}</h3>
          <div className="ui-sg__actions">
            {onEdit && (
              <button type="button" className="ui-sg__edit" onClick={onEdit}>
                Edit
              </button>
            )}
            <button
              type="button"
              className="ui-sg__icon-btn"
              aria-label={minimized ? "Expand setup guide" : "Minimize setup guide"}
              aria-expanded={!minimized}
              onClick={() => setMinimized((m) => !m)}
            >
              {minimized ? <ExpandIcon /> : <MinimizeIcon />}
            </button>
            {onClose && (
              <button type="button" className="ui-sg__icon-btn" aria-label="Close setup guide" onClick={onClose}>
                <CloseIcon />
              </button>
            )}
          </div>
        </header>

        <span
          className="ui-sg__track"
          role="progressbar"
          aria-label={`${title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span className="ui-sg__fill" style={{ transform: `scaleX(${progress})` }} />
        </span>

        <div className="ui-sg__body" data-hidden={minimized || undefined}>
          <div className="ui-sg__groups">
            {groups.map((group) => {
              const isOpen = open === group.id;
              const finished = group.tasks.every((t) => done.has(t.id));
              // The first open task is the current one, everything after it waits
              const current = group.tasks.find((t) => !done.has(t.id))?.id;
              const currentIndex = group.tasks.findIndex((t) => t.id === current);
              const panelId = `ui-sg-${group.id}`;
              return (
                <div key={group.id} className="ui-sg__group" data-open={isOpen || undefined}>
                  <button
                    type="button"
                    className="ui-sg__group-head"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : group.id)}
                  >
                    <span className="ui-sg__group-title" data-done={finished || undefined}>
                      {group.title}
                    </span>
                    <ChevronIcon />
                  </button>
                  <div className="ui-sg__panel" id={panelId} inert={!isOpen}>
                    <ul className="ui-sg__tasks">
                      {group.tasks.map((task, index) => {
                        const isDone = done.has(task.id);
                        const locked = !isDone && currentIndex !== -1 && index > currentIndex;
                        const state = isDone ? "done" : locked ? "locked" : "current";
                        return (
                          <li key={task.id}>
                            <button
                              type="button"
                              className="ui-sg__task"
                              data-state={state}
                              disabled={locked}
                              aria-pressed={isDone}
                              onClick={() => toggle(group, task.id)}
                            >
                              <span className="ui-sg__mark" aria-hidden="true">
                                {state === "done" ? <CheckIcon /> : state === "locked" ? <LockedIcon /> : null}
                              </span>
                              <span className="ui-sg__task-label">{task.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- Icons ---------- */

const ChevronIcon = () => (
  <svg className="ui-sg__chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
  </svg>
);

const MinimizeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.5 2.5v4h4M9.5 6.5l4.5-4.5M6.5 13.5v-4h-4M6.5 9.5 2 14" />
  </svg>
);

const ExpandIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 2h4v4M14 2 9.5 6.5M6 14H2v-4M2 14l4.5-4.5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="7" fill="currentColor" />
    <path d="m5 8.2 2 2 4-4.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockedIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
    <path d="m4 12 8-8" />
  </svg>
);

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-sg {
  --ui-sg-card: #ffffff;
  --ui-sg-line: #ececec;
  --ui-sg-ink: #171717;
  --ui-sg-text: #262626;
  --ui-sg-muted: #a3a3a3;
  --ui-sg-icon: #737373;
  --ui-sg-track: #ececec;
  --ui-sg-accent: #2f6bff;
  --ui-sg-open: #f6f6f7;
  --ui-sg-dot: #e1e3e8;
  --ui-sg-ease: cubic-bezier(0.22, 1, 0.36, 1);
  box-sizing: border-box;
  width: 100%;
  max-width: 320px;
  padding: 16px 8px 8px;
  background: var(--ui-sg-card);
  border: 1px solid var(--ui-sg-line);
  border-radius: 20px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 8px 24px rgba(0, 0, 0, 0.035);
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ui-sg-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-sg *, .ui-sg *::before, .ui-sg *::after { box-sizing: border-box; }
.ui-sg button {
  margin: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.ui-sg button:focus-visible {
  outline: 2px solid var(--ui-sg-accent);
  outline-offset: 2px;
}

.ui-sg__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 8px;
}
.ui-sg__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}
.ui-sg__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: -4px;
}
.ui-sg__edit {
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-sg-accent) !important;
  transition: opacity 160ms ease;
}
.ui-sg__edit:hover { opacity: 0.75; }
.ui-sg__icon-btn {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  color: var(--ui-sg-icon) !important;
  transition: background-color 160ms ease, color 160ms ease;
}
.ui-sg__icon-btn:hover { background: #f2f2f2 !important; color: var(--ui-sg-ink) !important; }
.ui-sg__icon-btn svg { width: 16px; height: 16px; }

/* One continuous bar for all tasks */
.ui-sg__track {
  display: block;
  height: 5px;
  margin: 10px 8px 8px;
  overflow: hidden;
  border-radius: 3px;
  background: var(--ui-sg-track);
}
.ui-sg__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--ui-sg-accent);
  transform-origin: left center;
  transition: transform 700ms var(--ui-sg-ease);
}

/* Minimize folds the whole list away */
.ui-sg__body {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 420ms var(--ui-sg-ease), opacity 260ms ease;
}
.ui-sg__body[data-hidden] { grid-template-rows: 0fr; opacity: 0; }
.ui-sg__groups { min-height: 0; overflow: hidden; }

.ui-sg__group {
  border-radius: 12px;
  transition: background-color 260ms ease;
}
.ui-sg__group[data-open] { background: var(--ui-sg-open); }
.ui-sg__group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border-radius: 12px;
  text-align: left;
}
.ui-sg__group-title {
  position: relative;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  transition: color 300ms ease;
}
/* Finished: a line draws through the title */
.ui-sg__group-title::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 52%;
  height: 1.5px;
  border-radius: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 420ms var(--ui-sg-ease);
}
.ui-sg__group-title[data-done]::after { transform: scaleX(1); }
.ui-sg__chevron {
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--ui-sg-icon);
  transition: transform 320ms var(--ui-sg-ease);
}
.ui-sg__group[data-open] .ui-sg__chevron { transform: rotate(180deg); }

/* Each group is a dropdown */
.ui-sg__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 380ms var(--ui-sg-ease);
}
.ui-sg__group[data-open] .ui-sg__panel { grid-template-rows: 1fr; }
.ui-sg__tasks {
  min-height: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ui-sg__tasks li:last-child { padding-bottom: 8px; }
.ui-sg__task {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 7px 12px;
  border-radius: 10px;
  text-align: left;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 260ms ease, transform 320ms var(--ui-sg-ease), color 260ms ease;
}
.ui-sg__group[data-open] .ui-sg__task { opacity: 1; transform: none; transition-delay: 80ms; }
.ui-sg__task[data-state="current"] { color: var(--ui-sg-text); }
.ui-sg__task[data-state="current"]:hover .ui-sg__mark { background: #d3d7de; }
.ui-sg__task[data-state="locked"] { color: var(--ui-sg-muted); cursor: default; }
.ui-sg__task[data-state="done"] { color: var(--ui-sg-muted); }
.ui-sg__mark {
  display: grid;
  place-items: center;
  flex: none;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border-radius: 50%;
  transition: background-color 200ms ease;
}
.ui-sg__task[data-state="current"] .ui-sg__mark { background: var(--ui-sg-dot); }
.ui-sg__task[data-state="locked"] .ui-sg__mark { color: #d4d4d4; }
.ui-sg__task[data-state="done"] .ui-sg__mark { color: var(--ui-sg-accent); }
.ui-sg__mark svg { width: 16px; height: 16px; }
.ui-sg__task[data-state="done"] .ui-sg__mark svg { animation: ui-sg-pop 420ms var(--ui-sg-ease); }
.ui-sg__task-label {
  font-size: 14px;
  line-height: 20px;
  text-decoration-line: line-through;
  text-decoration-color: transparent;
  text-decoration-thickness: 1.5px;
  transition: text-decoration-color 260ms ease;
}
.ui-sg__task[data-state="done"] .ui-sg__task-label { text-decoration-color: currentColor; }

@keyframes ui-sg-pop {
  from { transform: scale(0.5); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ui-sg__fill, .ui-sg__body, .ui-sg__panel, .ui-sg__task, .ui-sg__chevron, .ui-sg__group-title::after { transition: none; }
  .ui-sg__mark svg { animation: none !important; }
}
`;
