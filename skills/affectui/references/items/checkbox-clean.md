# Checkbox, clean style (Free)

A real checkbox with a label and a second line, a some-of-them state for Select all, an error and a card row – the check draws itself

- Page: https://www.affectui.com/components/checkbox
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/checkbox-clean.json`
- Import: `@/components/ui/checkbox-clean`

### When to use

- Yes or no choices that are saved with a form: agreeing to terms, picking several items of a list, opting in
- Select all over a list – the some-of-them state shows a dash while only part of it is picked

### When not to use

- A setting that applies the moment you flip it – use the Switch
- One choice out of several – use radio buttons, the Segmented Control or the Select

### Usage

```tsx
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox-clean";

export function Topics() {
  const all = ["mentions", "approvals", "summary"];
  const [picked, setPicked] = useState<string[]>([]);

  return (
    <fieldset>
      <legend>Email me about</legend>
      <Checkbox
        label="Everything"
        checked={picked.length === all.length}
        indeterminate={picked.length > 0 && picked.length < all.length}
        onChange={() => setPicked(picked.length === all.length ? [] : all)}
      />
      {all.map((id) => (
        <Checkbox
          key={id}
          label={id}
          checked={picked.includes(id)}
          onChange={(e) => setPicked((p) => (e.target.checked ? [...p, id] : p.filter((x) => x !== id)))}
        />
      ))}
    </fieldset>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `ReactNode` |  | Shown next to the box; clicking it toggles |
| description | `ReactNode` |  | A quiet second line under the label, linked with aria-describedby |
| indeterminate | `boolean` | `false` | Some of them – a dash instead of the check; set it on a Select all whose list is partly picked |
| error | `ReactNode` |  | Marks it invalid (red edge, aria-invalid) and shows the message under it |
| variant | `"plain" \| "card"` | `"plain"` | card: a bordered row that is clickable as a whole; checked, its edge turns dark |
| ...input props | `ComponentProps<"input">` |  | checked, defaultChecked, onChange, name, value, required, disabled, ref – everything goes to the real checkbox |

### Keyboard

- Space: Toggles it
- Tab: Moves to the next checkbox – each one is its own stop, as with native checkboxes

### Accessibility

- A real <input type="checkbox"> inside its <label>: forms, screen readers and the some-of-them state (mixed) work as with any checkbox
- The description and the error are linked with aria-describedby; an error sets aria-invalid and is announced politely
- Group related ones in a <fieldset> with a <legend>, so the question is read with each choice
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- The box fills and the check draws itself; the dash grows from the middle
- A press nudges the box a little smaller
- With prefers-reduced-motion everything switches instantly

### Responsive

- Long labels wrap; the box stays on the first line
- Touch screens get a 20px box, 15px text and a hit area larger than the box
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: switch, select, text-field, segmented-control
