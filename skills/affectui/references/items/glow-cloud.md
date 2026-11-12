# Glow Cloud (Free)

A glowing cloud with eyes in red-orange or blue – it floats, turns to look around, blinks, follows the pointer and bounces with a wink when clicked

- Page: https://www.affectui.com/illustrations/glow-cloud
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/glow-cloud.json`
- Import: `@/components/ui/glow-cloud`

### When to use

- A friendly face for an assistant, an AI feature or a cloud product – as an app icon, an empty state or a feature card
- Landing pages that want a calm, living mascot instead of a static logo

### When not to use

- Tiny sizes below ~48px – the glow and the eyes get lost
- Brands far from blue or orange – the colors are part of the look

### Usage

```tsx
import { GlowCloud } from "@/components/ui/glow-cloud";

export function AssistantCard() {
  return (
    <article style={{ maxWidth: 320 }}>
      <GlowCloud color="blue" />
      <h3>Meet your assistant</h3>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| color | `"blue" \| "orange"` | `"orange"` | Blue-to-cyan or red-to-orange sky; the cloud's colors follow |
| background | `boolean` | `true` | Fill the whole box with the sky gradient; false leaves the cloud on a transparent background with a soft colored edge |
| followPointer | `boolean` | `true` | The eyes follow the pointer while it's over the illustration |
| label | `string` |  | Accessible description of the illustration |
| className | `string` |  | Extra class on the root |

### Accessibility

- Exposed as one image with a descriptive label
- Clicking only plays an animation – nothing else happens

### Motion

- A bright colored body inside a white glow, with white eyes shaded lightly on the inside
- The cloud floats and breathes; its shadow shrinks and fades as it rises
- Every few seconds it glances left, right, up or down: the body tilts a little, the eyes move further and the shine slides the other way, so it seems to turn
- It blinks at random moments, sometimes twice
- The eyes follow the pointer; a click gives a squishy bounce and a wink
- Runs only while on screen; with prefers-reduced-motion it keeps still and only reacts to clicks

### Responsive

- Square by default; give it a height and the sky fills the whole box while the cloud stays centered, up to 320px wide
- Light and dark mode via a .dark class or data-theme="dark": a deeper sky in dark mode

### Requirements

- React 19

Related: frost-cloud, model-wheel
