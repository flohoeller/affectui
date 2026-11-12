# Approval Card (Pro)

An agent asks before it acts – risk badge, preview, Approve and Deny with shortcuts, a pausing countdown, and a smooth morph into a resolved row

- Page: https://www.affectui.com/components/approval-card
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/approval-card.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/approval-card-clean.json` (needs the Pro access key) – lands as `approval-card-clean.tsx`, import from `@/components/ui/approval-card-clean` – its docs: `approval-card-clean.md`
- Import: `@/components/ui/approval-card`

### When to use

- An agent is about to do something hard to undo – send email, delete files, spend money, deploy – and a person should say yes first
- Human-in-the-loop tool calls in a chat or an agent run log, one card per pending call
- Requests that should expire on their own when nobody answers

### When not to use

- Many pending requests at once that people triage in bulk – use Decision Inbox
- Harmless, reversible actions – just do them and offer undo
- Destructive actions the user triggered themselves – a regular confirm dialog fits better

### Usage

```tsx
import { ApprovalCard } from "@/components/ui/approval-card";

export function SendApproval({ call }: { call: PendingToolCall }) {
  return (
    <ApprovalCard
      title="Send campaign email"
      description="October product update · Newsletter"
      risk="medium"
      details={[
        { label: "To", value: "Customers – EU (42)" },
        { label: "Subject", value: "What's new in October" },
        { label: "Send", value: "Today, 9:00 AM" },
      ]}
      expiresIn={60}
      onApprove={({ always }) => call.approve({ always })} // return the promise – the button shows a spinner
      onDeny={({ reason }) => call.reject(reason)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | The action, e.g. "Send campaign email" – also the card's accessible name |
| description | `ReactNode` |  | One line of context below the title; truncates |
| risk | `"low" \| "medium" \| "high"` |  | Tinted badge in the header (gray, amber, red); leave out to hide it |
| icon | `ReactNode` | `shield` | Icon in the 32px header tile; SVGs get a 16px stroke style |
| details | `{ label: string; value: ReactNode }[]` |  | Key-value rows in the preview panel |
| preview | `ReactNode` |  | Custom content above the details, e.g. recipients or a diff – children work the same |
| children | `ReactNode` |  | Used as the preview when preview isn't set |
| status | `"pending" \| "approved" \| "denied"` |  | Controlled status; setting it back to "pending" starts a fresh request |
| defaultStatus | `"pending" \| "approved" \| "denied"` | `"pending"` | Starting status when uncontrolled |
| onApprove | `({ always }) => void \| Promise` |  | Called on Approve or ⌘/Ctrl+Enter. Return a promise to show a spinner and lock the card; a rejection keeps it pending |
| onDeny | `({ reason: "user" \| "timeout" }) => void` |  | Called on Deny, Escape, or when the countdown runs out |
| onEdit | `() => void` |  | Shows an Edit button before Deny |
| expiresIn | `number` |  | Seconds until the request expires; shown as quiet "Expires in 0:42" text in the tray next to the buttons, amber in the last 10 seconds, paused while hovered or focused |
| onExpire | `() => void` |  | Called when the countdown runs out, right before onDeny({ reason: "timeout" }) |
| allowAlways | `boolean` | `true` | Show the "Always allow this action" checkbox |
| alwaysLabel | `string` | `"Always allow this action"` | Label of the checkbox |
| approveLabel | `string` | `"Approve"` | Primary button label |
| denyLabel | `string` | `"Deny"` | Quiet button label |
| editLabel | `string` | `"Edit"` | Edit button label |
| shortcuts | `boolean` | `true` | Show the ⌘↵ / Esc hints on the buttons – the shortcuts work either way |
| label | `ReactNode` |  | Small label on the gray tray above the card, e.g. "Step 4 · gmail.send" |
| actions | `"tray" \| "card"` | `"tray"` | Where the buttons sit: on the gray tray below the card, or inside the white card (handy in narrow side panels next to other cards) |
| className | `string` |  | Extra class on the root |

### Keyboard

- ⌘ / Enter: Approve while focus is anywhere in the card (Ctrl+Enter on Windows and Linux)
- Escape: Deny while focus is in the card
- Tab: Moves through the checkbox, Edit, Deny and Approve

### Accessibility

- role="group" named by the title and described by the description and the countdown
- Real buttons with aria-keyshortcuts; the kbd hints are aria-hidden
- The decision is announced through a polite live region ("Approved: Send campaign email")
- The countdown has a full text description ("Expires in 24 seconds unless approved…") linked via aria-describedby; the visible clock is aria-hidden so it isn't read every second, and it pauses while the card is hovered or focused
- While an approval is processing the card is aria-busy and the buttons are aria-disabled, so focus is never lost
- After a decision focus moves to the resolved row (tabIndex -1) if it was inside the card

### Motion

- On a decision the card and its tray footer fade and blur out, the height glides down to a compact row inside the tray and the check or cross draws itself in
- The countdown text ticks down once per second without animation and turns amber in the last 10 seconds
- Buttons press in slightly; the checkbox tick scales in
- With prefers-reduced-motion everything switches instantly and only the spinner keeps turning slowly

### Responsive

- Fills its container; below 400px card width the buttons share a full-width row and the shortcut hints hide
- Below 340px the risk badge drops the word "risk" and the resolved row drops its time
- Titles, descriptions and detail values truncate instead of wrapping; works down to 320px
- Shortcut hints are hidden on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Render one card per pending tool call that needs consent; resolve the tool call with the onApprove / onDeny result
- Return the real execution promise from onApprove so the card stays locked until the action has actually started
- Persist { always: true } per tool name and skip the card next time
- Set risk from the action, not the model's confidence: anything external, paid or irreversible is at least medium
- Keep title an imperative verb phrase and put the concrete values (recipients, amount, target) in details

### Requirements

- React 19

Related: tool-call-card, decision-inbox, thinking-state, thinking-loader
