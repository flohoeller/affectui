# Card, clean style (Free)

The card every screen is built from – header with title, quiet line and an action, content and a footer, the whole card a click target and a gray fill when selected

- Page: https://www.affectui.com/components/card
- Section: Components · Cards
- Install: `npx shadcn@latest add https://www.affectui.com/r/card-clean.json`
- Import: `@/components/ui/card-clean`

### When to use

- A self-contained thing on a page: an agent, a project, an integration, a plan – with its name, a line about it and an action
- A settings group: its title and note on top, the fields inside, Save in the footer
- A grid or list of things to open – interactive, with a link as the title
- A small set of choices shown as cards – interactive and selected, with aria-pressed on the title's button

### When not to use

- A floating panel on top of the page – use the Popover or the Dialog
- Rows of a long list – plain rows with hairlines between them read faster than a stack of cards
- Only a line between groups – use the Separator
- One of the purpose-built cards: Approval Card, Decision Card, Project Card – they come with their behavior

### Usage

```tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card-clean";

export function AgentCard() {
  return (
    <Card>
      <CardHeader
        title="Support triage"
        description="Sorts new tickets and drafts the first reply"
        action={<button aria-label="More">⋯</button>}
      />
      <CardContent>142 tickets this week · 96% resolved</CardContent>
      <CardFooter>
        Running · started 2 min ago
        <button style={{ marginInlineStart: "auto" }}>Open</button>
      </CardFooter>
    </Card>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Card · as | `"div" \| "section" \| "article" \| "li"` | `"div"` | The element it renders as – li inside a <ul> of cards, section or article when it stands for a part of the page |
| Card · interactive | `boolean` |  | The whole card is a click target: it lifts on hover and a link or button in the title stretches over the card. Other buttons and links inside stay clickable on their own |
| Card · selected | `boolean` |  | Shown as picked: a gray fill and a firmer edge, no colored ring. Say it to screen readers too – aria-pressed or aria-current on the title's button or link |
| CardHeader · title | `ReactNode` |  | The title, in an h3 by default. A link or button here makes an interactive card clickable |
| CardHeader · description | `ReactNode` |  | A quiet line or two under the title |
| CardHeader · icon | `ReactNode` |  | Something small at the start – an icon, a logo, an agent's mark or a tile with one |
| CardHeader · action | `ReactNode` |  | At the end of the title line, centred on it: an icon button, a menu, a badge |
| CardHeader · titleAs | `"h2" \| "h3" \| "h4" \| "p"` | `"h3"` | The title's element – pick the level that fits your page, or p for cards in a list of choices |
| CardHeader · children | `ReactNode` |  | Anything more under the title and description, e.g. a row of badges |
| CardContent | `ComponentProps<"div">` |  | The card's body – any content |
| CardFooter | `ComponentProps<"div">` |  | A row at the bottom of the card in quiet 12px text. Status or meta on the start; give the first button marginInlineStart: auto to push the buttons to the end. Last inside Card |
| ...props | `ComponentProps<"div">` |  | className, style, id, ref, onClick and the rest go to each part's element |

### Keyboard

- Tab: An interactive card is reached through the link or button in its title – the ring goes around the whole card – then through the other buttons inside
- Enter: Opens the title's link or presses its button
- Space: Presses the title's button

### Accessibility

- The title is a real heading (h3 by default), so screen-reader users can jump from card to card
- Interactive cards keep one click target – a link or button in the title – instead of a clickable <div>, so it's announced with its name and works from the keyboard
- Buttons inside an interactive card stay separate targets above the stretched title; don't nest a second link that does the same thing
- Selected is shown with a gray fill and edge, not color – say it with aria-pressed or aria-current as well
- In Windows high-contrast mode the card keeps a visible edge, and a selected card a highlighted one

### Motion

- An interactive card's shadow deepens on hover over 160ms
- With prefers-reduced-motion it changes without the transition

### Responsive

- Fills its container's width – set width on a grid or the card's style
- Long titles and unbreakable words wrap inside the card instead of pushing it wider; the footer wraps its buttons onto a new line when narrow
- No hover lift on touch screens, so it doesn't stick after a tap
- Logical properties – right-to-left text mirrors the header and the footer
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep a card to one thing: a title, a line about it, at most one primary action
- In a grid of cards, give every card the same parts so they line up – an empty description still takes no room
- For choices, mark only the picked card selected; keep the others as they are rather than graying them out

### Requirements

- React 19

Related: separator, badge, avatar, project-card, icon-button
