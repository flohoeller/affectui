# Rating, clean style (Free)

Stars or thumbs up and down for an AI answer – hover previews, a press sets it and a second press clears it, arrows in one tab stop, read-only with halves ("4.5 out of 5")

- Page: https://www.affectui.com/components/rating
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/rating-clean.json`
- Import: `@/components/ui/rating-clean`

### When to use

- Thumbs up or down under an AI answer – variant="thumbs"
- Rating a run, an agent, a template or a support reply from 1 to 5 stars (or any max)
- Showing an average next to a name or in a list – readOnly, with halves ("4.5 out of 5")

### When not to use

- Thumbs together with copy, retry and share under a chat message – use Message Actions, which has them and a feedback row
- A scale with named steps (Low, Medium, High) – use the Segmented Control or the Toggle Group
- Turning something on or off – use the Switch or the Checkbox

### Usage

```tsx
import { useState } from "react";
import { Rating } from "@/components/ui/rating-clean";

export function RateRun({ onRate }: { onRate: (stars: number | null) => void }) {
  const [stars, setStars] = useState<number | null>(null);

  return (
    <Rating
      aria-label="Rate this run"
      value={stars}
      onValueChange={(v) => {
        setStars(v);
        onRate(v);
      }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `"stars" \| "thumbs"` | `"stars"` | Stars from 1 to max, or thumbs up and down |
| value | `number \| null · "up" \| "down" \| null` |  | Stars: 1 to max, or null for none – read-only it may be a fraction, shown to the nearest half. Thumbs: "up", "down" or null |
| defaultValue | `same as value` | `null` | The starting value when value isn't controlled |
| onValueChange | `(value) => void` |  | Called with the new value, or null when it's cleared |
| max | `number` | `5` | Stars only – how many (1 to 50); more than fit wrap onto a new line |
| allowClear | `boolean` | `true` | Pressing the chosen one again, or Delete, clears it |
| readOnly | `boolean` | `false` | Only shows the value: no buttons, read out as one picture; stars show halves |
| disabled | `boolean` | `false` | Dims it and turns the buttons off |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Stars 14, 18 or 24px; thumbs 24, 28 or 32px buttons – the hit areas grow on touch screens |
| getValueLabel | `(value: number, max: number) => string` | `"3 out of 5"` | Stars only – how a star and a read-only value are read out; translate it here |
| labels | `{ up?: string; down?: string }` | `"Good response", "Bad response"` | Thumbs only – the buttons' names and tooltips |
| name | `string` |  | Sends the value with a form (a hidden input; empty when nothing is chosen) |
| ...div props | `ComponentProps<"div">` |  | aria-label, aria-labelledby, className, id, ref … go to the group. Without a name of your own it is "Rating" or "Rate this response" |

### Keyboard

- Tab: One tab stop: lands on the chosen star (or the first) or thumb
- → / ↑: One star more – in right-to-left pages ← is more
- ← / ↓: One star less (never below 1 – clear with Delete)
- Home / End: One star, or all of them
- Arrows: Thumbs: switches between up and down
- Space / Enter: Chooses the focused one; on the chosen one, clears it
- Delete: Clears it (Backspace too)

### Accessibility

- A radio group: each star is a radio named "3 out of 5" (getValueLabel), each thumb "Good response" or "Bad response" – the chosen one is announced as checked
- Read-only it is one role="img" named "4.5 out of 5" (or "No rating"), so a list of averages isn't a list of buttons
- The arrows move and choose at once, like native radios; one tab stop for the whole group
- Hovering previews only with a mouse – on touch a tap sets the value right away
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- Choosing stars pops them one after the other up to the new value; a chosen thumb fills and tips with a little bounce
- The hovered star grows a little, a pressed one shrinks
- With prefers-reduced-motion nothing moves – the stars fill at once

### Responsive

- Halves are drawn by clipping a filled star over an empty one, from the start side – mirrored in right-to-left pages
- Touch screens get a hit area of at least 32px per star and 36px per thumb
- Many stars wrap instead of running out of their row
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: message-actions, segmented-control, toggle-group, ai-answer
