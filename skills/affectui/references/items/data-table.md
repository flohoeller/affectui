# Data Table (Pro)

Spreadsheet-style table: select cells and ranges, edit in place, copy and paste, undo and sort

- Page: https://www.affectui.com/components/data-table
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/data-table.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/data-table-clean.json` (needs the Pro access key) – lands as `data-table-clean.tsx`, import from `@/components/ui/data-table-clean` – its docs: `data-table-clean.md`
- Import: `@/components/ui/data-table`

### When to use

- Small databases people edit in place – tools, vendors, budgets, contacts
- Data that moves to and from Excel or Google Sheets with copy and paste
- Lists where people pick several rows to act on

### When not to use

- Thousands of rows – add virtualisation, filters and server paging with a grid library
- Editing one record with many fields – a form is clearer

### Usage

```tsx
import { DataTable, TextColumnIcon, TagColumnIcon } from "@/components/ui/data-table";

const columns = [
  { key: "tool", label: "Tool", icon: <TextColumnIcon />, type: "title" },
  { key: "category", label: "Category", icon: <TagColumnIcon />, type: "tag" },
  { key: "website", label: "Website", type: "link" },
  { key: "seats", label: "Seats", type: "number" },
];

export function Stack() {
  return (
    <DataTable
      title="Design Stack"
      columns={columns}
      rows={rows}
      tagTones={{ Design: "violet" }}
      onRowsChange={save}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | Heading in the gray tray, also the grid's accessible name |
| icon | `ReactNode` |  | Icon in front of the heading |
| columns | `DataColumn[]` |  | key, label, icon, width, type (title, tag, link, number, text), editable, options for tags and format for numbers – numbers default to grouped digits with a real minus sign (12,345,679 · −4,200) |
| rows | `DataRow[]` |  | Starting rows – an id, an optional logo and a value per column key |
| tagTones | `Record<string, TagTone>` |  | Tag color per tag text: blue, violet, pink, green, amber or gray |
| editable | `boolean` | `true` | false keeps selection and copy, but turns off editing, paste, delete and Add row |
| onRowsChange | `(rows: DataRow[]) => void` |  | Called with all rows after every edit, paste, clear, delete, undo or redo |
| onSelectionChange | `(ids: string[]) => void` |  | Called with the ids of the checked rows |
| className | `string` |  | Extra class on the tray |

### Keyboard

- Arrow keys: Move the active cell
- Shift / Arrow keys: Grow the selected range
- ⌘ / Ctrl / Arrow keys: Jump to the first or last row or column
- Tab: Move to the next cell, Shift + Tab to the previous one
- Enter / F2: Edit the active cell; Enter saves and moves down
- Any character: Start editing with that character
- Escape: Cancel an edit or collapse the range
- Delete / Backspace: Clear the selected cells
- ⌘ / Ctrl / C / X / V: Copy, cut and paste – works with Excel and Google Sheets
- ⌘ / Ctrl / Z: Undo, add Shift to redo
- ⌘ / Ctrl / A: Select every cell

### Accessibility

- The table is a grid with selected cells marked, so screen readers follow the active cell and the range
- Column headers are sort buttons and report the sort direction
- Row checkboxes have labels; the header checkbox shows a mixed state when only some rows are checked

### Motion

- Tag picker drops in, sort arrows turn, checkboxes pop – reduced motion turns all of it off

### Responsive

- The table scrolls sideways inside the card on narrow screens instead of squeezing the columns
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: kpi-chart, change-summary
