# Filter Menu, clean style (Free)

Grouped filters with removable chips, collapsible checkbox groups, Clear all and full keyboard control

- Page: https://www.affectui.com/components/filter-menu
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/filter-menu-clean.json`
- Import: `@/components/ui/filter-menu-clean`

### When to use

- Filtering a list, table or board by a few groups of options – stage, owner, region and the like
- Side panels or popovers where people pick several filters and want to see them all at a glance

### When not to use

- A single choice from a short list – use a select or segmented control
- Free-text search or numeric ranges with a slider – this menu works with predefined options

### Usage

```tsx
import { FilterMenu } from "@/components/ui/filter-menu-clean";

const groups = [
  { id: "stage", label: "Stage", options: [{ id: "new", label: "New lead" }, { id: "won", label: "Won" }] },
  { id: "size", label: "Deal size", chipPrefix: "Deal: ", options: [{ id: "s", label: "Under $5k" }, { id: "l", label: "Over $50k" }] },
];

export function DealFilters() {
  const [filters, setFilters] = useState({});
  return <FilterMenu groups={groups} value={filters} onChange={setFilters} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| groups | `FilterGroup[]` |  | Required. Each { id, label, options: { id, label }[], chipPrefix? } |
| value | `Record<string, string[]>` |  | Picked option ids per group – makes it controlled |
| defaultValue | `Record<string, string[]>` | `{}` | Starting filters when uncontrolled |
| onChange | `(value) => void` |  | Called with the new filters after every change |
| defaultOpen | `string[]` | `the first group` | Groups that start open |
| title | `string` | `"Filters"` | Heading on top |
| hints | `boolean` | `true` | Shows the keyboard hints as the last row of the card |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↑ / ↓: Moves through group headers and the options of open groups
- Enter / Space: Picks or unpicks an option, or opens and closes a group
- → / ←: Opens a group, or closes it and jumps back to its header
- Home / End: Jumps to the first or last row

### Accessibility

- Group headers are buttons with aria-expanded; options are role=checkbox with aria-checked
- One roving tab stop for the list, so Tab moves past it in one step
- Each chip has a remove button labelled with the filter; changes to the chips are announced politely

### Motion

- Groups open and close by animating their height; the chevron turns along
- Chips pop in, and their line glides open or shut when the first filter is picked or the last one removed
- Checkboxes turn blue and their checkmark draws itself in; row hovers come in crisp and fade out
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container up to 400px wide; chips stay on one line and the rest go into "+N"
- Touch screens get taller rows and buttons; the keyboard hints are hidden there
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
