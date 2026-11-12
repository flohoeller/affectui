# Client Context, clean style (Pro)

A client workspace with live numbers and a shared context timeline – switch clients, search, filter and add notes or files

- Page: https://www.affectui.com/blocks/client-context
- Section: Blocks · Productivity
- Install: `npx shadcn@latest add https://www.affectui.com/r/client-context-clean.json` (needs the Pro access key)
- Import: `@/components/ui/client-context-clean`

### When to use

- Agency, accounting and CRM tools where a team keeps goals, files and decisions per client
- Product pages for AI tools – show the context that makes every answer fit the client

### When not to use

- A full activity log with hundreds of events – page or virtualise it instead
- Real-time collaboration – the timeline adds entries locally and leaves syncing to you

### Usage

```tsx
import { ClientContext } from "@/components/ui/client-context-clean";

export function ClientPage() {
  return (
    <ClientContext
      me={{ name: "Lena Hart", avatar: "/avatars/lena.jpg" }}
      onAddContext={(clientId, text, files) => api.addContext(clientId, { text, files })}
      onCreateClient={(name) => api.createClient(name)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| clients | `ContextClient[]` |  | Each { id, name, meta, mark, kpis, reports, context } – the switcher lists them all |
| context entries | `ContextEntry[]` |  | note ("@Report name" becomes a mention), report, files (type pdf · xlsx · csv · doc) or integration { app, connected } |
| me | `{ name, avatar? }` |  | Author of new context |
| onAddContext | `(clientId, text, files) => void` |  | Called when context is added |
| onCreateClient | `(name) => void` |  | Called when a client is created from the switcher |
| className | `string` |  | Extra class on the root |

### Keyboard

- ⌘ / Enter: Adds the context you typed
- @: Suggests the client's reports – Enter or Tab inserts the first
- Esc: Closes the switcher, the filter and the mention suggestions
- Tab: Moves through the switcher, tabs, search, filter and composer – the focus ring is the accent color

### Accessibility

- Tabs are a tablist with a labelled panel; the client switcher, filter and mention suggestions are listboxes
- KPI cards and financial rows are toggle buttons; reports are disclosure buttons with aria-expanded
- Search, composer and attachment buttons are labelled; settings are switches

### Motion

- KPI cards rise in one after another and their sparklines draw in; new context slides in at the top
- Opening a metric fades the other KPI cards instead of drawing a ring
- The white chip of the tabs glides with a little spring, reports fold open, menus pop from their button, sync icons spin while working
- With prefers-reduced-motion everything switches instantly

### Responsive

- Follows its own width: below 680px the KPIs wrap into two rows, the tabs stretch and search moves below them
- Touch screens get larger buttons, menu rows and switches, and the remove button stays visible
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
