"use client";

import { useRef, useState, type ReactNode } from "react";

/*
 * Data Table – a database-style table with row selection, logos, tags and links, in a single self-contained file.
 * The styles are injected below, so no extra files are needed.
 */

export type DataColumn = {
  key: string;
  label: string;
  icon?: ReactNode;
  /** title: logo and name · tag: colored pill · link: underlined URL · number / text: plain value */
  type?: "title" | "tag" | "link" | "number" | "text";
  /** Column width, any CSS length */
  width?: string;
};

export type DataRow = {
  id: string;
  /** Small logo in front of the title cell */
  logo?: ReactNode;
  [key: string]: ReactNode;
};

export type DataTableProps = {
  title: string;
  /** Icon in front of the title */
  icon?: ReactNode;
  columns: DataColumn[];
  rows: DataRow[];
  /** Tag colors by tag text – falls back to blue */
  tagTones?: Record<string, TagTone>;
  /** Shows "Add row" at the bottom; called when it is clicked */
  onAddRow?: () => void;
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
};

export type TagTone = "blue" | "violet" | "pink" | "green" | "amber" | "gray";

export function DataTable({
  title,
  icon,
  columns,
  rows: initialRows,
  tagTones = {},
  onAddRow,
  onSelectionChange,
  className,
}: DataTableProps) {
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const added = useRef(0);

  const all = rows.length > 0 && selected.size === rows.length;
  const some = selected.size > 0 && !all;

  const update = (next: Set<string>) => {
    setSelected(next);
    onSelectionChange?.([...next]);
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update(next);
  };

  const addRow = () => {
    if (onAddRow) return onAddRow();
    added.current += 1;
    setRows((r) => [...r, { id: `new-${added.current}`, [titleKey(columns)]: "Untitled" }]);
  };

  return (
    <>
      <style href="ui-data-table" precedence="default">
        {css}
      </style>
      <section className={["ui-dt", className].filter(Boolean).join(" ")} aria-label={title}>
        <header className="ui-dt__head">
          {icon && <span className="ui-dt__title-icon">{icon}</span>}
          <h3 className="ui-dt__title">{title}</h3>
        </header>

        <div className="ui-dt__card">
        <div className="ui-dt__scroll">
          <table className="ui-dt__table">
            <colgroup>
              <col style={{ width: 44 }} />
              {columns.map((c) => (
                <col key={c.key} style={c.width ? { width: c.width } : undefined} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="ui-dt__select">
                  <Checkbox
                    checked={all}
                    mixed={some}
                    label="Select all rows"
                    onChange={() => update(all ? new Set() : new Set(rows.map((r) => r.id)))}
                  />
                </th>
                {columns.map((c) => (
                  <th key={c.key} scope="col" data-type={c.type}>
                    <span className="ui-dt__th">
                      {c.icon && <span className="ui-dt__col-icon">{c.icon}</span>}
                      {c.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = selected.has(row.id);
                return (
                  <tr key={row.id} data-selected={isSelected || undefined}>
                    <td className="ui-dt__select">
                      <Checkbox checked={isSelected} label={`Select ${String(row[titleKey(columns)])}`} onChange={() => toggle(row.id)} />
                    </td>
                    {columns.map((c) => (
                      <td key={c.key} data-type={c.type}>
                        <Cell column={c} row={row} tone={tagTones} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
        <footer className="ui-dt__foot">
          <button type="button" className="ui-dt__add" onClick={addRow}>
            <PlusIcon />
            Add row
          </button>
        </footer>
      </section>
    </>
  );
}

const titleKey = (columns: DataColumn[]) => columns.find((c) => c.type === "title")?.key ?? columns[0]?.key ?? "name";

function Cell({ column, row, tone }: { column: DataColumn; row: DataRow; tone: Record<string, TagTone> }) {
  const value = row[column.key];
  if (column.type === "title") {
    return (
      <span className="ui-dt__name">
        {row.logo ? <span className="ui-dt__logo">{row.logo}</span> : <span className="ui-dt__logo ui-dt__logo--empty" />}
        <span className="ui-dt__name-text">{value}</span>
      </span>
    );
  }
  if (value === undefined || value === null || value === "") return null;
  if (column.type === "tag") {
    return (
      <span className="ui-dt__tag" data-tone={tone[String(value)] ?? "blue"}>
        {value}
      </span>
    );
  }
  if (column.type === "link") {
    const href = String(value);
    return (
      <a className="ui-dt__link" href={href} target="_blank" rel="noreferrer">
        {href.replace(/^https?:\/\//, "")}
      </a>
    );
  }
  return <span className="ui-dt__text">{value}</span>;
}

function Checkbox({
  checked,
  mixed,
  label,
  onChange,
}: {
  checked: boolean;
  mixed?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : checked}
      aria-label={label}
      className="ui-dt__check"
      onClick={onChange}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {mixed ? <path d="M4.5 8h7" /> : <path d="m4.25 8.25 2.5 2.5 5-5.5" />}
      </svg>
    </button>
  );
}

/* ---------- Icons ---------- */

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

const col = (d: string) => (
  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
export const TextColumnIcon = () => col("M3 4h10M3 7h10M3 10h10M3 13h6");
export const TagColumnIcon = () => col("M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z");
export const LinkColumnIcon = () => col("M6.5 9.5l3-3M7.25 4.75l1-1a2.5 2.5 0 0 1 3.5 3.5l-1 1M8.75 11.25l-1 1a2.5 2.5 0 0 1-3.5-3.5l1-1");
export const NumberColumnIcon = () => col("M6 2.5 4.5 13.5M11.5 2.5 10 13.5M2.5 6h11M2 10.5h11");
export const DateColumnIcon = () => col("M3 4.5h10v9H3zM3 7.5h10M6 2.5v3M10 2.5v3");

/* ---------- Styles ---------- */

const css = /* css */ `
.ui-dt {
  --ui-dt-card: #ffffff;
  --ui-dt-line: #ececec;
  --ui-dt-grid: #f0f0f0;
  --ui-dt-ink: #171717;
  --ui-dt-text: #404040;
  --ui-dt-muted: #8f8f8f;
  --ui-dt-faint: #b5b5b5;
  --ui-dt-hover: #fafafa;
  --ui-dt-selected: #f5f8ff;
  --ui-dt-accent: #2f6bff;
  --ui-dt-tray: #f0f0f0;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  /* Like the Chat Composer: a gray tray with the title, the white table card sits on top of it */
  background: var(--ui-dt-tray);
  border-radius: 20px;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: var(--ui-dt-ink);
  -webkit-font-smoothing: antialiased;
}
.ui-dt *, .ui-dt *::before, .ui-dt *::after { box-sizing: border-box; }

.ui-dt__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px 11px;
}
.ui-dt__card {
  overflow: hidden;
  background: var(--ui-dt-card);
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.ui-dt__title {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: -0.01em;
}
.ui-dt__title-icon { display: grid; }
.ui-dt__title-icon svg { width: 18px; height: 18px; }

.ui-dt__scroll {
  overflow-x: auto;
  scrollbar-width: thin;
}
.ui-dt__table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
  line-height: 20px;
}
/* Every row is 44px high and the selection column 44px wide, so its cells are squares */
.ui-dt__table th,
.ui-dt__table td {
  height: 44px;
  padding: 0 14px;
  border-top: 1px solid var(--ui-dt-grid);
  border-left: 1px solid var(--ui-dt-grid);
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ui-dt__table th:first-child,
.ui-dt__table td:first-child { border-left: 0; }
.ui-dt__table th {
  font-weight: 450;
  color: var(--ui-dt-muted);
  border-top: 0;
}
.ui-dt__th {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ui-dt__col-icon { display: grid; color: var(--ui-dt-faint); }
/* Selection column: one checkbox per row, centered */
.ui-dt__table .ui-dt__select {
  padding: 0;
  text-align: center;
}
.ui-dt__select .ui-dt__check { margin: 0 auto; }

.ui-dt__table tbody tr { transition: background-color 140ms ease; }
.ui-dt__table tbody tr:hover { background: var(--ui-dt-hover); }
.ui-dt__table tbody tr[data-selected] { background: var(--ui-dt-selected); }

.ui-dt__name {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.ui-dt__name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ui-dt-ink);
}
.ui-dt__logo {
  display: grid;
  place-items: center;
  flex: none;
  width: 18px;
  height: 18px;
}
.ui-dt__logo svg { width: 100%; height: 100%; }
.ui-dt__logo--empty {
  border-radius: 5px;
  background: var(--ui-dt-grid);
}

.ui-dt__check {
  display: grid;
  place-items: center;
  flex: none;
  width: 16px;
  height: 16px;
  margin: 0;
  padding: 0;
  border: 1px solid #d4d4d4;
  border-radius: 5px;
  background: #fff;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease;
}
.ui-dt__check:hover { border-color: #a3a3a3; }
.ui-dt__check:focus-visible { outline: 2px solid var(--ui-dt-accent); outline-offset: 2px; }
.ui-dt__check svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: #fff;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 140ms ease, transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ui-dt__check[aria-checked="true"],
.ui-dt__check[aria-checked="mixed"] {
  background: var(--ui-dt-ink);
  border-color: var(--ui-dt-ink);
}
.ui-dt__check[aria-checked="true"] svg,
.ui-dt__check[aria-checked="mixed"] svg { opacity: 1; transform: none; }

/* Tags: soft fill with a hairline in the same hue */
.ui-dt__tag {
  display: inline-block;
  max-width: 100%;
  padding: 2px 9px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 450;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
.ui-dt__tag[data-tone="blue"] { background: #eef3ff; color: #2f6bff; box-shadow: inset 0 0 0 1px #dce6ff; }
.ui-dt__tag[data-tone="violet"] { background: #f4f0ff; color: #7c4dff; box-shadow: inset 0 0 0 1px #e7dfff; }
.ui-dt__tag[data-tone="pink"] { background: #fff0f6; color: #db2777; box-shadow: inset 0 0 0 1px #fde0ec; }
.ui-dt__tag[data-tone="green"] { background: #edfaf3; color: #15803d; box-shadow: inset 0 0 0 1px #d5f2e2; }
.ui-dt__tag[data-tone="amber"] { background: #fff6e8; color: #b45309; box-shadow: inset 0 0 0 1px #fde9c8; }
.ui-dt__tag[data-tone="gray"] { background: #f5f5f5; color: #525252; box-shadow: inset 0 0 0 1px #ebebeb; }

.ui-dt__link {
  color: var(--ui-dt-text);
  text-decoration: underline;
  text-decoration-color: #d4d4d4;
  text-underline-offset: 3px;
  transition: text-decoration-color 140ms ease, color 140ms ease;
}
.ui-dt__link:hover { color: var(--ui-dt-ink); text-decoration-color: currentColor; }
.ui-dt__text { color: var(--ui-dt-text); font-variant-numeric: tabular-nums; }

/* Gray extension under the card, like the title above it */
.ui-dt__foot {
  padding: 6px 8px 7px;
}
.ui-dt__add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  margin: 0;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: none;
  font: inherit;
  color: var(--ui-dt-muted);
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease;
}
.ui-dt__add:hover { background: rgba(0, 0, 0, 0.04); color: var(--ui-dt-ink); }
.ui-dt__add:focus-visible { outline: 2px solid var(--ui-dt-accent); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .ui-dt__table tbody tr, .ui-dt__check, .ui-dt__check svg { transition: none; }
}
`;
