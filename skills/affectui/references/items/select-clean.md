# Select, clean style (Free)

Pick one option in the Text Field's look – icons and a second line per option, a gliding highlight, type-ahead and a list that never gets cut off

- Page: https://www.affectui.com/components/select
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/select-clean.json`
- Import: `@/components/ui/select-clean`

### When to use

- Picking one option from a short or medium list in a form: a role, a model, a time zone, a plan
- Settings rows next to Text Fields – same height, edge and focus, so the form reads as one

### When not to use

- Two to four options that should all be visible – use the Segmented Control
- Long lists people search in, or several picks – use the Combobox
- Actions rather than a value (Rename, Delete…) – use a menu

### Usage

```tsx
import { useState } from "react";
import { Select, type SelectOption } from "@/components/ui/select-clean";

const models: SelectOption[] = [
  { value: "auto", label: "Auto", description: "Picks the model for each message" },
  { value: "opus", label: "Claude Opus 5.5", description: "Best for hard, long questions" },
  { value: "custom", label: "Your own model", description: "Add an endpoint first", disabled: true },
];

export function ModelSetting() {
  const [model, setModel] = useState<string | null>("auto");
  return <Select label="Default model" options={models} value={model} onChange={setModel} name="model" />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| options | `SelectOption[]` |  | { value, label, description?, icon?, disabled? } – an icon and a quiet second line are optional per option |
| value | `string \| null` |  | The chosen value – makes it controlled; null shows the placeholder |
| defaultValue | `string \| null` | `null` | Starting value when uncontrolled |
| onChange | `(value: string, option: SelectOption) => void` |  | Called when another option is picked |
| placeholder | `string` | `"Choose…"` | Shown in gray while nothing is chosen |
| label | `ReactNode` |  | Shown above the field and used as the list's name |
| hint | `ReactNode` |  | A quiet line under the field – the error takes its place while there is one |
| error | `ReactNode` |  | Marks the field invalid (red edge, aria-invalid) and shows the message where the hint was |
| optional | `boolean` | `false` | Adds "Optional" next to the label |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 28 · 32 · 36px high, like the Text Field; taller on touch screens |
| disabled | `boolean` | `false` | Dims the field and ignores input |
| name | `string` |  | Sends the value with a form, through a hidden input |
| required | `boolean` |  | Sets aria-required – check it on submit like any other field |
| aria-label | `string` |  | Accessible name when there is no visible label |
| className | `string` |  | Extra class on the wrapper, e.g. a fixed width in a settings row |
| ref | `Ref<HTMLButtonElement>` |  | The field's button – focus it after a validation error |

### Keyboard

- ↓ / ↑: Open the list; inside it, move between options (disabled ones are skipped)
- Enter / Space: Open the list, or pick the highlighted option
- Home / End: First or last option
- A–Z: Jump to the option that starts with what you type – also while the list is closed
- Esc: Close the list without changing anything
- Tab: Close the list and move on

### Accessibility

- The select-only combobox pattern: a button with role="combobox" that controls a listbox; focus stays on the button while aria-activedescendant follows the highlight
- Options are role="option" with aria-selected; disabled ones carry aria-disabled and are skipped by the keys
- The label names both the field and the list; hint and error are linked with aria-describedby, an error sets aria-invalid
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- The list fades in out of a small lift from the field's edge – downward, or upward when it opens above
- One soft highlight glides between the rows as the pointer or the arrow keys move; the chevron turns half a circle
- The check on the chosen option draws itself
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container; a long choice ends in … with the full text on hover
- The list opens where there is room – under the field, or above it near the bottom of the screen – and stays inside the window
- It lives in the top layer (popover), so a card's overflow or z-index never cuts it
- Touch screens get taller rows and 16px text; dark mode built in via .dark or data-theme="dark" on an ancestor

### Requirements

- React 19

Related: text-field, combobox, segmented-control, filter-menu
