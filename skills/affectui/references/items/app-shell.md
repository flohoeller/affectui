# App Shell Inset (Pro)

Collapsible sidebar with workspace, menu, projects and account, and a resizable work area on the right – tools, browser and suggested sources – the frame every screen sits in

- Page: https://www.affectui.com/screens/app-shell
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/app-shell.json` (needs the Pro access key)
- Import: `@/components/ui/app-shell`

### When to use

- The base of an AI assistant, internal tool or SaaS dashboard
- Building your own screens on the same frame as the other affectUI screens

### When not to use

- Marketing pages – use a block or a plain layout
- Apps with deep, multi-level navigation trees

### Usage

```tsx
import { AppShell } from "@/components/ui/app-shell";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      active="New chat"
      workspace="Acme"
      user={{ name: "Alex Morgan" }}
      onNavigate={(label) => router.push(routes[label])}
      // The work area on the right, with tabs: it starts with a New tab – address field, Tools and Suggested;
      // a suggestion with an artifact opens it in the tab, in the shared viewers
      workArea={{ artifacts: files, newTab: { sources: suggested, onOpen: (id) => openTool(id) } }}
    >
      <div className="ui-as-page">{children}</div>
    </AppShell>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | `ReactNode` |  | The page shown next to the sidebar |
| active | `string` |  | Label of the menu item or project that is open |
| onNavigate | `(label: string) => void` |  | Called with the label of a menu item or project when it is clicked |
| workspace | `string` | `"Acme"` | Workspace name; its first letter becomes the logo |
| user | `{ name: string; avatar?: string; email?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom; without an avatar it shows initials. Its menu opens with picture, name and email, then language, appearance, integrations, settings, apps, changelog, help and log out |
| nav | `ShellNavItem[]` | `New chat, Folders, Integrations` | Menu items, each { label, icon } |
| projects | `string[]` |  | Project list under the menu |
| chats | `ShellChat[]` |  | Chats in the sidebar – with it the projects become folders that open and close and hold the chats whose folder they are; the rest under Pinned and Chats. A ⋯ menu (rename, pin, unread, project, section, share, copy, new window, archive) and a pin on hover; drag to reorder or into a folder |
| onOpenChat | `(chat: ShellChat) => void` |  | Called when a chat is clicked (default: onNavigate with its title) |
| sidebarWidth | `{ default?: number; min?: number; max?: number }` | `{ default: 272, min: 220, max: 380 }` | Sidebar width in px – drag its edge between min and max, double-click the edge for the default |
| header | `{ title: ReactNode; actions?: ReactNode } \| false` |  | A header across the whole app, like Claude's – sidebar toggle and search, the page's title (BarTitle) and actions, the work area's title; one line under it |
| sideCards | `boolean` | `true` | The cards at the bottom of the sidebar – what's new and Getting started; false hides both |
| workArea | `WorkAreaOptions \| WorkArea` |  | The work area on the right, with tabs like Codex – resizable and collapsible like the sidebar. Pass the options, or the result of useWorkArea(options) when the page opens artifacts itself. Options: tabs (your own { id, title, label?, icon?, count?, content } and artifacts { artifact, from? }), defaultTabs (ids open at the start and whenever the work area opens again after its last tab closed – "new" adds a New tab; default: every tab, or one New tab), initialTabs (when the start differs), artifacts (content by file name), onOpenArtifact, onArtifactChange, newTab ({ tools, sources, onOpen } for a New tab's start options, or false for no + and no New tabs) |
| panel | `ReactNode` |  | Plain content for the work area – it becomes its one tab, named by panelTitle; use workArea for more |
| panelTitle | `string` | `"Workspace"` | Name of the work area – the label of its tablist and its open / close buttons, and the title of a plain panel's tab |
| panelHeading | `ReactNode` |  | What the tab of a plain panel shows instead of panelTitle, e.g. "Brief / Summer launch" |
| defaultPanelOpen | `boolean` | `true` | Start with the work area folded away – its icon waits in the top right corner |
| panelWidth | `{ default?: number; min?: number; max?: number }` | `{ default: 360, min: 280, max: 560 }` | Width of the work area in px, like sidebarWidth. Up to a 1440px wide app these are the sizes; on wider screens the default and the max grow in proportion, so the work area keeps its share |
| layout | `"inset" \| "flat"` | `"inset"` | Inset: the page as a rounded panel on the gray page. Flat: edge to edge next to the sidebar, split by a hairline. Without it, data-shell="flat" on an ancestor (e.g. <html>) makes every App Shell flat |
| className | `string` |  | Extra class on the root |
| EmptyState | `{ title; text; action?; tall?; bare? }` |  | What a list or page shows when there's nothing in it: an icon tile, a title, one line on how to fill it and an optional button. Framed by default; bare without the frame when it's the page's only content |
| Spinner | `{ size?: number; label?: string; className? }` |  | One spinner for every screen – an arc on a faint ring in the text color (default 14px), for something that works right now. With label it's announced as a status; without it stays silent next to text that says what happens |
| Skeleton, Loading | `Skeleton { width?; height?; radius?; className? } · Loading { label?; className?; children }` |  | The loading state while a page's data comes in: Skeleton is a gray bar or shape a soft sheen sweeps across; Loading wraps the skeletons of one area (role="status", aria-busy) and fades in after 150ms, so a fast load never flashes. Give the skeletons the size of the text and shapes they stand in for, inside the real grid or list class, so nothing jumps when the data lands |
| useWorkArea(options) | `→ { open(name, from?), show(id), openNew(), artifact(name) }` |  | The work area's state in your screen – which tabs are open, the one in front, and every change to an artifact, kept by file name while the screen lives (close a tab and open it again: your edits are still there). open brings an artifact's tab to the front and opens the work area if it's folded; from is the line under its name. Inside the page useShellWorkArea() returns the same |
| ShellArtifact | `{ updated?; doc?; table?; sheet?; code?; image?; files?; preview? }` |  | What an artifact shows, by its kind. doc { title, paragraphs?, bullets?, html? } – a page you write in like Word; bullets starting with "[ ] " / "[x] " make a checklist. table – rows of strings, the first the header, a cell starting with = a formula (SUM, AVERAGE, MIN, MAX, COUNT, IF, ROUND …), with sheet { widths?, styles? } by "row:col" ({ bold?, format?: "general" | "number" | "percent" | "currency" }) – a sheet you work in like Excel. code – shown as is. image – gray blocks on a 120 × 80 grid. files – a folder you browse like Finder: names, or { name, size?, modified?, kind?, files? }; a name without an extension is a subfolder. preview – your own node |
| ArtifactChips | `{ names: string[]; onOpen: (name) => void }` |  | Artifacts as soft gray file chips with a glyph by type – e.g. a task's or a message's files |
| WorkspacePanel tools | `WorkspaceTool[]` | `Terminal, Browser, Notes` | Rows under Tools, each { id, label, icon, shortcut? } |
| WorkspacePanel sources | `WorkspaceSource[]` |  | Rows under Suggested, each { id, title, source, mark?, artifact? } – in a New tab, one with an artifact opens it in that tab (source is the line under its name) |
| WorkspacePanel onOpen | `(id: string) => void` |  | A tool or a suggestion was clicked |

### Keyboard

- ← → / Home / End: Work area tabs: one Tab stop – move between the tabs, the one you land on comes to the front
- Delete / Backspace: Close the focused tab – its neighbour comes to the front and takes the focus; closing the last one folds the work area away and the focus moves to its open button
- Enter / Space: On +: a New tab, focused
- ↑ ↓ ← → / Shift + arrows / ⌘ + arrows: Sheet: move the active cell, extend the selection, jump to the edge of the data
- Tab / Shift Tab / Enter / Shift Enter: Sheet: move right / left / down / up like Excel; Tab at the last column (Shift Tab at A) leaves the sheet
- Type / F2 / Enter / Esc: Sheet: typing replaces the cell, F2 or a double-click edits in place, Enter or Tab writes, Esc cancels; = starts a formula and a click on a cell adds its name
- ⌘A / ⌘C / ⌘X / ⌘V / ⌘Z / ⇧⌘Z / ⌘B / Delete: Sheet: select all, copy / cut / paste as tab-separated text, undo, redo, bold, clear the selection
- ⌘B / ⌘I / ⌘U / ⇧⌘X / ⌘E / ⌘K: Document: bold, italic, underline, strikethrough, inline code, link
- ⇧⌘7 / ⇧⌘8 / ⇧⌘9 / ⌘Enter / Tab: Document: numbered, bulleted and checklist; ⌘Enter ticks a checklist item; Tab / Shift Tab nest a list item; "# ", "- ", "1. ", "[ ] " or "> " at the start of a line format it
- ↑ ↓ / Shift ↑ ↓ / ⌘A / Enter / Space: Folder: move, extend, select all, open (a file in its own tab, a folder in place), Quick Look; type a name's start to jump to it
- ⌘[ / ⌘] / ⌘↑ / F2 / ⌘D / ⌘⌫ / ⇧⌘N / ⌘1 / ⌘2 / ⌘F: Folder: back, forward, up, rename, duplicate, move to trash, new folder, list / icons, search
- Shift F10 / Context menu key: The context menu on the active cell, the caret, the selected item, the code or the image; ↑ ↓ move, → opens a submenu, ← and Esc go back

### Accessibility

- The work area's tabs are a role="tablist" with a roving tabindex; each tab controls its role="tabpanel"; every × is labelled "Close <name>" and + is "New tab"
- The artifact toolbars are role="toolbar" with one Tab stop; the sheet a role="grid" with aria-activedescendant; the document a multi-line textbox; the folder a multi-select listbox; Quick Look a dialog; context menus role="menu" – every item with an icon, disabled ones aria-disabled
- Changes, sorts and formula results are announced in a polite live region
- Sidebar items, projects and the collapse toggle are real buttons with labels; folded to a rail, each icon names itself in a tooltip
- Icons are decorative and hidden from screen readers
- The edges are separators you can focus: arrow keys resize (Shift for bigger steps), Home and End jump to the minimum and maximum
- The work area is a labelled landmark; while it's folded away it's inert, and its icon in the top right brings it back

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 900px the work area becomes a drawer from the right, like the sidebar from the left – its tabs, toolbars and menus fit down to 320px
- The work area never scrolls sideways: tabs first narrow (92–156px, names fading out), then the strip scrolls inside itself; a wide sheet scrolls inside itself
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as
- Inset or flat for a whole app at once: data-shell="flat" on <html> – every screen built on App Shell follows

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
