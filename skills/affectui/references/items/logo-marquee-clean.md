# Logo Marquee, clean style (Free)

The endless “Trusted by” strip – a seamless loop that eases to a stop on hover, scrubs with inertia and lifts the hovered logo to colour

- Page: https://www.affectui.com/blocks/logo-marquee
- Section: Blocks · Social proof
- Install: `npx shadcn@latest add https://www.affectui.com/r/logo-marquee-clean.json`
- Import: `@/components/ui/logo-marquee-clean`

### When to use

- A “Trusted by” or “Used by teams at” strip under a hero or above pricing
- Showing more customer, partner or integration logos than fit in one static row

### When not to use

- Three to five logos – a static, centred row reads calmer and needs no motion
- Logos people need to compare or click through – use a grid; a moving target is hard to hit

### Usage

```tsx
import { LogoMarquee } from "@/components/ui/logo-marquee-clean";
import { VercelMark, LinearMark, StripeMark, FigmaMark, NotionMark, GitHubMark } from "./marks";

const logos = [
  { name: "Vercel", svg: <VercelMark />, scale: 0.86 },
  { name: "Linear", svg: <LinearMark />, color: "#5E6AD2" },
  { name: "Stripe", svg: <StripeMark />, color: "#635BFF", href: "/customers/stripe" },
  { name: "Figma", svg: <FigmaMark />, color: "#F24E1E" },
  { name: "Notion", svg: <NotionMark /> },
  { name: "GitHub", svg: <GitHubMark /> },
];

export function TrustedBy() {
  return (
    <section className="py-16">
      <p className="mb-6 text-center text-[10px] font-medium uppercase leading-4 tracking-[0.5px] text-black/45">Trusted by teams at</p>
      <LogoMarquee logos={logos} rows={2} speed={36} labels="beside" />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| logos | `{ name, svg?, src?, color?, scale?, href? }[]` |  | The logos. svg is a ReactNode – use fill="currentColor" so it follows the muted colour; src takes an image instead. color is the brand colour it lifts to on hover, scale corrects optical size, href makes it a link |
| speed | `number` | `40` | Pixels per second – the same pace on any width |
| direction | `"left" \| "right"` | `"left"` | Which way the first row runs |
| rows | `1 \| 2` | `1` | Two rows split the logos alternately and run in opposite directions |
| gap | `number` | `56` | Space between logos in px; about 60 % of it on narrow containers |
| pauseOnHover | `boolean` | `true` | Ease to a stop while hovered or focused with the keyboard, and speed back up on leave |
| grayscale | `boolean` | `true` | Quiet gray, colourless logos; the hovered one lifts to its brand colour. Off shows full colour and dims the others on hover |
| labels | `"none" \| "below" \| "beside"` | `"none"` | Show the brand name as a small caption under the mark, or beside it like a wordmark |
| label | `string` | `"Logos of companies using the product"` | Accessible name of the strip |
| className | `string` |  | Extra class on the wrapper |

### Keyboard

- Tab: Moves through linked logos; the strip stops and the focused logo is nudged into view

### Accessibility

- A labelled region; each name is read once – the repeated copies that make the loop are aria-hidden and inert
- Keyboard focus stops the strip so a logo never runs away from the focus ring
- Hover and focus stop it too, which covers the WCAG pause requirement for moving content
- Reduced motion shows every logo in a static, wrapping row
- A logo without svg or src, or whose image fails to load, shows a small white letter tile (or just its name when labels are on); an empty list renders nothing

### Motion

- The loop repeats a measured set and wraps by exactly its width – no gap, no jump
- One requestAnimationFrame loop eases a velocity per row: hover slows it to a stop, leaving winds it back up
- Drag or swipe to scrub; letting go flings it with inertia before it settles back into its own pace
- Only runs while on screen; edges fade out with a long, soft mask – no lines, no tray

### Responsive

- Container queries make logos and gaps smaller in narrow containers, down to 320px without page overflow
- Touch: horizontal swipes scrub the strip, vertical swipes still scroll the page
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: logo-cluster, text-reveal, gradient-text
