# Testimonial Wall (Free)

The landing-page wall of quotes – columns that scroll endlessly in opposite directions, ease to a stop on hover and scrub with inertia

- Page: https://www.affectui.com/blocks/testimonial-wall
- Section: Blocks · Social proof
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/testimonial-wall.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/testimonial-wall-clean.json` – lands as `testimonial-wall-clean.tsx`, import from `@/components/ui/testimonial-wall-clean` – its docs: `testimonial-wall-clean.md`
- Import: `@/components/ui/testimonial-wall`

### When to use

- A “Loved by” section on a landing or pricing page with eight or more quotes
- Social proof that should feel alive without asking for attention – it runs slowly and stops the moment someone reads

### When not to use

- Two or three quotes – show them side by side; a loop of three repeats too obviously
- A single hero quote or a case study – it deserves a static, larger layout
- Reviews people need to search or filter – use a list or grid

### Usage

```tsx
import { TestimonialWall } from "@/components/ui/testimonial-wall";

const items = [
  {
    quote: "We replaced three half-finished internal kits with it in a sprint.",
    name: "Lena Hartmann",
    role: "Design Lead",
    company: "Fieldnote",
    avatar: "/avatars/lena.jpg",
    rating: 5,
  },
  {
    quote: "The motion is the part nobody notices – which is exactly the point.",
    name: "Jonas Weber",
    role: "Staff Engineer",
    company: "Ledgerline",
    verified: true,
  },
  // … at least two quotes per column, ideally four or more
];

export function Testimonials() {
  return (
    <section className="py-24">
      <p className="text-center text-sm text-neutral-500">Testimonials</p>
      <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight">Loved by product teams</h2>
      <TestimonialWall items={items} speed={26} className="[--ui-tw-height:640px]" />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `{ quote, name, role?, company?, avatar?, rating?, verified? }[]` |  | The quotes. avatar is a photo URL – without one, or when it fails to load, the initials sit on a soft gray circle. rating (1–5) adds a small gray star row, verified a gray check beside the name. Quotes keep their line breaks and stop at ten lines; role and company wrap once, then end in an ellipsis. Fewer quotes than columns use fewer columns; none shows a short empty note |
| columns | `1 \| 2 \| 3` | `3` | Most columns on a wide container; the wall itself drops to 2 below 740px and 1 below 480px of its own width |
| speed | `number` | `28` | Pixels per second of the first column; the others run about 15 % slower and faster, in alternating directions |
| pauseOnHover | `boolean` | `true` | Ease the hovered column to a stop and wind it back up on leave. Keyboard focus always stops its column |
| label | `string` | `"What customers say"` | Accessible name of the wall |
| className | `string` |  | Extra class on the wrapper. Set the height with --ui-tw-height (600px by default) and the edge fade with --ui-tw-fade (96px) |

### Keyboard

- Tab: Moves through the quotes; the focused card's column stops and the card is nudged into view
- Shift / Tab: Moves back; leaving the wall lets the columns run again

### Accessibility

- A labelled region; every quote is a figure with a blockquote and a figcaption, read out once – the copies that make the loop are aria-hidden and inert
- Keyboard focus stops the column, so a card never runs away from the focus ring
- Hover, focus and press-and-hold all stop the motion, which covers the WCAG pause requirement for moving content
- Star ratings are an image with a text label (“Rated 5 out of 5”), the check is labelled “Verified customer”
- Reduced motion shows every quote once in a static masonry grid

### Motion

- Each column repeats a measured set and wraps by exactly its height – no gap, no jump
- Columns alternate up and down at slightly different speeds and start at different points, so rows never line up
- One requestAnimationFrame loop eases a velocity per column: hover slows it to a stop over about a third of a second, leaving winds it back up
- Drag a column with the mouse to scrub it; letting go flings it with inertia before it settles back into its own pace
- The hovered card lifts 3px with a soft shadow while the rest of the wall dims a little
- Only runs while on screen; top and bottom edges fade out with a mask

### Responsive

- Columns follow the wall's own width (3 / 2 / 1), so it works in a sidebar as well as full width
- One column on phones with 15px quotes; names win over role and company when space is tight – down to 320px without overflow
- Touch: vertical swipes keep scrolling the page (no scroll trap); pressing and holding a column pauses it to read
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: logo-marquee, tilt-card, text-reveal
