# Icon Button (Free)

A square button that is only an icon – ghost, outlined or solid, two sizes, a pressed state for toggles and its label as the tooltip

- Page: https://www.affectui.com/components/icon-button
- Section: Components · Buttons
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/icon-button.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/icon-button-clean.json` – lands as `icon-button-clean.tsx`, import from `@/components/ui/icon-button-clean` – its docs: `icon-button-clean.md`
- Import: `@/components/ui/icon-button`

### When to use

- Toolbar tools whose icon says it all: search, filter, sort, more
- Actions under a message or on a row: copy, like, regenerate – as quiet ghost buttons
- A tool that stays on, like pinned only or a side panel – pressed makes it a toggle

### When not to use

- When the icon alone isn't clear, or for the main action of a page – use the Button with a label
- Choosing one of a few views (grid or list) – use the Segmented Control
- On or off settings that are saved – use the Switch

### Usage

```tsx
import { useState } from "react";
import { FilterHorizontalIcon, PinIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { IconButton } from "@/components/ui/icon-button";

export function RunsToolbar({ onNew }: { onNew: () => void }) {
  const [pinned, setPinned] = useState(false);

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <IconButton variant="secondary" icon={FilterHorizontalIcon} label="Filter" />
      <IconButton
        variant="secondary"
        icon={PinIcon}
        label="Pinned runs only"
        pressed={pinned}
        onClick={() => setPinned((p) => !p)}
      />
      <IconButton variant="primary" icon={PlusSignIcon} label="New run" onClick={onNew} />
    </div>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| icon | `ReactNode \| HugeIcon` |  | The glyph – an inline SVG or image, or a Hugeicons icon object, which is drawn inline at a 1.75 stroke. It takes the button's color |
| label | `string` |  | Required. What it does – the accessible name (aria-label) and the tooltip |
| variant | `"ghost" \| "secondary" \| "primary"` | `"ghost"` | ghost: just the icon, a soft wash on hover · secondary: white with a 1px edge, for toolbars · primary: the dark gradient of the primary Button |
| size | `"sm" \| "md"` | `"md"` | 32 × 32 with a 16px icon, or 40 × 40 with an 18px icon – the heights of the Button |
| pressed | `boolean` |  | Makes it a toggle: sets aria-pressed and keeps the gray layer while true. Leave it out for a plain button |
| title | `string` | `label` | The tooltip; pass "" to leave it out, e.g. when a custom tooltip wraps the button |
| ...button props | `ComponentProps<"button">` |  | onClick, disabled, type, aria-expanded, ref and the rest go to the real <button> |

### Keyboard

- Enter / Space: Clicks it – or flips it when it's a toggle
- Tab: Moves to the next control

### Accessibility

- A real <button>; the label is its aria-label, so screen readers never hear just "button"
- With pressed it's announced as a toggle button, pressed or not pressed
- The icon is hidden from screen readers
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- Colors and shadow fade on hover; it dips slightly while pressed down
- With prefers-reduced-motion it changes instantly and doesn't dip

### Responsive

- Touch screens keep the look and get an invisible ring around it that takes the tap – the small size grows to 42 × 42
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- Optional: @hugeicons/core-free-icons – its icon objects can be passed straight to icon

Related: button, segmented-control, message-actions, reaction-bar
