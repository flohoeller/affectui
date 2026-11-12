# Gradient Floor (Pro)

A blurred colour gradient that glows up from the bottom edge – two layers that drift and morph

- Page: https://www.affectui.com/motion/gradient-floor
- Section: Motion · Backgrounds
- Install: `npx shadcn@latest add https://www.affectui.com/r/gradient-floor.json` (needs the Pro access key)
- Import: `@/components/ui/gradient-floor`

### When to use

- Hero sections, AI features or call-to-action blocks that need a warm, living backdrop
- Behind a chat input or a prompt, to make it feel like the start of something

### When not to use

- Behind long body text – the bright floor competes with small type
- Several floors on one screen – each one runs its own animation

### Usage

```tsx
import { GradientFloor } from "@/components/ui/gradient-floor";

export function Hero() {
  return (
    // Give the floor a height, e.g. with a class
    <GradientFloor className="hero">
      <h1>Ideas start to glow</h1>
    </GradientFloor>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | `ReactNode` |  | Content rendered above the floor |
| colors | `[string, string, string]` | `["#FF7700", "#FF0055", "#0073FF"]` | Gradient from the crest down |
| speed | `number` | `3` | Seconds per morph loop; 0 keeps the shape still |
| className | `string` |  | Extra class on the root, e.g. for height or rounded corners |

### Accessibility

- The floor layers are hidden from screen readers; only your children are announced
- Keep text above the bright part of the floor at a readable contrast

### Motion

- Two blurred layers – colour and a white plus-lighter layer – whose peaks and valleys rise and fall against each other
- Both layers drift sideways on the same beat, the light one a little less
- Runs only while on screen; with prefers-reduced-motion the floor stays still

### Responsive

- Scales with the width of its container and stays anchored to the bottom edge – give the root a height
- Set the background with --ui-gf-bg (default #fafafa, dark mode #111113)

### Requirements

- React 19

Related: glow-keyboard, grid-background
