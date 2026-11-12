# Blur Crossfade (Pro)

Swaps content with a soft blur while the box glides smoothly to the size of what comes next

- Page: https://www.affectui.com/motion/blur-crossfade
- Section: Motion · Transitions
- Install: `npx shadcn@latest add https://www.affectui.com/r/blur-crossfade.json` (needs the Pro access key)
- Import: `@/components/ui/blur-crossfade`

### When to use

- Button labels and status text that change in place – Save → Saving… → Saved
- Panels, tips or steps that swap content of different lengths without a jump in the layout

### When not to use

- Navigating between pages or large views – use a route transition instead
- Content that updates many times per second, like counters or live prices

### Usage

```tsx
import { BlurCrossfade } from "@/components/ui/blur-crossfade";

export function SaveButton({ status }) {
  return (
    <button>
      <BlurCrossfade id={status} morph="both" as="span">
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save"}
      </BlurCrossfade>
    </button>
  );
}

// Height glides between messages of different length
<BlurCrossfade id={step}>
  <p>{steps[step]}</p>
</BlurCrossfade>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | `string \| number` |  | Key of the current content – changing it starts the swap |
| children | `ReactNode` |  | Content for the current id |
| duration | `number` | `420` | Length of the swap and the size morph in ms |
| blur | `number` | `10` | Blur in px at the outer ends of the fade |
| morph | `"height" \| "both" \| "none"` | `"height"` | Which sides glide to the new size; both makes the box as wide as its content |
| as | `"div" \| "span"` | `"div"` | Root element – span inside buttons and other inline content |
| className | `string` |  | Extra class on the box |

### Accessibility

- Only the current content is exposed – the leaving copy is aria-hidden and inert
- Put aria-live on a surrounding element when the change should be announced, e.g. a status button

### Motion

- The old content blurs, fades and grows slightly as the new one sharpens in from 98 %, while the box glides to the new height (and width)
- Quick changes stay clean: only the latest leaving copy and the current content are ever on screen
- Reduced motion swaps instantly

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"
- Content keeps its natural size; the box only clips during the swap, so shadows and focus rings show otherwise

### Requirements

- React 19

Related: text-reveal, gradient-text
