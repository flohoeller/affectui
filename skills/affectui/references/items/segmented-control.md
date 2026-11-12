# Segmented Control (Free)

Switch between two to six options – a raised pill or underline that glides, stretches a little and can be dragged across, with icons, counts and badges

- Page: https://www.affectui.com/components/segmented-control
- Section: Components · Navigation
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/segmented-control.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/segmented-control-clean.json` – lands as `segmented-control-clean.tsx`, import from `@/components/ui/segmented-control-clean` – its docs: `segmented-control-clean.md`
- Import: `@/components/ui/segmented-control`

### When to use

- Switching between two to six views of the same content – sections of a dashboard, list / board / calendar, monthly / yearly
- A choice that applies right away and where every option should stay visible

### When not to use

- More than six options or long labels – use a select or a menu
- Choices that are confirmed with a Save button inside a form – radio buttons read clearer there
- Turning one thing on or off – that's a switch

### Usage

```tsx
import { SegmentedControl } from "@/components/ui/segmented-control";

export function DashboardTabs() {
  const [section, setSection] = useState("overview");
  return (
    <SegmentedControl
      aria-label="Dashboard section"
      kind="tabs"
      value={section}
      onChange={setSection}
      options={[
        { value: "overview", label: "Overview", controls: "panel-overview" },
        { value: "analytics", label: "Analytics", controls: "panel-analytics" },
        { value: "reports", label: "Reports", controls: "panel-reports" },
        { value: "notifications", label: "Notifications", count: unread, controls: "panel-notifications" },
      ]}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| options | `SegmentOption[]` |  | { value, label?, icon?, count?, badge?, disabled?, ariaLabel?, controls? } – two to six work best; give icon-only options an ariaLabel |
| value | `string` |  | Controlled value |
| defaultValue | `string` | `first enabled option` | Starting value when uncontrolled |
| onChange | `(value: string) => void` |  | Called with the new value – on click, while dragging the pill and on arrow keys |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 26, 30 or 36px tall options (40px+ on touch screens) |
| variant | `"tray" \| "underline"` | `"tray"` | A gray track with a raised white pill, or text tabs on a hairline with a sliding line |
| fullWidth | `boolean` | `false` | Fills its container with equal segments, each as wide as the widest one needs |
| kind | `"radio" \| "tabs"` | `"radio"` | A radiogroup, or a tablist that switches panels (pair with controls on each option) |
| disabled | `boolean` | `false` | Disables the whole control |
| aria-label | `string` |  | Names the group – or use aria-labelledby |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Focuses the active option (one tab stop for the whole control)
- ← / →: Moves to and selects the previous or next option, wrapping around; ↑ ↓ too as a radiogroup
- Home / End: Selects the first or last option
- ↵: Selects the focused option (Space works too)

### Accessibility

- A radiogroup with radios (aria-checked), or a tablist with tabs (aria-selected, aria-controls) with kind="tabs"
- Roving tabindex: only the active option is in the tab order; disabled options are skipped by the arrow keys
- The semibold copy of each label is aria-hidden, so names are read once; counts and badges are part of the name
- Visible focus ring on the focused option

### Motion

- The indicator glides to the picked option; the edge facing the target leads, so it stretches a little and settles – calm, no bounce
- Labels crossfade from regular to semibold while the semibold copy holds the width, so neighbours never shift
- When a label or count changes, the option and the whole control morph to the new width and the pill follows; a new count blurs in
- Pressing gives the pill a little (scale 0.97); dragging it across the options selects as you go
- With prefers-reduced-motion everything switches instantly

### Responsive

- If it doesn't fit, it scrolls sideways with soft edges on the sides that hide options and keeps the active one in view
- Touch screens: options are at least 40px tall; a tap picks on lift, so swiping to scroll never picks by accident
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: date-range-picker, filter-menu, data-table
