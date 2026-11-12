# World Map Continental (Pro)

World map with one highlighted continent and a pastel band along its coastline, switchable between all six

- Page: https://www.affectui.com/illustrations/world-map
- Section: Illustrations · Maps
- Install: `npx shadcn@latest add https://www.affectui.com/r/world-map.json` (needs the Pro access key)
- Import: `@/components/ui/world-map`

### When to use

- Showing that you serve, operate in or focus on one continent
- Market, coverage or expansion sections on a landing page, where a calm map says more than a list of countries

### When not to use

- Data maps with values per country – this is a decorative illustration, not a chart
- Showing individual countries – each continent is one merged shape without borders, simplified from Natural Earth 1:110m

### Usage

```tsx
import { WorldMap } from "@/components/ui/world-map";

export function MarketSection() {
  return (
    <section style={{ maxWidth: 640 }}>
      <WorldMap />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| continent | `"north-america" \| "south-america" \| "europe" \| "africa" \| "asia" \| "oceania"` |  | Highlighted continent (controlled). Pair it with onContinentChange to keep the menu working |
| defaultContinent | `Continent` | `"europe"` | Continent highlighted first when continent is not set |
| onContinentChange | `(continent: Continent) => void` |  | Called when the viewer picks a continent in the menu |
| showSwitcher | `boolean` | `true` | Show the continent menu in the top-left corner |
| label | `string \| ((continent: Continent) => string)` | `"World map with Europe highlighted" …` | Accessible description of the map; by default it follows the current continent |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Keyboard

- Enter / Space: On the menu button: open the continent list. In the list: pick the highlighted continent
- ArrowDown / ArrowUp: On the menu button: open the list. In the list: move through the continents
- Home / End: Jump to the first or last continent
- Escape: Close the list and return focus to the menu button
- Tab: Close the list and move on

### Accessibility

- The map is one image whose label names the highlighted continent; the shapes inside are hidden from screen readers
- The menu button reports the current continent and its expanded state; the list is a listbox with options, the selected one marked with aria-selected

### Motion

- A soft pastel band travels along the coastline of the continent's main landmass in a continuous 14-second loop: a blurred glow that only spreads outwards, with three sharp layers on top – the same band as in the DACH Region map
- Switching continents fades the old highlight back into the gray world while the new one settles in from slightly smaller with its shadow; the band starts anew
- The menu morphs open out of its button, and the hover fill glides between rows
- With prefers-reduced-motion the band stays still, continents swap instantly and the menu opens without the morph

### Responsive

- Transparent background; the solid gray world and the lighter highlighted continent read on light and dark surfaces alike
- Keeps a 540 : 242 aspect ratio and scales to the width of its container – set a width or max-width via className
- The menu scales down with the illustration (to about 60 %); on small sizes the open list may extend below the map
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
