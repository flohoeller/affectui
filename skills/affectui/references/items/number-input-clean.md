# Number Input, clean style (Free)

A field for one number – − and + that repeat while held, arrow keys and Page Up / Down, min, max and step, a unit like tokens or %, formatted for the locale

- Page: https://www.affectui.com/components/number-input
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/number-input-clean.json`
- Import: `@/components/ui/number-input-clean`

### When to use

- Counts and limits people tune in small steps: tokens per run, parallel agents, retries, seats, a budget, a temperature
- Settings forms where the value has bounds – it never lets a number past min or max get saved

### When not to use

- Numbers nobody counts up or down – phone numbers, card numbers, IDs, ZIP codes: use the Text Field
- Picking roughly from a wide range where the exact value matters less – a slider says that better
- A handful of fixed choices (1, 2, 4, 8) – use the Segmented Control or the Select

### Usage

```tsx
import { useState } from "react";
import { NumberInput } from "@/components/ui/number-input-clean";

export function RunLimits() {
  const [tokens, setTokens] = useState<number | null>(32000);

  return (
    <form className="grid gap-4">
      <NumberInput
        label="Max tokens per run"
        unit="tokens"
        value={tokens}
        onValueChange={setTokens}
        min={1000}
        max={200000}
        step={1000}
        hint="The answer stops here."
      />
      <NumberInput
        label="Budget per run"
        name="budget"
        prefix="$"
        defaultValue={25}
        min={0}
        max={100}
        step={5}
        formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
      />
    </form>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `number \| null` |  | The number; null is an empty field. Use it with onValueChange to control the field |
| defaultValue | `number \| null` | `null` | The starting number when the field keeps its own value |
| onValueChange | `(value: number \| null) => void` |  | Called after every step, and when typing is done (blur or Enter) – with the clamped number, or null when emptied |
| min | `number` |  | The lowest value: typing less is raised to it, − and Home stop there |
| max | `number` |  | The highest value: typing more is lowered to it, + and End stop there |
| step | `number` | `1` | What − / + and the arrow keys add or take away; steps land on multiples of it (counted from min) |
| largeStep | `number` | `step × 10` | What Page Up / Page Down add or take away |
| unit | `ReactNode` |  | Quiet text right after the value – "tokens", "%", "ms"; read out with the value |
| prefix | `ReactNode` |  | Quiet text or a 16px icon before the value – e.g. "$" |
| locale | `string` | `the browser's` | Shows and reads the number in this locale – 4,000 in en-US, 4.000 in de-DE; typing follows the same separators |
| formatOptions | `Intl.NumberFormatOptions` |  | How the value is shown once you leave the field, e.g. { maximumFractionDigits: 2 } or { style: "percent" } (then 0.25 shows 25%) |
| label | `ReactNode` |  | Shown above the field; clicking it focuses the input |
| hint | `ReactNode` |  | A quiet line under the field – the error takes its place while there is one |
| error | `ReactNode` |  | Marks the field invalid (red edge, aria-invalid) and shows the message where the hint was |
| optional | `boolean` | `false` | Adds "Optional" next to the label |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 28 · 32 · 36px high; taller on touch screens |
| name | `string` |  | Sends the plain number (4000, not "4,000") with the form, through a hidden input |
| inputClassName | `string` |  | Extra class on the input itself |
| ...input props | `ComponentProps<"input">` |  | placeholder, disabled, readOnly, required, onBlur, onKeyDown, aria-label, ref and the rest go to the input |

### Keyboard

- ↑ / ↓: One step up or down
- Page Up / Page Down: A large step (10 steps by default)
- Home / End: Jumps to min or max, when they're set
- Enter: Takes what's typed – clamped and formatted – and submits the form as usual
- Esc: Drops what's typed and goes back to the last value
- Tab: Moves into the field – one stop per field; − and + are for the pointer, the arrow keys step

### Accessibility

- The input has role="spinbutton" with aria-valuenow, aria-valuemin, aria-valuemax and a readable aria-valuetext ("$25.00", "32,000 tokens")
- − and + are labelled buttons tied to the input with aria-controls; at a limit they stay focusable and say so with aria-disabled, so focus never drops
- The hint and the error are linked with aria-describedby; an error sets aria-invalid and is announced politely
- Holding − or + keeps stepping, first after a pause, then faster; it stops at the limit
- Phones get a number pad – with a decimal key when the value has decimals, the full keyboard when it can go below zero
- Focus firms up the field's edge – no ring around the field; the buttons get a clear outline under keyboard focus

### Motion

- Each step rolls the new value in from the direction it moved – up for +, down for −
- The hint swaps for an error out of a short blur, without moving anything below
- With prefers-reduced-motion the value just changes

### Responsive

- Fills its container; the value hugs its text so the unit sits right after it, and − / + keep their place at the end
- Very long numbers fit to the field and are cut with an ellipsis before the buttons move
- Touch screens get taller fields, 32px buttons with a larger hit area and 16px text, so iOS doesn't zoom in
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: text-field, form-field, segmented-control, select
