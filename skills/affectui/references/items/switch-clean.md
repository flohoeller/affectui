# Switch, clean style (Free)

On or off for things that apply right away – label and second line, at the start or across a settings row, a thumb that stretches as you press it

- Page: https://www.affectui.com/components/switch
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/switch-clean.json`
- Import: `@/components/ui/switch-clean`

### When to use

- Settings that apply the moment you flip them: notifications, features, a mode
- Settings rows with the label on the left and the switch on the right – placement="end"

### When not to use

- Choices that are saved later with a form, or agreeing to something – use the Checkbox
- More than two states – use the Segmented Control or the Select

### Usage

```tsx
import { useState } from "react";
import { Switch } from "@/components/ui/switch-clean";

export function DigestSetting({ onSave }: { onSave: (on: boolean) => void }) {
  const [on, setOn] = useState(true);

  return (
    <Switch
      placement="end"
      label="Daily digest"
      description="Approvals waiting, runs that finished or failed"
      checked={on}
      onChange={(e) => {
        setOn(e.target.checked);
        onSave(e.target.checked);
      }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `ReactNode` |  | Shown next to the switch; clicking it toggles |
| description | `ReactNode` |  | A quiet second line under the label, linked with aria-describedby |
| placement | `"start" \| "end"` | `"start"` | start: the switch before the text · end: the text first and the switch on the far right of the row |
| size | `"sm" \| "md"` | `"md"` | 26 × 16 or 32 × 20; bigger on touch screens |
| ...input props | `ComponentProps<"input">` |  | checked, defaultChecked, onChange, name, disabled, aria-label, ref – everything goes to the real input |

### Keyboard

- Space: Turns it on or off
- Tab: Moves to the next control

### Accessibility

- A real checkbox with role="switch": screen readers say on and off, and forms send it like a checkbox
- The label is tied to it, so clicking the text toggles too; the description is linked with aria-describedby
- Without a visible label, pass aria-label
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- The thumb slides across; while it's pressed it stretches toward where it's going
- The track fades between its off and on colors
- With prefers-reduced-motion everything switches instantly

### Responsive

- Long labels wrap; the switch stays on the first line
- Touch screens get a 40 × 24 switch, 15px text and a hit area larger than the track
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: checkbox, segmented-control, select, button
