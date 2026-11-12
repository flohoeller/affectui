# Inspect Agent Card (Pro)

An agent card seen like a selection in a design tool – tilted back, with a blue frame, spacing numbers and a red guide walking through its rows

- Page: https://www.affectui.com/illustrations/inspect-agent-card
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/inspect-agent-card.json` (needs the Pro access key)
- Import: `@/components/ui/inspect-agent-card`

### When to use

- Hero or feature section of a UI kit, design tool or developer product – it shows that the interface is built with care, down to the pixel
- Beside a headline, one on each side: use mirror for the left one and give them different delays, so they take turns
- Launch posts and OG images – a still frame with playing={false} reads well small

### When not to use

- As the real interface – it's a picture of one; nothing in it can be clicked
- In tight spaces – it needs about 400 × 330px, and its fades want room around it

### Usage

```tsx
import { InspectAgentCard } from "@/components/ui/inspect-agent-card";

export function Hero() {
  return (
    <section className="relative">
      <h1>UI for AI agents</h1>
      <InspectAgentCard className="absolute right-0 top-24" />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agent | `InspectAgent` |  | The card: name, model, avatar, tools, task, status ("running" | "done"), cost and time |
| above | `InspectAgent \| null` |  | The card faded out above it – null leaves it out |
| playing | `boolean` | `true` | Walks the selection through the rows – false holds it on the header |
| hold | `number` | `1600` | How long the selection stays on a row, in ms |
| delay | `number` | `600` | Wait before the first selection, in ms – e.g. until the section around it has come in |
| mirror | `boolean` | `false` | Tilted the other way and fading out to the left, the edge marks on the right – for the left side of a layout |
| flat | `boolean` | `false` | No tilt |
| className | `string` |  | Extra class on the root |

### Accessibility

- Decorative: the whole illustration is hidden from screen readers and takes no clicks
- With prefers-reduced-motion nothing moves: the selection stands still on the header

### Motion

- The selection walks through the header, task and meta, one row after another
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

Related: agent-tree, inspect-composer, agent-team
