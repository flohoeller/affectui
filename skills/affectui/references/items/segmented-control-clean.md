# Segmented Control, clean style (Free)

Switch between two to six options – a raised pill or underline that glides, stretches a little and can be dragged across, with icons, counts and badges

- Page: https://www.affectui.com/components/segmented-control
- Section: Components · Navigation
- Install: `npx shadcn@latest add https://www.affectui.com/r/segmented-control-clean.json`
- Import: `@/components/ui/segmented-control-clean`

### When to use

- Switching between two to six views of the same content – sections of a dashboard, list / board / calendar, monthly / yearly
- A choice that applies right away and where every option should stay visible

### When not to use

- More than six options or long labels – use a select or a menu
- Choices that are confirmed with a Save button inside a form – radio buttons read clearer there
- Turning one thing on or off – that's a switch

### Usage

```tsx
import { SegmentedControl } from "@/components/ui/segmented-control-clean";

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
| onChange | `(value: string) => void` |  | Called with the new value – on click, while dragging the indicator and on arrow keys |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 24, 28 or 32px tall (40px+ on touch screens); md is 13px text with 4px 10px padding |
| variant | `"buttons" \| "tray" \| "underline"` | `"buttons"` | Separate chips with a hairline whose light-gray fill slides to the active one, a compact light-gray track with a white raised pill, or text tabs on a hairline with a sliding line |
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
- Labels are read once; counts and badges are part of the name
- Visible focus ring on the focused option

### Motion

- The indicator slides to the picked option in about 200ms; the edge facing the target leads a touch – short and crisp, no bounce
- Labels keep one weight and only change color, so neighbours never shift; hover washes fade in and out in 90ms
- When a label or count changes, the option and the whole control morph to the new width and the indicator follows; a new count blurs in
- Pressing gives the indicator a little (scale 0.97); dragging it across the options selects as you go
- With prefers-reduced-motion everything switches instantly

### Responsive

- If it doesn't fit, it scrolls sideways with soft edges on the sides that hide options and keeps the active one in view
- Touch screens: options are at least 40px tall; a tap picks on lift, so swiping to scroll never picks by accident
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: date-range-picker, filter-menu, data-table
