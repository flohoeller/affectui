# Tilt Card (Pro)

A card that tilts in 3D towards the pointer, with a soft glare that follows it and a smooth spring back

- Page: https://www.affectui.com/motion/tilt-card
- Section: Motion · Hover
- Install: `npx shadcn@latest add https://www.affectui.com/r/tilt-card.json` (needs the Pro access key)
- Import: `@/components/ui/tilt-card`

### When to use

- Showcase cards: membership or pricing cards, product shots, featured items
- A single hero object that should feel tangible on hover

### When not to use

- Grids of many cards – the motion becomes noise when every card tilts
- Cards full of controls or text to read – the moving surface makes them harder to use

### Usage

```tsx
import { TiltCard } from "@/components/ui/tilt-card";

export function MembershipCard() {
  return (
    <TiltCard maxTilt={10} scale={1.02}>
      <div className="membership">
        <span>affectUI Pro</span>
        <span>•••• 4821</span>
      </div>
    </TiltCard>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | `ReactNode` |  | The card's content – it fills the tilting surface |
| maxTilt | `number` | `10` | Maximum tilt in degrees |
| glare | `boolean` | `true` | Show a soft glare that follows the pointer |
| scale | `number` | `1.02` | Scale while the pointer is over the card |
| perspective | `number` | `900` | Perspective distance in px – smaller is more dramatic |
| className | `string` |  | Extra class on the wrapper; set --ui-tc-radius to match your card's corners |

### Accessibility

- Purely visual: the tilt adds no roles or tab stops, and the glare is aria-hidden
- Keyboard focus on anything inside the card lifts it slightly, so focus is visible in the motion too

### Motion

- Pointer moves are batched with requestAnimationFrame and written to CSS variables; only transform and opacity animate
- On leave the card springs back to rest with a soft overshoot
- Touch pointers don't tilt
- Reduced motion: no tilt or glare, only the shadow changes

### Responsive

- Sizes to its content; the demo card shrinks to the available width
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
