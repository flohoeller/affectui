# DACH Region (Free)

DACH map with fading neighbours and a pastel band along the border, switchable to the US, China, India, Brazil or Japan

- Page: https://www.affectui.com/illustrations/region-dach
- Section: Illustrations · Maps
- Install: `npx shadcn@latest add https://www.affectui.com/r/region-dach.json`
- Import: `@/components/ui/region-dach`

### When to use

- Showing a service area, sales territory or market focus in Germany, Austria and Switzerland
- Sections about regional exclusivity or local presence in one of the larger markets (US, China, India, Brazil, Japan), next to a short text

### When not to use

- Maps that need cities, regions or exact borders – the shapes are simplified and there are no labels

### Usage

```tsx
import { RegionDach } from "@/components/ui/region-dach";

export function TerritorySection() {
  return (
    <section style={{ maxWidth: 420 }}>
      <RegionDach />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| region | `"dach" \| "us" \| "cn" \| "in" \| "br" \| "jp"` |  | Shown region (controlled). Pair it with onRegionChange to keep the menu working |
| defaultRegion | `Region` | `"dach"` | Region shown first when region is not set |
| onRegionChange | `(region: Region) => void` |  | Called when the viewer picks a region in the menu |
| showSwitcher | `boolean` | `true` | Show the region menu in the top-left corner |
| label | `string \| ((region: Region) => string)` | `"Map of the DACH region: Germany, Austria and Switzerland" / "Map of Japan" …` | Accessible description of the map; by default it follows the current region |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Keyboard

- Enter / Space: On the menu button: open the region list. In the list: pick the highlighted region
- ArrowDown / ArrowUp: On the menu button: open the list. In the list: move through the regions
- Home / End: Jump to the first or last region
- Escape: Close the list and return focus to the menu button
- Tab: Close the list and move on

### Accessibility

- The map is one image whose label names the current region; the shapes inside are hidden from screen readers
- The menu button reports the current region and its expanded state; the list is a listbox with options, the selected one marked with aria-selected

### Motion

- A soft pastel band travels along the outer border in a continuous 14-second loop: a blurred glow that only spreads outwards, with three sharp layers on top
- Switching regions fades and slightly grows the old map away while the new one settles in from slightly smaller; the band starts anew
- The menu morphs open out of its button, and the hover fill glides between rows
- With prefers-reduced-motion the band stays still, regions swap instantly and the menu opens without the morph

### Responsive

- Transparent background; the neighbouring countries fade out towards the edges, so it sits on any light or dark surface
- Keeps a 540 : 440 aspect ratio and scales to the width of its container – set a width or max-width via className
- The menu scales down with the illustration (to about 60 %) so it still fits in small previews
- The file embeds the map data for all six regions (about 155 KB)
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
