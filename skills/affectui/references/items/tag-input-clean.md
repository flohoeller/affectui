# Tag Input, clean style (Free)

Several values in one field as chips – paste a whole list, a check per value, duplicates flash, Backspace and arrow keys to edit

- Page: https://www.affectui.com/components/tag-input
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/tag-input-clean.json`
- Import: `@/components/ui/tag-input-clean`

### When to use

- Several short values in one field: email addresses to invite, labels, keywords, domains, stop words
- Lists people paste from elsewhere – commas, spaces or new lines turn into chips at once

### When not to use

- Picking from a fixed list – use the Combobox, which suggests as you type
- A single value – use the Text Field

### Usage

```tsx
import { useState } from "react";
import { TagInput } from "@/components/ui/tag-input-clean";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function InviteField() {
  const [emails, setEmails] = useState<string[]>([]);

  return (
    <TagInput
      label="Invite people"
      value={emails}
      onChange={setEmails}
      placeholder="name@company.com"
      avatar
      splitOnSpace
      max={10}
      normalize={(t) => t.trim().toLowerCase()}
      validate={(t) => (EMAIL.test(t) ? true : `“${t}” doesn't look like an email address.`)}
      name="emails"
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `string[]` |  | The chips – makes it controlled |
| defaultValue | `string[]` | `[]` | Starting chips when uncontrolled |
| onChange | `(tags: string[]) => void` |  | Called when a chip is added or removed |
| validate | `(tag: string) => true \| string` |  | Checks a value before it becomes a chip; a message keeps it in the field and shows under it |
| normalize | `(tag: string) => string` | `trim` | Cleans a value first, e.g. lowercases an email |
| splitOnSpace | `boolean` | `false` | Also split on spaces – right for emails and single words, wrong for labels with spaces |
| max | `number` |  | At most this many chips; shows "3/10" under the field |
| avatar | `boolean` | `false` | A small circle with the first letter on every chip, for people |
| label | `ReactNode` |  | Shown above the field and tied to its input |
| hint | `ReactNode` |  | A quiet line under the field – a message takes its place while there is one |
| error | `ReactNode` |  | Marks the field invalid from outside and shows the message |
| optional | `boolean` | `false` | Adds "Optional" next to the label |
| placeholder | `string` | `"Add…"` | Shown while there are no chips; "Add more…" after the first |
| name | `string` |  | Sends the chips with a form, one hidden input per chip |
| disabled | `boolean` | `false` | Dims the field and ignores input |

### Keyboard

- Enter / ,: Turns what you typed into a chip (Tab does too, then moves on)
- Space: Also adds, with splitOnSpace
- ⌫: On an empty field: the first press marks the last chip, the second removes it
- ← / →: Walk the chips; Backspace or Delete removes the one in focus
- Esc: Empties what you were typing

### Accessibility

- A real text input with a label; the chips sit before it, each with a labelled Remove button
- Added and removed values are announced in a polite live region; a message sets aria-invalid on the input
- Chips are reachable with ← from the start of the field, so Tab still moves straight on to the next control

### Motion

- New chips pop in out of a short blur; a duplicate makes the chip it repeats flash instead of adding it twice
- No focus ring on the field – its edge firms up; a chip in keyboard focus gets the ring
- With prefers-reduced-motion everything switches instantly

### Responsive

- Chips wrap onto new lines; after about five lines the field scrolls inside
- Long values end in … with the full text on hover
- Touch screens get taller chips, a bigger × and 16px text; dark mode built in via .dark or data-theme="dark"

### Requirements

- React 19

Related: text-field, combobox, select, button
