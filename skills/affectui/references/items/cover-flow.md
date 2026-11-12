# Cover Flow (Free)

Browse covers in 3D – drag, flick or scrub the row, it springs to the nearest cover; images drift in their frames over a soft reflection

- Page: https://www.affectui.com/illustrations/cover-flow
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/cover-flow.json`
- Import: `@/components/ui/cover-flow`

### When to use

- Six to twenty visual items where looking at one at a time is the point – albums, places, products, case studies, templates
- A showcase row that should feel physical: drag, flick, sideways trackpad scroll

### When not to use

- Text-heavy slides or many items to compare side by side – use a plain carousel or a grid
- Large libraries – a grid with a lightbox scales better

### Usage

```tsx
import { CoverFlow } from "@/components/ui/cover-flow";

export function Albums() {
  return (
    <CoverFlow
      aria-label="New releases"
      items={[
        { id: 1, title: "Low Tide", subtitle: "Mara Lind", image: "/covers/low-tide.jpg" },
        { id: 2, title: "Night Drive", subtitle: "Okto", image: "/covers/night-drive.jpg" },
        { id: 3, title: "Paper Moon", subtitle: "Ilse & June", image: "/covers/paper-moon.jpg" },
      ]}
      onSelect={(item) => openAlbum(item.id)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `CoverFlowItem[]` |  | { id, title?, subtitle?, image?, alt?, cover? } – pass an image URL or any ReactNode as cover |
| index | `number` |  | Controlled front cover – pair with onIndexChange |
| defaultIndex | `number` | `middle cover` | Starting cover when uncontrolled |
| onIndexChange | `(index: number) => void` |  | Called whenever a different cover reaches the front, also while dragging |
| onSelect | `(item, index) => void` |  | Clicking the front cover or pressing Enter – e.g. open a detail view |
| itemWidth | `number` | `280` | Cover width in px – the whole row scales down in narrow containers (to half at most) |
| itemHeight | `number` | `280` | Cover height in px |
| angle | `number` | `50` | How far the side covers turn away, in degrees |
| reflection | `boolean` | `true` | Mirror the covers on the floor |
| caption | `boolean` | `true` | Title and subtitle of the front cover |
| renderCaption | `(item, index) => ReactNode` |  | Replaces the default caption |
| controls | `boolean` | `true` | Previous and next buttons beside the caption |
| ticks | `boolean` | `true` | Small position ticks under the caption – clicking one jumps there |
| sound | `boolean` | `false` | A soft click each time a new cover reaches the front (Web Audio, no file) |
| aria-label | `string` | `"Cover flow"` | Names the carousel |
| className | `string` |  | Extra class on the root |

### Keyboard

- ← / →: Previous or next cover while the row has focus
- Home / End: First or last cover
- ↵: Selects the front cover (calls onSelect)

### Accessibility

- A region with aria-roledescription="carousel"; each cover is a group with aria-roledescription="slide" and a label like "3 of 10: Alpenglow"
- Covers away from the front are aria-hidden; the reflections are aria-hidden and inert
- The caption is a polite live region, so the new front cover is announced
- Previous / next are real buttons; the ticks are labelled "Show <title>" with aria-current and stay out of the tab order

### Motion

- A spring carries the row: drag 1:1, flick and it travels with your speed, then lands on a cover – a quick flick always moves at least one
- Sideways trackpad scrolling scrubs the row and settles in the direction of the swipe; vertical scrolling stays with the page
- Covers turn, recede, scale down and dim with distance; a light sheen sits on the side facing the center and each image drifts inside its frame
- The ends rubber-band; the caption rises in from the direction of travel
- With prefers-reduced-motion covers jump into place and the drift is off

### Responsive

- Scales with its container down to half size; touch-action pan-y keeps vertical swipes scrolling the page
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: tilt-card, logo-marquee, segmented-control
