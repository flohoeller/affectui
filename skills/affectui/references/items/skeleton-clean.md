# Skeleton, clean style (Free)

Gray shapes in the exact size of the content they stand in for – a soft sheen sweeping across all of them in step, a Loading wrapper that tells screen readers and fades in late, so fast loads never flash

- Page: https://www.affectui.com/components/skeleton
- Section: Components · Feedback
- Install: `npx shadcn@latest add https://www.affectui.com/r/skeleton-clean.json`
- Import: `@/components/ui/skeleton-clean`

### When to use

- A list, table, card or panel waiting for its data – the page keeps its shape, nothing jumps when the data lands
- Text, avatars, badges and buttons whose size you know: give each skeleton the size of what it replaces
- Wrap the skeletons of one area in Loading – one status for screen readers, and nothing flashes when the data is quick

### When not to use

- A single action that runs – use the Spinner, in the button or the row
- An agent thinking or writing an answer – use the Thinking Loader
- Data that never came – show an empty state with a first step, not skeletons forever

### Usage

```tsx
import { Loading, Skeleton } from "@/components/ui/skeleton-clean";

export function RunList({ runs }: { runs?: Run[] }) {
  // Loading gets the list's own class, so its rows sit in the same layout
  if (!runs)
    return (
      <Loading label="Loading runs" className="run-list">
        {[212, 164, 176].map((w, i) => (
          <div key={i} className="run-row">
            <Skeleton width={16} height={16} radius={4} />
            {/* line: as tall as the 20px text line, the 10px bar centered in it */}
            <span className="run-row__title">
              <Skeleton line width={w} height={10} />
            </span>
          </div>
        ))}
      </Loading>
    );

  return (
    <div className="run-list">
      {runs.map((r) => (
        <div key={r.id} className="run-row">
          <AgentMark id={r.agent} />
          <span className="run-row__title">{r.title}</span>
        </div>
      ))}
    </div>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Skeleton · width | `number \| string` | `"100%"` | px or any CSS length; never wider than its parent |
| Skeleton · height | `number \| string` | `12` | The shape's own height |
| Skeleton · radius | `number \| string` | `6px (--aui-radius-sm)` | Corner radius – "50%" for an avatar |
| Skeleton · line | `boolean \| number \| string` |  | Puts the shape in a box as tall as the text line it replaces (true = 1lh, or a length) and centers it there – the row keeps its height when the words land |
| Skeleton · ...span props | `ComponentProps<"span">` |  | className, style, ref – with line they go to the line box |
| Loading · label | `string` | `"Loading"` | What loads, for screen readers – "Loading runs" |
| Loading · className | `string` |  | The real layout's class, so the grid or list is the same one the data fills |
| Loading · ...div props | `ComponentProps<"div">` |  | style, ref, data-* – everything goes to the wrapper |

### Accessibility

- Skeletons are aria-hidden – a screen reader hears nothing of the gray shapes
- Loading is role="status" with aria-busy and a label, so it says once what is loading
- Swap Loading for the real content when the data lands; the status goes with it

### Motion

- A soft sheen sweeps across every skeleton at once (1.6s), so a whole list breathes as one
- Loading fades its skeletons in after 150ms – a fast load shows the data straight away, no flash of gray
- With prefers-reduced-motion the sheen stops; the shapes stay
- Speed and delay as variables: --ui-sklc-speed on .ui-sklc, --ui-sklc-delay on .ui-sklc-loading

### Responsive

- Never wider than its parent (max-width: 100%), so fixed widths hold on phones
- Give the Loading wrapper the real layout's class – the narrow layout of the data applies to the skeletons too
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: spinner, thinking-loader, data-table, progress-tracker
