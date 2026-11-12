# Decision Inbox, clean style (Free)

Open decisions with two quick answers each – answered ones confirm and fold away

- Page: https://www.affectui.com/components/decision-inbox
- Section: Components · Feedback
- Install: `npx shadcn@latest add https://www.affectui.com/r/decision-inbox-clean.json`
- Import: `@/components/ui/decision-inbox-clean`

### When to use

- Dashboards or agents that need a quick yes / no from a person before they continue
- Approvals, renewals and alerts that can be answered with one click

### When not to use

- Decisions that need a form or a longer explanation – link to a page instead
- Plain notifications without an answer – use a toast or an activity list

### Usage

```tsx
import { DecisionInbox } from "@/components/ui/decision-inbox-clean";

const decisions = [
  {
    id: "renewal",
    title: "Renew Figma for the design team?",
    detail: "12 seats · $1,800 per year · renews in 5 days",
    primary: "Renew",
    secondary: "Change seats",
  },
];

export function Inbox() {
  return <DecisionInbox decisions={decisions} onDecide={(d, answer) => save(d.id, answer)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| decisions | `Decision[]` |  | id, title, detail, primary and secondary answer, and collapsed to start folded |
| onDecide | `(decision, answer: "primary" \| "secondary") => void` |  | Called when someone picks an answer |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Move between the answers and folded decisions
- Enter / Space: Pick an answer or open a folded decision

### Accessibility

- The heading with the count is a live region, so the new count is announced
- The confirmation after an answer is a status message; folded-away rows are inert

### Motion

- An answer turns into a green confirmation, then the row folds away and the next folded decision opens
- Reduced motion skips the folding

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: change-summary, setup-guide
