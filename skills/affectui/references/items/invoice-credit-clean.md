# Invoice & Credit Note, clean style (Pro)

An invoice and its credit note stacked like paper – switch between them, pick lines to credit, adjust amounts and issue

- Page: https://www.affectui.com/blocks/invoice-credit
- Section: Blocks · Billing
- Install: `npx shadcn@latest add https://www.affectui.com/r/invoice-credit-clean.json` (needs the Pro access key)
- Import: `@/components/ui/invoice-credit-clean`

### When to use

- Billing portals and admin tools that show an invoice and let a team credit it
- Product pages for invoicing software – a document that looks real and can be tried

### When not to use

- Printing or PDF generation – render a dedicated print layout instead
- Invoices with dozens of lines – the credit list is built for a handful

### Usage

```tsx
import { InvoiceCredit } from "@/components/ui/invoice-credit-clean";

export function Billing() {
  return (
    <InvoiceCredit
      invoiceNo="INV-2041"
      creditNo="CN-0117"
      lines={[
        { id: "plan", name: "Growth plan", qty: 1, rate: 1250, tax: 0.2 },
        { id: "api", name: "API calls (per 1k)", qty: 18420, rate: 0.42, tax: 0.2, group: "Metered usage" },
      ]}
      onIssue={(credits, total) => api.issueCreditNote(credits, total)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| seller / buyer | `{ name, lines: string[] }` |  | From and To blocks on the invoice |
| invoiceNo / creditNo | `string` |  | Document numbers shown under Terms |
| invoiceDate / dueDate / period | `string` |  | Dates shown on both documents; an empty one leaves its line out |
| lines | `InvoiceLine[]` |  | Each { id, name, qty, rate, tax, group? } – lines with a group are listed under a heading. A negative rate is a discount; a rate that is not a number shows — and counts as 0 |
| currency | `string` | `"$"` | A symbol shown in front of amounts ("$", "£"), or an ISO code ("EUR", "JPY") formatted with Intl – the code is also shown after the applied total |
| onIssue | `(credits, total) => void` |  | Called when the credit note is issued, with the credited amount per line and the total incl. tax |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the switch (one stop), the actions, every line and amount
- ← / →: On the switch: moves between Invoice and Credit note
- Home / End: On the switch: jumps to Invoice or Credit note
- Space: Picks or drops a line to credit
- Enter: Confirms an amount
- Esc: In an amount: throws the typed amount away

### Accessibility

- The switch is a tablist with one tab stop and its sheets are tabpanels; buttons that send you to the other sheet move focus to its tab, and Issue and Edit hand focus to each other; the sheet in the back is hidden from screen readers and can't be focused
- Credit lines are checkboxes with labels; amounts are labelled per line and stay within the line total

### Motion

- Switching slides the sheets: the chosen one comes forward, the other tucks behind it with only its top edge showing
- Checkmarks draw in; the white chip glides between Invoice and Credit note
- With prefers-reduced-motion everything switches instantly

### Responsive

- Follows its own width: below 560px the parties stack, the rate and tax columns hide and the credit list drops the total column
- Clean look: single white sheets with hairline shadows and no tray, tiny uppercase labels, spacing instead of rules, one dark Issue button
- Touch screens get 36px buttons and fields and larger checkboxes
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
