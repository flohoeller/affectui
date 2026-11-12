# Badge, clean style (Free)

A small status label that carries the color – six soft tones, a leading dot or icon, a live dot that pulses while something runs and a round count up to 99+

- Page: https://www.affectui.com/components/badge
- Section: Components · Data display
- Install: `npx shadcn@latest add https://www.affectui.com/r/badge-clean.json`
- Import: `@/components/ui/badge-clean`

### When to use

- The state of a run, task or agent on a row or card: Running, Needs you, Done, Failed
- A count next to a title or in the sidebar: unread, waiting, errors – count with 99+ above max
- A short kind or stage that isn't a status: Beta, Pro, Draft – neutral or purple
- Something running right now – live gives the dot a soft pulse

### When not to use

- Anything you click or remove – use the Button, or the Tag Input for chips with an ×
- Summary text and counts in a header – keep those gray text; color belongs to the badge on the row
- A longer message about a state – use the Toaster or a notice
- A person or an agent – use the Avatar

### Usage

```tsx
import { Badge } from "@/components/ui/badge-clean";

type Run = { id: string; title: string; status: "running" | "waiting" | "done" | "failed" | "queued" };

const STATUS = {
  running: <Badge tone="info" live>Running</Badge>,
  waiting: <Badge tone="warning" dot>Needs you</Badge>,
  done: <Badge tone="success">Done</Badge>,
  failed: <Badge tone="danger">Failed</Badge>,
  queued: <Badge>Queued</Badge>,
};

export function RunRow({ run }: { run: Run }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ flex: 1, minWidth: 0 }}>{run.title}</span>
      {STATUS[run.status]}
    </div>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | `ReactNode` |  | The text – one or two words. Long text ends in … at the badge's max-width (100% of its container) |
| tone | `"neutral" \| "info" \| "success" \| "warning" \| "danger" \| "purple"` | `"neutral"` | neutral: gray · info: blue, running · success: green, done · warning: orange, needs you · danger: red, failed · purple: a kind, like Beta. A soft tint with text in the same color |
| size | `"sm" \| "md"` | `"sm"` | 18px high with 11px text, or 20px with 12px |
| dot | `boolean` |  | A small dot in the tone's color before the text |
| live | `boolean` |  | The dot pulses softly – for running, live and recording. Implies dot |
| icon | `ReactNode \| HugeIcon` |  | An icon before the text – an inline SVG, or a Hugeicons icon object drawn inline. Takes the badge's color |
| count | `number` |  | Makes it a round count: the number instead of children, formatted for the reader's locale, never below 0. A badge with no text, count, dot or icon (e.g. count={NaN}) renders nothing |
| max | `number` | `99` | Above it a count reads max+, e.g. 99+ |
| ...span props | `ComponentProps<"span">` |  | className, title, aria-label, dir, ref and the rest go to the <span> |

### Accessibility

- A plain <span> – read as text where it stands, so the row reads "Weekly usage report, Done"
- Color is never the only signal: the word carries the state, the dot and icon are hidden from screen readers
- A bare count says only a number – give it an aria-label like "128 waiting" when the text around it doesn't say what it counts
- Each tone's text is the darker shade of its color (the --aui-success, --aui-danger … tokens), readable on its tint in light and dark

### Motion

- live: a soft halo grows out of the dot and fades every 1.8s – nothing else moves
- With prefers-reduced-motion the dot stays still

### Responsive

- Never wraps: long text shortens with … inside its row instead
- Numbers use tabular figures, so counts don't jitter as they change
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Map statuses to tones once (running → info + live, waiting → warning + dot, done → success, failed → danger, queued → neutral) and reuse that map
- Keep one badge per row – the color is the signal, so several colored badges side by side cancel each other out

### Requirements

- React 19
- Optional: @hugeicons/core-free-icons – its icon objects can be passed straight to icon

Related: avatar, tag-input, agent-fleet, spinner
