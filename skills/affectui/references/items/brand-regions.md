# AI Search / Regions (Pro)

Where a brand shows up in AI answers, country by country – a world map shaded by visibility, share of voice or sentiment, with the regions ranked beside it

- Page: https://www.affectui.com/screens/brand-regions
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/brand-regions.json` (needs the Pro access key)
- Import: `@/components/ui/brand-regions`

### When to use

- AI search analytics: in which countries a brand shows up in answers, how much of the conversation it owns and how people feel about it
- Any number per country you want to read on a map and as a ranked list at the same time

### When not to use

- Numbers over time – use Analytics or Trend Chart
- A world map as decoration – use the World Map illustration

### Usage

```tsx
import { BrandRegionsScreen } from "@/components/ui/brand-regions";

export default function Page() {
  return (
    <BrandRegionsScreen
      brand="Northwind"
      regions={regions} // [{ id: "840", name: "United States", flag: "us", visibility: 52.1, sov: 44.9, sentiment: 72.3, change: { … } }]
      answers={5600}
      onTab={(tab) => router.push(`/brand/${tab.toLowerCase()}`)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| brand | `string` | `"Brand"` | The page's heading |
| regions | `{ id; name; flag?; visibility; sov; sentiment; change: { visibility; sov; sentiment } }[]` |  | Every country with data. id is the ISO 3166 numeric code ("840" is the United States) – it finds the country on the map; flag the two-letter code for the drawn flag. Values in percent, change in points against the period before |
| answers | `number` | `5600` | How many answers the numbers come from – the button beside the tabs |
| date | `Date` |  | The last day of the period, shown in the tooltip |
| defaultTab | `"Visibility" \| "Sentiment" \| "Topics" \| "Platforms" \| "Regions" \| "Shopping" \| "Citations"` | `"Regions"` | The tab the screen opens on |
| onTab | `(tab) => void` |  | Called when another tab is picked – route to its page |
| onAnswers | `() => void` |  | The answers button |
| loading | `boolean` |  | A gray map that breathes and gray rows |
| empty | `boolean` |  | No answers yet – the map stays gray with a short note, the list says so too |
| workspace | `string` | `"Northwind"` | The workspace in the sidebar |
| className | `string` |  | Extra class on the root |

### Keyboard

- ← / →: Between the tabs, the periods and the measures
- Tab: Into the regions – the list is one Tab stop
- ↑ / ↓: From country to country – each one lights up on the map with its card
- Home / End: To the first or the last country
- Enter: Zoom the map to the country's part of the world, Enter again for the whole world

### Accessibility

- The map is one image with a name; every number on it is also in the list, which screen readers walk
- Each row is named with its country, the measure, the value and how much it moved
- Tabs, periods and measures follow their ARIA patterns; filters and Chart config are menus
- Rings show for the keyboard only – inside the edge for rows and segment buttons

### Motion

- Pointing at a country or a row lights both up and fades the other countries a little; the card fades in
- Loading: the gray map breathes
- With prefers-reduced-motion nothing fades

### Responsive

- On narrower screens the regions go under the map; on phones the filters share the row and the tabs scroll sideways
- Chart config zooms to the Americas, Europe or Asia, and turns the shading off for one tone
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: prompt-explorer, analytics, world-map
