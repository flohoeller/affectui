# Tree View (Free)

A nested list of folders and files or any hierarchy – branches that open with a chevron and grow in height, indent guides, one selected row, icons and quiet meta, arrow keys and type-ahead as in the WAI-ARIA tree

- Page: https://www.affectui.com/components/tree-view
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/tree-view.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/tree-view-clean.json` – lands as `tree-view-clean.tsx`, import from `@/components/ui/tree-view-clean` – its docs: `tree-view-clean.md`
- Import: `@/components/ui/tree-view`

### When to use

- Folders and files: an agent's workspace, a repository, a knowledge base, the outputs of a run
- Any hierarchy you browse and pick one item from: projects and their chats, a docs outline, nested categories
- A side panel next to a viewer – the selected row decides what the viewer shows (onSelect)

### When not to use

- Who started whom in an agent run, with status and cost per agent – use the Agent Tree
- Rows with many columns, sorting or several selected at once – use the Data Table
- Where you are in a hierarchy, shown in a header – use the Breadcrumb
- A flat list of choices – use the Select, the Dropdown Menu or the Command Menu

### Usage

```tsx
import { useState } from "react";
import { TreeView, type TreeNode } from "@/components/ui/tree-view";

const files: TreeNode[] = [
  {
    id: "prompts",
    label: "prompts",
    icon: <FolderIcon />,
    openIcon: <FolderOpenIcon />,
    children: [
      { id: "prompts/system", label: "system.md", icon: <FileIcon /> },
      { id: "prompts/tools", label: "tools.md", icon: <FileIcon /> },
    ],
  },
  { id: "agent", label: "agent.yaml", icon: <CodeIcon />, meta: "2 KB" },
];

export function Workspace({ onOpen }: { onOpen: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <TreeView
      aria-label="Workspace"
      items={files}
      defaultExpanded={["prompts"]}
      selected={selected}
      onSelect={(id, node) => {
        setSelected(id);
        if (!node.children) onOpen(id);
      }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `TreeNode[]` |  | { id, label, icon?, openIcon?, meta?, disabled?, children? } – ids must be unique in the whole tree; any children list (even an empty one) makes a branch |
| expanded | `string[]` |  | Controlled: the ids of the open branches |
| defaultExpanded | `string[]` | `[]` | Uncontrolled: the branches open at the start |
| onExpandedChange | `(expanded: string[]) => void` |  | Called with the new list of open ids when a branch opens or closes |
| selected | `string \| null` |  | Controlled: the id of the selected row |
| defaultSelected | `string \| null` | `null` | Uncontrolled: the row selected at the start |
| onSelect | `(id: string, node: TreeNode) => void` |  | A row was picked – a click, Enter or Space; folders too (a click on a folder also opens or closes it, its chevron only opens or closes) |
| guides | `boolean` | `true` | Thin vertical lines under each open branch; the one around the selected row is darker |
| emptyText | `string` | `"Empty"` | Shown inside an open branch without children |
| aria-label | `string` |  | Names the tree – or use aria-labelledby |
| className | `string` |  | Extra class on the root <ul>; give a parent a height and overflow: auto to scroll a long tree |

### Keyboard

- Tab: Focuses the tree once – the row last used, else the selected one, else the first
- ↓ / ↑: Next or previous row you can see; disabled rows are skipped
- →: Opens a closed branch; on an open one, goes to its first child (← in right-to-left pages)
- ←: Closes an open branch; otherwise goes to the parent (→ in right-to-left pages)
- Home / End: First or last row you can see
- Enter: Selects the row – on a branch it also opens or closes it, like a click
- Space: Selects the row, nothing else
- *: Opens every branch next to the focused row
- a–z: Jumps to the next row whose name starts with what you type; the same letter again steps on

### Accessibility

- The WAI-ARIA tree pattern: role="tree", each row a treeitem with aria-level, aria-posinset, aria-setsize and aria-expanded on branches, children in a role="group"
- One selected row with aria-selected; disabled rows have aria-disabled and are skipped by the arrow keys
- One tab stop for the whole tree (roving tabindex) – the arrow keys move inside it
- Each row is named by its label only; meta is its description, so a screen reader says "report.md, 12 KB" without the children
- Closed branches are hidden from screen readers and the keyboard; if a branch closes around the focused row, the focus moves up to it
- The ring shows only under keyboard focus (:focus-visible), inside the row, never around the open branch below

### Motion

- A branch grows and shrinks in height (220ms), its chevron turns with it
- With prefers-reduced-motion branches open and close at once

### Responsive

- One line per row: long names end in … with the full name on hover; meta takes at most 45% of the row
- Deep levels indent 18px each, but never past 45% of the width – names stay readable in a narrow panel
- Touch screens get rows at least 40px tall
- Right-to-left: the indent, guides and chevron flip, and ← / → swap
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: agent-tree, data-table, breadcrumb, dropdown-menu, command-menu
