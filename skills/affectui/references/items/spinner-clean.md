# Spinner, clean style (Free)

A small turning arc for work that runs right now – a faint ring in the text color, any size, inside a button or a status row, announced only when it has a label

- Page: https://www.affectui.com/components/spinner
- Section: Components · Feedback
- Install: `npx shadcn@latest add https://www.affectui.com/r/spinner-clean.json`
- Import: `@/components/ui/spinner-clean`

### When to use

- Something that works right now and ends on its own: a run, a check, a connect, a save
- In place of a button's icon while its action runs – the button keeps its width
- As the status icon of a row that is still running, next to rows that show a check

### When not to use

- A whole area waiting for its data – use the Skeleton, so the page keeps its shape
- An agent thinking or writing – use the Thinking Loader or the agent's own pixel mark
- Work with a known length – show its progress, like the Progress Tracker

### Usage

```tsx
import { Spinner } from "@/components/ui/spinner-clean";

export function ConnectButton({ busy, onConnect }: { busy: boolean; onConnect: () => void }) {
  return (
    <button type="button" aria-disabled={busy || undefined} onClick={() => !busy && onConnect()}>
      {busy ? <Spinner /> : <PlugIcon />}
      {busy ? "Connecting" : "Connect GitHub"}
    </button>
  );
}

// On its own, without words next to it: give it a label
<Spinner size={12} label="Checking domain" />
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `number` | `14` | Width and height in px |
| label | `string` |  | Announced as a status (role="status" with aria-label). Leave it out when text next to it already says what happens – then it is hidden from screen readers |
| className | `string` |  | Extra classes – color it with color, it draws in currentColor |
| ...svg props | `ComponentProps<"svg">` |  | style, ref, data-* – everything goes to the <svg> |

### Accessibility

- With label: role="status" and aria-label, so screen readers say what is loading
- Without label: aria-hidden – the text next to it ("Running", "Connecting") carries the meaning, nothing is read twice
- Drawn in currentColor, so it always has the contrast of the text around it

### Motion

- One turn every 800ms, linear – the arc on a ring at 18% of the color
- With prefers-reduced-motion it keeps turning, slowly (2.4s): it is the only sign that something still runs
- Speed as a variable: --ui-spnc-speed on .ui-spnc

### Responsive

- A fixed size in px, so it never pushes text around; sits on the text's middle with vertical-align
- Dark mode needs nothing: it takes the text color

### Requirements

- React 19

Related: skeleton, button, thinking-loader, toaster, progress-tracker
