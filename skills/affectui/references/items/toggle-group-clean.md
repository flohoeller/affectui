# Toggle Group, clean style (Free)

A row of toggle buttons – several on at once or one that can be cleared, labels or icons, a tray or separate chips, one tab stop with arrow keys

- Page: https://www.affectui.com/components/toggle-group
- Section: Components · Buttons
- Install: `npx shadcn@latest add https://www.affectui.com/r/toggle-group-clean.json`
- Import: `@/components/ui/toggle-group-clean`

### When to use

- Filters where several can be on at once: Running, Needs you, Failed – type="multiple"
- A formatting or view toolbar: bold, italic, code; visible columns; layers on a map
- One optional choice that can also be none, like Group by Agent, Model or Day – type="single", pressing it again clears it

### When not to use

- Exactly one of a few views must always be picked (List / Board) – use the Segmented Control
- A single on or off setting – use the Switch, or an Icon Button with pressed for one tool
- Many options or long labels – use the Filter Menu or the Select
- Choices saved later with a form – use Checkboxes

### Usage

```tsx
import { useState } from "react";
import { ToggleGroup } from "@/components/ui/toggle-group-clean";

export function RunFilters() {
  const [status, setStatus] = useState(["running", "needs-you"]);

  return (
    <ToggleGroup
      aria-label="Show runs"
      value={status}
      onChange={setStatus}
      items={[
        { value: "running", label: "Running" },
        { value: "needs-you", label: "Needs you" },
        { value: "done", label: "Done" },
        { value: "failed", label: "Failed" },
      ]}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `ToggleGroupItem[]` |  | { value, label?, icon?, ariaLabel?, disabled? } – give icon-only items an ariaLabel, it's also their tooltip |
| type | `"multiple" \| "single"` | `"multiple"` | multiple: any number can be on, the value is a list · single: at most one, pressing it again turns it off |
| value | `string[] \| string \| null` |  | Controlled value – a list with type="multiple", one value or null with type="single" |
| defaultValue | `string[] \| string \| null` |  | Starting value when uncontrolled – nothing on by default |
| onChange | `(value: string[]) => void \| (value: string \| null) => void` |  | Called with the new value; a list keeps the items' order, null when the single item was turned off |
| variant | `"buttons" \| "tray"` | `"buttons"` | Separate quiet chips with a hairline – the pressed ones filled light gray – that wrap onto a new line, or a compact light-gray track with pressed items raised in white |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 24, 28 or 32px tall (36px+ on touch screens); md is 13px text with 4px 10px padding |
| disabled | `boolean` | `false` | Disables every item |
| aria-label | `string` |  | Names the group – or use aria-labelledby |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Focuses the group once – the item last used, or the first one that's on
- ← / →: Moves between the items, wrapping around (↑ ↓ too); turned around in right-to-left pages
- Home / End: Moves to the first or last item
- Space / Enter: Turns the focused item on or off

### Accessibility

- A role="group" of real buttons with aria-pressed – screen readers say pressed or not pressed for each
- Arrow keys only move the focus; nothing changes until Space or Enter, so moving through a filter row is safe
- One tab stop for the whole group (roving tabindex); disabled items are skipped
- Icon-only items need ariaLabel – it names them and shows as the tooltip
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- A pressed item's fill grows in from its middle and fades; it dips slightly while held down
- With prefers-reduced-motion it changes instantly and doesn't dip

### Responsive

- buttons wrap onto a new line when they don't fit; the tray scrolls sideways instead
- Long labels end in … rather than pushing past the container
- Touch screens get items at least 36px tall
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: segmented-control, icon-button, filter-menu, switch, checkbox
