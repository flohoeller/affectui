# Button, clean style (Free)

Primary, secondary, ghost and destructive buttons with icons, sizes and a shimmering loading state

- Page: https://www.affectui.com/components/button
- Section: Components · Buttons
- Install: `npx shadcn@latest add https://www.affectui.com/r/button-clean.json`
- Import: `@/components/ui/button-clean`

### When to use

- Any action a user triggers: submit a form, send a message, open a dialog
- Async actions that take a moment – the loading state keeps the label readable while it works

### When not to use

- Navigation to another page – use a link so it can be opened in a new tab
- Switching between views – a segmented control or tabs show the current state

### Usage

```tsx
import { Button } from "@/components/ui/button-clean";

export function Actions() {
  return (
    <>
      <Button variant="ghost">Cancel</Button>
      <Button>Save changes</Button>
    </>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `"primary" \| "secondary" \| "ghost" \| "destructive"` | `"primary"` | A dark chip, white with a hairline shadow, text only, or a light red fill for deleting |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 24, 28 or 32px high – 32, 34 or 36px on touch screens |
| loading | `boolean` | `false` | Swaps the left icon for a spinner, shimmers the label, sets aria-busy and ignores clicks |
| icon | `ReactNode` |  | Icon before the label; without children the button becomes square |
| iconRight | `ReactNode` |  | Icon after the label |
| ...props | `button attributes` |  | Everything a native button takes, including ref, type and disabled |

### Keyboard

- Enter / Space: Activate the button

### Accessibility

- A native button element, so focus, keyboard and form submission work as expected
- While loading it stays focusable and announces aria-busy instead of becoming disabled
- Icon-only buttons need an aria-label – the icon itself is hidden from screen readers

### Motion

- Pressing scales the button to 97%
- Loading swaps the left icon for a spinner and sweeps a band across the label
- When label or icon change, the width glides to the new size and the new content fades in from a soft blur
- With prefers-reduced-motion the sweep stops and changes are instant

### Responsive

- On touch screens (pointer: coarse) every size grows to a comfortable tap height; the look stays the same
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: chat-composer
