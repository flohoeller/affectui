# Agent Gallery, clean style (Pro)

Slim gradient panels with one open product screen in the middle – pick a panel and it glides open

- Page: https://www.affectui.com/blocks/agent-gallery
- Section: Blocks · Feature sections
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-gallery-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-gallery-clean`

### When to use

- Showing several agents, workflows or product areas on a landing page, one at a time with a real-looking screen
- Feature sections that should feel explorable rather than a static grid

### When not to use

- Two or three items – a simple tab switch reads faster
- Content people need to compare side by side

### Usage

```tsx
import { AgentGallery } from "@/components/ui/agent-gallery-clean";

export function AgentsSection() {
  return <AgentGallery title="Agents that run your playbook" />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | Heading above the panels |
| subtitle | `string` |  | Line under the heading |
| items | `GalleryItem[]` |  | Each { id, name, description, colors: [strong, soft], trigger, steps, skills, guardrail } – drives the panel colors, the label and the screen |
| defaultIndex | `number` | `the middle item` | Panel that starts open |
| className | `string` |  | Extra class on the root |

### Keyboard

- ← / →: With focus in the panels, opens the previous or next one
- Tab: Moves through the side panels and the arrow buttons – each shows an accent focus ring

### Accessibility

- Marked as a carousel; side panels are buttons labelled “Show …”
- The caption under the open panel is announced when it changes

### Motion

- The picked panel widens into the middle while the open one folds into a slim panel – one smooth width transition
- Side panels show the artwork muted and come to full color on hover; the white screen slides in after the panel has opened
- With prefers-reduced-motion panels switch instantly

### Responsive

- Follows its own width: below 760px the open panel fills the width with one slim panel peeking on each side
- Every panel shares one soft gradient artwork drawn in CSS – only two colors per item change, so it scales crisply; the screen on top is a single white card with hairline shadows, gray text and a segmented tab switch
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
