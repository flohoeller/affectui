# Inspect Composer (Pro)

A chat composer seen like a selection in a design tool – tilted back, with a blue frame, spacing numbers and a red guide walking through its rows

- Page: https://www.affectui.com/illustrations/inspect-composer
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/inspect-composer.json` (needs the Pro access key)
- Import: `@/components/ui/inspect-composer`

### When to use

- Hero or feature section of a UI kit, design tool or developer product – it shows that the interface is built with care, down to the pixel
- Beside a headline, one on each side: this one on the left, Inspect Agent Card on the right, with different delays so they take turns
- Launch posts and OG images – a still frame with playing={false} reads well small

### When not to use

- As the real interface – it's a picture of one; nothing in it can be clicked
- In tight spaces – it needs about 400 × 330px, and its fades want room around it

### Usage

```tsx
import { InspectComposer } from "@/components/ui/inspect-composer";

export function Hero() {
  return (
    <section className="relative">
      <h1>UI for AI agents</h1>
      <InspectComposer className="absolute left-0 top-24" />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| message | `string` | `"Ask the agents to ship the new pricing page"` | The message in the composer |
| above | `string \| null` | `"Summarize the pricing research for the team"` | The message in the composer faded out above it – null leaves it out |
| mode | `string` | `"Auto"` | The mode on the approval button |
| playing | `boolean` | `true` | Walks the selection through the rows – false holds it on the message |
| hold | `number` | `1600` | How long the selection stays on a row, in ms |
| delay | `number` | `600` | Wait before the first selection, in ms – e.g. until the section around it has come in |
| mirror | `boolean` | `true` | Tilted towards the left and fading out to the left, the edge marks on the right – as on the left of a layout; false turns it the other way |
| flat | `boolean` | `false` | No tilt |
| className | `string` |  | Extra class on the root |

### Accessibility

- Decorative: the whole illustration is hidden from screen readers and takes no clicks
- With prefers-reduced-motion nothing moves: the selection stands still on the message

### Motion

- The selection walks through the message, toolbar and the footer of the composer above, one row after another
- On each row it comes in piece by piece in about half a second: the cursor, the blue frame, its handles, the tag, the blue numbers, then the red guide and number and the width
- It stays for hold ms and leaves all at once in under 0.2s

### Responsive

- Fixed size, about 400 × 330px with its fades – scale it with zoom or a transform for smaller screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The frame, numbers and guide are measured on the real rows (elements with data-row), so changing the texts keeps them in line
- Two on a page: give one a delay of half a step (about 1250ms) so they don't select at the same time

### Requirements

- React 19

Related: chat-composer, inspect-agent-card, agent-team
