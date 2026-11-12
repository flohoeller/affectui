# Hover Card, clean style (Free)

A preview of what a link or name points to – opens after a short rest of the pointer or on keyboard focus, stays while the pointer moves into it, never on touch, flips to stay on screen

- Page: https://www.affectui.com/components/hover-card
- Section: Components · Data display
- Install: `npx shadcn@latest add https://www.affectui.com/r/hover-card-clean.json`
- Import: `@/components/ui/hover-card-clean`

### When to use

- A peek at what a name or link points to without leaving the page – an agent, a person, a file, a run, a pull request
- Mentions in feeds, logs and tables, where the full page is one click away but a glance is often enough

### When not to use

- The name of an icon button or a short hint – use the Tooltip
- Anything people must act on, or a form – use the Popover, which opens on a press
- Information that only lives in the card – touch screens never show it; keep it on the page the link opens
- Actions on the thing under the pointer – use the Context Menu

### Usage

```tsx
import { HoverCard } from "@/components/ui/hover-card-clean";

export function AgentName({ agent }: { agent: { id: string; name: string; role: string; status: string } }) {
  return (
    <HoverCard
      width={288}
      content={
        <div>
          <strong>{agent.name}</strong>
          <p>{agent.role} · {agent.status}</p>
          <a href={`/agents/${agent.id}`}>Open agent</a>
        </div>
      }
    >
      <a href={`/agents/${agent.id}`}>{agent.name}</a>
    </HoverCard>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| content | `ReactNode` |  | What the card shows – the card brings its padding, edge and shadow, you bring the inside. Empty or null: only the trigger is rendered |
| children | `ReactElement` |  | Exactly one element that takes a ref and focus – usually a link. Its own handlers run first; one that calls preventDefault keeps the card out of it. The card is a <div> right after it – inside running text, use a <div> rather than a <p> around it, as HTML doesn't allow a <div> in a <p> |
| side | `"bottom" \| "top" \| "right" \| "left"` | `"bottom"` | Where it opens; flips to the other side when that has more room |
| align | `"start" \| "center" \| "end"` | `"start"` | Which edges of card and trigger line up; switches when the card would stick out. start and end follow the reading direction |
| offset | `number` | `8` | Gap to the trigger in px |
| openDelay | `number` | `600` | How long the pointer rests (or the keyboard focus stays) before it opens, in ms – passing over a list opens nothing |
| closeDelay | `number` | `300` | How long it stays after the pointer leaves trigger and card, in ms |
| width | `number \| string` |  | The card's width; by default it fits its content, up to 320px |
| open / onOpenChange | `boolean / (open) => void` |  | Controls it from outside; leave open out and it opens on its own |
| disabled | `boolean` |  | Never opens |
| className | `string` |  | A class for the card |

### Keyboard

- Tab: Focusing the trigger opens the card after the wait; Tab again moves into the card's links, and on past them it closes
- Esc: Close the card – the focus goes back to the trigger when it was inside
- Enter: Follows the link, as always

### Accessibility

- The trigger stays an ordinary link or button – its name, role and Enter are untouched
- The card follows the trigger in the page, so Tab reaches its links right after the trigger and screen readers find it there
- Keyboard focus opens it like hovering does (only :focus-visible – a click's focus doesn't)
- Treat it as a preview: whatever it shows must also be on the page the link opens, since touch never shows it
- Escape closes it first, so a dialog around it stays open; links inside get the library's focus ring

### Motion

- Fades and scales in from the side and edge it is attached to
- With prefers-reduced-motion it shows at once

### Responsive

- The grace area: on the way from the trigger into the card, the pointer may cross the gap (and the corridor to the card's far corners) without it closing
- Only one card at a time; it lives in the top layer (popover), so no overflow cuts it, follows its trigger on scroll and flips to stay on screen – a tall card scrolls
- Touch never opens it: a tap follows the link, and a tap anywhere else closes one that is open
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: tooltip, popover, avatar, context-menu
