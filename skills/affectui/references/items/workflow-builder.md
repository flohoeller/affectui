# Workflow Builder (Pro)

Nodes on a canvas joined by curves – drag them in from a palette, set each one up, then run the workflow and watch every step light up

- Page: https://www.affectui.com/screens/workflow-builder
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/workflow-builder.json` (needs the Pro access key)
- Import: `@/components/ui/workflow-builder`

### When to use

- Automations people build themselves – triggers, AI steps, requests, conditions and actions joined into a flow
- Any graph people arrange by hand and then test, step by step

### When not to use

- A fixed sequence nobody rearranges – use a form or a step list
- Hundreds of nodes – use a list of rules with search

### Usage

```tsx
import { WorkflowBuilderScreen } from "@/components/ui/workflow-builder";

export default function Page() {
  return <WorkflowBuilderScreen workspace="Northwind" project="Customer onboarding" onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Northwind"` | Organisation in the path and the sidebar's workspace |
| project | `string` | `"Customer onboarding"` | Project in the path |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` | `false` | A saved workflow is being opened: gray cards where the nodes sit and neutral curves, Run off – the palette, path bar and toolbar stay real |
| empty | `boolean` | `false` | A new workflow: an empty canvas with one centered “Add a trigger” and an Add trigger button; the palette, path bar and toolbar stay real and the run panel shows its own empty states |
| className | `string` |  | Extra class on the root |
| nodes | `{ id; type; title; sub?; x; y; config? }[]` |  | The nodes – `type` is one of the palette's types, x and y in canvas pixels; `config` holds what the settings panel edits (a trigger without `source` shows as not configured) |
| edges | `{ id; from; port: "out" \| "yes" \| "no"; to }[]` |  | The curves between them – `port` is the output they leave from; a branch has Yes and No |
| branch | `string` | `"Main"` | Branch in the path – Main shows as Production |
| comments | `{ id; x; y; text; author? }[]` |  | Comments already on the canvas (posted, shown as pins) |
| stepResults | `Record<nodeId, { ms?; credits?; error? }>` |  | What each node returns in a test run – an error fails that step and stops the run |
| labels | `{ publish?: string }` |  | Labels, e.g. for a translation |
| palette | `{ id; label; items: { type; label; kind; icon; sub; description }[] }[]` |  | The palette's groups – kind is trigger, agent, tool, logic or action |

### Keyboard

- Tab: Path bar → Publish → palette (one stop) → canvas (one stop) → comment pins → toolbar → run panel → settings when open
- ↑ / ↓ / Home / End: Palette: move between the node types. Canvas: ↓ follows a node's first outgoing edge, ↑ goes back along an incoming one, Home / End jump to the first / last node of the flow
- ← / →: Canvas: the nearest node in the same row (else the previous / next in the flow)
- Alt ← / Alt → / Alt ↑ / Alt ↓: Nudge the focused node by 10px (Alt Shift: 50px)
- Enter: Open the focused node's settings (focus moves into them), or add the focused palette item under the selected node
- A: On a node: open the node picker at its first free output
- E: On a node: focus its first connection – then ← → cycle through that node's connections, ↑ / ↓ go to the node it leaves / enters, Delete removes it, Esc goes back
- Delete: Remove the focused node (⌘Z brings it back) or the focused / selected connection
- Enter / ⇧ Enter: In a comment: post it, or start a new line; on a pin, Enter opens it and the arrow keys move it (Shift: 50px)
- Space: Hold and drag to pan, whatever is under the pointer
- V / C: Select and comment tools – with Comment, a click on the canvas places a comment
- + / - / ⇧1: Zoom in, zoom out, fit to view
- ↑ / ↓ / Home / End: On the run panel's top edge: resize it (Shift: bigger steps), Home / End for the smallest / largest
- Esc: In this order: a dragged connection, the node picker, an open comment (back to its pin), the settings (back to the node), the palette sheet, the run panel, the comment tool, the selection

### Accessibility

- The canvas is one Tab stop (a roving tabindex): the selected node – or the first in the flow – takes Tab, the arrows move along the edges, so 40 nodes are never 40 stops
- Nodes are labelled buttons that say their kind and state (set up, running, done in a time, failed); the selected one is pressed. Connections are focusable too, named 'Connection from … to …'
- Connections can also be made and removed without the pointer: a node's settings list where each output goes, with Connect to… and a remove button for each
- Menus (path bar, Connect to…, selects) open with Enter, Space or ↓, move with the arrows and Home / End, close with Esc (focus back on their button) or Tab; the node picker closes when the focus leaves it
- Every control shows the accent focus ring for the keyboard only (:focus-visible) – never on a click; a focused connection thickens with an accent halo instead of a box
- On phones the palette and settings sheets keep the focus inside until they close
- A test run is announced politely, once per finished step and at the end (including a failure and its message) – not on every frame of the animation
- A comment's pin is a button that names its author and text; an open, posted comment has × to close and Delete and Resolve buttons, and its head folds it
- Every toolbar button has a label and a tooltip with its shortcut; the run panel's tabs are one tab stop with arrows; its top edge is a separator with its current height
- Long names end in '…' with the full text in a tooltip; file names keep their extension; names in right-to-left scripts read in their own direction; durations roll up (1.42s, 2m 05s, 1h 02m) and figures use thousands separators
- The tints of triggers come with words – Not configured, Active, Paused, Failed

### Motion

- The dot grid pans and zooms with the canvas – its spacing follows the zoom, the dots keep their size
- Opening the run panel keeps the zoom and place – it covers the bottom of the canvas; while the run plays the view glides (never zooms) to keep the running node in sight
- A connection being dragged follows the pointer as a dashed accent curve; inputs that can take it ring in accent and the one it snaps to fills
- A palette item being dragged is the node card itself under the pointer, at the canvas's zoom
- The palette and the settings slide and fade in; the run panel slides up from the bottom and the canvas makes room
- While a test run plays, a gradient runs along each edge in the sender's colour, the next node's input glows as it arrives, a trace runs once round the running card, then its status chip turns into a check with the time
- Steps appear one by one in the run panel
- With prefers-reduced-motion there is no gradient along the edges or trace – the running node gets a steady ring in its kind's colour, curves light without drawing and nothing slides

### Responsive

- Fills its container – give it the full viewport height in your app
- The flow runs from top to bottom and opens at 100% (never below 90% on a desktop canvas); Fit to view never zooms past 100%
- Pan by dragging the background, with Space + drag or two fingers; zoom with the toolbar, ⌘/Ctrl + wheel or a pinch. A plain wheel pans right away when the canvas fills a page that doesn't scroll; in a longer page, once you've clicked into it
- Below 640px the palette becomes a sheet behind Add node, the settings a sheet from the bottom, the path bar moves past the sidebar button and the run panel keeps the figures that matter; touch targets grow to 36px and fields use 16px text
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)
