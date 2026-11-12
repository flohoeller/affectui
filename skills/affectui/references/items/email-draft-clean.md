# Email Draft, clean style (Free)

Agent-written email for review – switch recipient and tone, edit inline, remove the attachment, send or discard with undo

- Page: https://www.affectui.com/components/email-draft
- Section: Components · Cards
- Install: `npx shadcn@latest add https://www.affectui.com/r/email-draft-clean.json`
- Import: `@/components/ui/email-draft-clean`

### When to use

- Human-in-the-loop flows where an agent drafts an email and someone approves it – renewals, reminders, follow-ups
- Inboxes or task lists of pending outreach, one card per record

### When not to use

- Writing long emails from scratch – use a full editor
- Messages that go out without review – then a simple activity row is enough

### Usage

```tsx
import { EmailDraft } from "@/components/ui/email-draft-clean";

export function RenewalReview() {
  return (
    <EmailDraft
      reference="SUB-1182"
      account="Northwind Logistics"
      amount="$8,900"
      status="Renews in 5 days"
      agent="Renewal agent"
      contacts={[{ name: "Jonas Weber", email: "jonas@northwind.io" }]}
      attachment="Renewal-quote.pdf"
      link={{ label: "Review quote", href: "/quotes/1182" }}
      onSend={(email) => api.send(email)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| reference | `string` | `"SUB-1182"` | Reference of the record the email is about |
| account | `string` | `"Northwind Logistics"` | Account or company under the reference |
| amount | `string` | `"$8,900"` | Amount on the right |
| status | `string` | `"Renews in 5 days"` | Status chip next to the reference |
| agent | `string` | `"Renewal agent"` | Who wrote the draft, shown in the last row of the card |
| contacts | `DraftContact[]` |  | People the email can go to – the first is preselected |
| attachment | `string \| null` |  | File name of the attachment; it can be removed and added back |
| tones | `DraftTone[]` |  | Text variants { id, label, body(contact) } – Friendly, Short and Formal by default |
| link | `{ label, href }` |  | Link appended to the email text |
| onSend | `({ to, body, attachment }) => void` |  | Called after Send with the final email |
| onDiscard | `() => void` |  | Called when the draft is discarded |
| className | `string` |  | Extra class on the root |

### Keyboard

- ⌘ / Enter: Sends the email while editing
- Esc: Leaves editing, or closes the recipient menu

### Accessibility

- The recipient is a button that opens a listbox; tones are toggle buttons with aria-pressed
- The text is a plain paragraph; clicking it or the pencil swaps in a labelled text field
- Sent and discarded states are announced as a status with an Undo button

### Motion

- Switching tone fades the new text in; the recipient menu scales in from its corner
- Sending shows a spinner, then the email folds into a one-line receipt – only the content glides to its new height, the last row stays put
- With prefers-reduced-motion changes happen instantly

### Responsive

- Fills its container up to 480px; on narrow screens the email address, the shortcut hint and the agent name hide
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
