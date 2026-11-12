# Integration Grid (Free)

Honeycomb-like wall of integration logos around a bright centre tile with your product mark, fading out toward the edges

- Page: https://www.affectui.com/illustrations/integration-grid
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/integration-grid.json`
- Import: `@/components/ui/integration-grid`

### When to use

- Integration sections and feature cards like “Works with the tools you already use”
- Landing pages that show your product at the centre of an ecosystem

### When not to use

- A real, clickable list of integrations – the tiles are decorative and not links
- More than 22 logos – the grid has 22 outer tiles, extra logos are left out

### Usage

```tsx
import { IntegrationGrid } from "@/components/ui/integration-grid";

export function IntegrationsSection() {
  return (
    <section style={{ maxWidth: 760 }}>
      <IntegrationGrid mark={<img src="/logo.svg" alt="" width={40} height={40} />} />
      <h3>Plays well with your stack</h3>
      <p>Connect the tools your team already relies on.</p>
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| logos | `IntegrationGridLogo[]` | `22 well-known tools` | Logos filled row by row around the centre – each { name, path, color?, darkColor? } with a single 24 × 24 SVG path (e.g. from simple-icons); without color the mark follows the ink color |
| mark | `ReactNode` | `a neutral flower mark` | Content of the larger centre tile – usually your product logo |
| columns | `5 \| 7 \| 9` | `9` | Tiles in the middle row – the rows above and below get two fewer. Fewer columns make the tiles larger |
| label | `string` |  | Accessible description – by default lists the integrations |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- Exposed as one image whose label lists every integration; tiles and logos are hidden from screen readers
- Nothing in the scene is interactive

### Motion

- Still by default; on hover a tile turns fully white and its logo grows a little from the centre
- With prefers-reduced-motion the hover lift is switched off

### Responsive

- Transparent background, so it sits on any light or dark surface
- Keeps a 1520 : 560 aspect ratio and scales to the width of its container – every size is in container units
- Tile fills fade toward the edges while the logos keep their full brand colors
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
