# Scroll Area (Free)

A box that scrolls the browser's own way with a slim scrollbar of its own – it shows on hover and while scrolling, a draggable thumb, up and down or sideways, soft fades where there is more

- Page: https://www.affectui.com/components/scroll-area
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/scroll-area.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/scroll-area-clean.json` – lands as `scroll-area-clean.tsx`, import from `@/components/ui/scroll-area-clean` – its docs: `scroll-area-clean.md`
- Import: `@/components/ui/scroll-area`

### When to use

- A list, log or panel with a fixed height inside a card: sources, steps, messages, a run's output
- A row that is wider than its card – attached files, chips, tabs – scrolled sideways
- Anywhere the browser's thick scrollbar would look out of place, but scrolling should stay exactly as people know it

### When not to use

- The page itself – let the window scroll with its own bar
- A long table with sorting and selection – use the Data Table, which brings its own scroller
- Code – the Code Block scrolls its own lines
- Panes the user should size – use Resizable and put a Scroll Area inside each pane

### Usage

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sources({ items }: { items: { title: string; site: string }[] }) {
  return (
    <ScrollArea maxHeight={240} fade aria-label="Sources">
      <ul>
        {items.map((s) => (
          <li key={s.title}>
            {s.title} · {s.site}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | Which way it scrolls; the other way is clipped |
| type | `"hover" \| "scroll" \| "always"` | `"hover"` | When the bar shows: while the pointer is over the box or it scrolls · only while it scrolls · always, as long as there is more |
| fade | `boolean` | `false` | Soft fades at the edges where there is more to scroll; they shrink as you reach an end |
| maxHeight | `number \| string` |  | How tall it grows before it scrolls. Or give it a fixed height with className or style |
| viewportRef | `Ref<HTMLDivElement>` |  | The element that scrolls – for scrollTo, scrollTop or an IntersectionObserver root |
| onScroll | `UIEventHandler<HTMLDivElement>` |  | Fires on the element that scrolls |
| aria-label | `string` |  | Names the scrolling region for screen readers (or aria-labelledby) |
| ...div props | `ComponentProps<"div">` |  | className, style, id, ref … go to the outer box |

### Keyboard

- Tab: Reaches the box, but only while it has something to scroll
- ↑ / ↓ / ← / →: Scroll a little – the browser's own keys
- Page Up / Page Down / Space: Scroll a page
- Home / End: Jump to the start or the end

### Accessibility

- Scrolling stays the browser's own – wheel, trackpad, touch, keyboard, find-in-page and scroll-into-view all work, nothing is hijacked
- The box becomes a Tab stop only while it overflows, so keyboard users can scroll content that has no controls; when it has a name it is a region
- The drawn bar is hidden from screen readers – it only shows where you are
- The focus ring is drawn inside the box (offset −2px), so a card's edge never cuts it; only on keyboard focus

### Motion

- The bar fades in on hover and while scrolling and fades out a moment after; the thumb gets wider under the pointer
- A press on the track pages smoothly
- With prefers-reduced-motion it shows and hides at once and pages without the glide

### Responsive

- Follows its box and its content as either changes size – new rows, a narrower window, fonts loading
- Touch screens scroll with the finger as usual; the slim bar only shows where you are while you scroll
- Right to left: the bar sits on the left and the sideways thumb runs from the right
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: resizable, data-table, code-block, separator
