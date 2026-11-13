# Resizable, clean style (Free)

Panes side by side or stacked with a line between them you can drag – sizes in percent, a smallest and largest size, panes that fold away, arrow keys, Home, End and Enter on the handle, a double-click to reset

- Page: https://www.affectui.com/components/resizable
- Section: Components · Data display
- Install: `npx shadcn@latest add https://www.affectui.com/r/resizable-clean.json`
- Import: `@/components/ui/resizable-clean`

### When to use

- A sidebar or list next to a work area that people want wider or narrower: runs and their output, files and an editor, a thread and its detail
- An editor over its output or log, stacked – nest a vertical group inside a pane
- A pane that should fold away and come back – collapsible, with Enter on its handle or a drag past half its minimum

### When not to use

- Two views the user switches between rather than sees together – use tabs or the Segmented Control
- A panel that slides over the page for a moment – use the Dialog or the Popover
- Only scrolling inside a fixed box – use the Scroll Area (and put one inside each pane when its content is long)

### Usage

```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable-clean";

export function Workspace() {
  return (
    <div style={{ height: 480 }}>
      <ResizablePanelGroup direction="horizontal" onLayout={(sizes) => localStorage.setItem("workspace", JSON.stringify(sizes))}>
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50} collapsible>
          <RunList />
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Resize the runs list" />
        <ResizablePanel defaultSize={70} minSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65}>
              <RunOutput />
            </ResizablePanel>
            <ResizableHandle aria-label="Resize the log" />
            <ResizablePanel defaultSize={35} minSize={15} collapsible>
              <RunLog />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ResizablePanelGroup · direction | `"horizontal" \| "vertical"` | `"horizontal"` | horizontal: panes side by side · vertical: stacked. The group fills its parent – give the parent a height |
| ResizablePanelGroup · onLayout | `(sizes: number[]) => void` |  | Every pane's size in %, in order, after the user resizes – store it and pass it back as defaultSize |
| ResizablePanelGroup · keyboardStep | `number` | `5` | How far an arrow key moves a handle, in %; Shift doubles it |
| ResizablePanel · defaultSize | `number` |  | The size it starts at, in %. Panes without one share what is left; all sizes are scaled to add up to 100 |
| ResizablePanel · minSize / maxSize | `number` | `0 / 100` | Its smallest and largest size, in % |
| ResizablePanel · collapsible | `boolean` | `false` | Snaps to collapsedSize when dragged past half its minimum; Enter on the handle next to it folds it and brings it back |
| ResizablePanel · collapsedSize | `number` | `0` | Its size when folded, in %. At 0 it is hidden and inert; a little more keeps an icon rail |
| ResizableHandle · withHandle | `boolean` | `false` | A small grip on the line, so it reads as draggable |
| ResizableHandle · aria-label | `string` | `"Resize"` | What it resizes, read out by screen readers – e.g. "Resize the runs list" |
| ...div props | `ComponentProps<"div">` |  | className, style, id, ref … go to the group, the pane or the handle |

### Keyboard

- Tab: Reaches each handle
- ← / →: Move a handle between panes side by side (↑ ↓ for stacked ones); Shift moves twice as far
- Home / End: Make the pane before the handle as small or as large as it may get
- Enter: Fold the collapsible pane next to the handle, or bring it back to its size

### Accessibility

- Each handle is a focusable role="separator" with aria-valuenow, aria-valuemin and aria-valuemax – the size of the pane before it in % – and aria-controls pointing at that pane
- Name each handle with aria-label, so screen readers say what it resizes
- A pane folded to 0 is inert: its controls leave the Tab order and screen readers skip it
- The focus ring is drawn around the grab strip, inside it, so the panes never cut it; only on keyboard focus

### Motion

- A drag follows the pointer exactly; keys, Enter and a double-click glide the panes to their new size
- The line firms up after a short rest under the pointer, so passing over it stays calm
- With prefers-reduced-motion the panes jump to their size

### Responsive

- Sizes are in %, so the layout keeps its proportions at any width; a pane's content never pushes it wider – it scrolls
- A 12px grab strip over the line (24px on touch screens) and a bigger grip on touch
- Right to left: the panes and the arrow keys follow the reading direction
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: scroll-area, separator, data-table, dialog
