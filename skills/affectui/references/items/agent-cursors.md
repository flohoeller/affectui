# Agent Cursors (Pro)

Agents working in a document like teammates in a multiplayer editor – live pointers with names, suggestions typed letter by letter, images they resize, code they fix and comments beside the page

- Page: https://www.affectui.com/components/agent-cursors
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-cursors.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-cursors-clean.json` (needs the Pro access key) – lands as `agent-cursors-clean.tsx`, import from `@/components/ui/agent-cursors-clean` – its docs: `agent-cursors-clean.md`
- Import: `@/components/ui/agent-cursors`

### When to use

- Agents that write or edit a document, a brief or a spec while you watch – text, images, code and comments – and you want to see who is where
- Several agents on one text at once: each change stays a suggestion in its agent's color until you accept it
- Making agent work feel like working with teammates – the same pointers people know from Figma or Google Docs

### When not to use

- One agent rewriting a reply – use Writing Assistant or Inline Diff
- Changes to code or files – use Inline Diff or Change Summary
- Who started which agent – use Agent Tree

### Usage

```tsx
import { AgentCursors, acceptSuggestion } from "@/components/ui/agent-cursors";

// One shared ink for all of them – their logos tell them apart (pass color to give one its own)
const agents = [
  { id: "research", name: "Researcher", avatar: <ClaudeLogo /> },
  { id: "writer", name: "Writer", avatar: <OpenAILogo /> },
];

export function Brief() {
  const [doc, setDoc] = useState({ blocks, suggestions: [] });
  // From your agents' stream: where each one is and what it does
  const cursors = {
    research: { block: "why", at: 24, select: 9, doing: "Checking the numbers" },
    writer: { block: "list", at: 31, doing: "Adding detail", typing: true },
  };

  return (
    <AgentCursors
      title="Launch brief"
      agents={agents}
      blocks={doc.blocks}
      suggestions={doc.suggestions}
      cursors={cursors}
      onAccept={(s) => setDoc((d) => acceptSuggestion(d.blocks, d.suggestions, s.id))}
      onReject={(s) => setDoc((d) => ({ ...d, suggestions: d.suggestions.filter((x) => x.id !== s.id) }))}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `CursorAgent[]` |  | { id, name, color?, avatar?, tint?, cost? } – everyone who can be in the document; without a color every agent shares one ink (near-black, light in dark mode) and the logos tell them apart |
| blocks | `DocBlock[]` |  | { id, kind?: "title" | "heading" | "paragraph" | "item" | "code" | "image", text?, … } – the document; consecutive items form one list. Images take width (0–1), ratio, float ("left" | "right" – the next text runs beside them), loading, src and alt; their text is the caption. Tables take rows of cell blocks (the first row is the header); a cell with a tone shows as a status pill |
| cursors | `Record<string, AgentCursor \| null>` |  | Per agent: { block, at?, in?, select?, point?, doing?, typing? } – where it is (a block or a comment), a selected passage or a held image, the corner or middle of an image, what it's doing (on its flag) and whether it types; null or missing means it left |
| comments | `DocComment[]` |  | { id, agent, block, at?, x?, y?, text, open? } – comment pins on the page: on a character of the block (at), or at its top edge x along the page (0–1); y moves it down; open keeps the window open (e.g. while the agent writes), otherwise a dark round pin with the agent's mark that grows into the window on hover |
| onResolveComment | `(comment: DocComment) => void` |  | The black check in a comment's window – remove it from your list |
| onReply | `(comment: DocComment, text: string) => void` |  | Shows a reply field in the window; Enter sends |
| height | `number` |  | A fixed page height in px – the rest of the document fades out towards the bottom |
| tabs / tab / onTabChange | `{ id, label }[] / string / (id) => void` |  | Tabs above the page – the open one white with a stroke; you switch the blocks and agents |
| agents[].cost | `number` |  | Per agent: what it has cost so far – a small tag on its flag, the total in the header |
| agents[].tint | `string` |  | Per agent: the fill of its face while you follow it – defaults to a light wash of its color |
| formatCost | `(amount: number) => string` | `dollars, e.g. "$0.42"` | Formats every cost |
| suggestions | `DocSuggestion[]` | `[]` | { id, agent, block, at, remove?, insert?, note? } – changes waiting for you: removed text is struck through, new text underlined, both in the agent's color |
| onAccept / onReject | `(suggestion: DocSuggestion) => void` |  | From the window that opens on a suggestion – acceptSuggestion() writes one into your blocks |
| onAcceptAll | `() => void` |  | Shows "Accept all" in the header when there is more than one suggestion |
| following / onFollowingChange | `string \| null` |  | The agent you follow, controlled or uncontrolled – the other pointers and selections fade back |
| title | `string` | `"Untitled"` | The document's name in the header |
| className | `string` |  | Extra class on the root |
| acceptSuggestion | `(blocks, suggestions, id) => { blocks, suggestions }` |  | Helper: writes a suggestion into the text and moves the other suggestions in that block along |

### Keyboard

- Tab: Moves to the faces in the header, then from suggestion to suggestion – a focused suggestion opens its window
- Enter / Space: On a face: follow that agent, or stop following
- Esc: Closes the window of a suggestion

### Accessibility

- The text is real text in headings, paragraphs and a list – pointers, carets and selections are decoration and hidden from screen readers
- Every suggestion is focusable and labelled, e.g. "Researcher suggests adding: 38%"; its window is a dialog with Accept and Reject buttons
- The faces are toggle buttons (aria-pressed) named after the agent and what it is doing; a followed face fills with its tint
- New suggestions are announced politely, with the agent's note

### Motion

- Pointers glide to their next place; a new one pops in where it lands, one that leaves fades out where it was
- Images are gray with a light shimmer running across while they load, then fade in; a held image resizes smoothly while the pointer stays on its corner handle
- A comment pin grows into its window on hover and folds back into it – the agent's mark stays and slides to the corner
- While an agent types, its caret holds still and the pointer follows every letter
- What an agent is doing slides out next to its name on the flag
- Selected passages fade in behind the text in the agent's color; new suggestions fill in softly
- While an agent is in the document, an arc in its color runs around its face, fading in from nothing – like a loader
- Switching tabs fades the new view in; table rows an agent adds slide in
- With prefers-reduced-motion everything moves at once

### Responsive

- Every position is measured from the page itself, so any width, font size or zoom works – the pointers stay on their letters while the text wraps
- Comment windows open towards the bottom right – towards the left near the right edge, upwards near the bottom
- Flags always sit to the bottom right of their pointer; near the right edge they are cut off rather than moved
- Below 520px the page gets tighter margins and the suggestion count in the header gives way to the faces
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Offsets are character indexes into the block's current text – after accepting a suggestion, use the text that acceptSuggestion returns
- A cursor inside a suggestion (in: id) counts its offset in that suggestion's insert text
- Pass new cursors as your agents stream – the component animates between any two states, it doesn't need every step
- Flags and comment pins are dark cards with a pink-to-blue bottom edge (--ui-acu-flag, --ui-acu-edge); in dark mode they turn light
- The pointer is the soft, rounded arrow from the affectUI videos, filled in the agent's color

### Requirements

- React 19

Related: writing-assistant, inline-diff, agent-tree, comment-thread
