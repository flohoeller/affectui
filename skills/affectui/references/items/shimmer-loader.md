# Shimmer Loader (Free)

Skeleton blocks that share one soft light sweep, plus shimmering text for “Thinking…” states

- Page: https://www.affectui.com/motion/shimmer-loader
- Section: Motion · Loaders
- Install: `npx shadcn@latest add https://www.affectui.com/r/shimmer-loader.json`
- Import: `@/components/ui/shimmer-loader`

### When to use

- Placeholders while cards, lists or profiles load, shaped like the content that will arrive
- A shimmering status label while an AI answer or a long task is being generated

### When not to use

- Waits under ~300 ms – a flash of skeletons feels slower than showing nothing
- Progress you can measure; a progress bar tells the user how long is left

### Usage

```tsx
import { Skeleton, ShimmerText } from "@/components/ui/shimmer-loader";

export function PostSkeleton() {
  return (
    <div aria-busy="true" className="flex items-center gap-3">
      <Skeleton circle width={36} />
      <div className="grid gap-2">
        <Skeleton width={120} height={10} />
        <Skeleton width={80} height={8} />
      </div>
    </div>
  );
}

export function Thinking() {
  return <ShimmerText>Generating summary…</ShimmerText>;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Skeleton · width | `number \| string` | `"100%"` | Width – numbers are px, strings any CSS length |
| Skeleton · height | `number \| string` | `12` | Height – numbers are px |
| Skeleton · radius | `number \| string` | `6` | Corner radius |
| Skeleton · circle | `boolean` | `false` | Round shape that uses width for both sides, e.g. for avatars |
| Skeleton · className / style | `string / CSSProperties` |  | Extra class or inline styles on the block |
| ShimmerText · children | `ReactNode` |  | The label the highlight runs through |
| ShimmerText · duration | `number` | `2` | Seconds for one pass of the highlight |
| ShimmerText · className | `string` |  | Extra class – font size and weight are inherited |

### Accessibility

- Skeletons are aria-hidden – put aria-busy="true" on the container that is loading
- ShimmerText stays real text, so screen readers read the label normally

### Motion

- The skeleton highlight is pinned to the viewport, so all blocks share one sweep that travels across them together
- Reduced motion shows static placeholders and plain text

### Responsive

- Skeletons fill their container by default; set width for fixed shapes
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
