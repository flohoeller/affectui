# Decision Table, clean style (Pro)

An agent deciding by a DMN decision table – the request on top with its values, the rules below with inputs and outputs on either side of a quiet divider and the hit policy in the corner. When a request comes in, the agent checks the rules row by row: every cell ticks or crosses, the value being checked lights up in the request, rules that fail fade back, and the rule that matches lights up with its outputs – what it decides and where the request goes next. Click a rule for every condition against the request

- Page: https://www.affectui.com/components/decision-table
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/decision-table-clean.json` (needs the Pro access key)
- Import: `@/components/ui/decision-table-clean`

### When to use

- An agent that decides by business rules – refunds, approvals, routing, pricing – and should show exactly why
- Making a policy auditable: every condition is visible, and every decision points at the rule that made it
- Next to a process diagram (Handoff Swimlanes) as the decision behind one of its diamonds – the DMN partner of BPMN

### When not to use

- A branching path the agent took step by step – use Decision Tree
- A single decision a person has to make – use Decision Card or Approval Card
- Routing traffic between models – use Model Router

### Usage

```tsx
import { DecisionTable, type DecisionInput, type DecisionOutput, type DecisionRule } from "@/components/ui/decision-table-clean";

const inputs: DecisionInput[] = [
  { id: "amount", label: "Amount", type: "number", format: (v) => `$${v}` },
  { id: "tier", label: "Tier", type: "string" },
  { id: "days", label: "Days", type: "number" },
];
const outputs: DecisionOutput[] = [{ id: "decision", label: "Decision" }];

const rules: DecisionRule[] = [
  { id: "r1", when: { amount: "> 500" }, then: { decision: { text: "Review", tone: "warn" } } },
  { id: "r2", when: { tier: '"Gold", "Platinum"', days: "<= 60" }, then: { decision: { text: "Approve", tone: "ok" } } },
  { id: "r3", when: {}, then: { decision: { text: "Reject", tone: "bad" } }, note: "Anything else" },
];

export function Refunds({ request }) {
  return <DecisionTable name="Refund approval" hitPolicy="F" inputs={inputs} outputs={outputs} rules={rules} request={request} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` |  | The decision's name, in the head |
| inputs | `DecisionInput[]` |  | The input columns – { id, label, type?, format?, width? }. format turns a request's value into its chip text; width is the column's weight against the others (default 1) |
| outputs | `DecisionOutput[]` |  | The output columns, right of a quiet divider (where DMN draws its double rule) – { id, label, width? } |
| rules | `DecisionRule[]` |  | One row per rule – { id, when, then, note? }. when maps input ids to DMN conditions (a missing one is "-", anything); then maps output ids to text or { text, tone?, logo? } – tone ok, warn, bad or info makes a badge |
| hitPolicy | `"U" \| "F" \| "P" \| "A" \| "C"` |  | Unique, First, Priority, Any or Collect – shown in the corner. F stops at the first rule that matches; the others check every rule and show each match. Default F |
| request | `DecisionRequest` |  | The request being decided – { id, name, photo?, source?, detail?, values }. A new id starts the check |
| agent | `{ id, name }` |  | The agent that decides – its pixel mark twinkles while it checks |
| version | `string` |  | A small tag beside the name – "v3" |
| history | `DecisionRequest[]` |  | Earlier requests as faces in the foot – with onPick, a click checks one again |
| onPick | `(requestId: string) => void` |  | Called when a face in the foot is clicked |
| onDecide | `(ruleIds: string[]) => void` |  | Called once a check is finished, with the rules that matched |
| pace | `number` |  | Milliseconds per rule while checking – default 420 |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-dmnc-blue |

### Keyboard

- Tab: One stop for the rules, then the faces in the foot
- ↑ / ↓: The rule before or after
- Home / End: The first or the last rule
- Enter / Space: Opens the rule's card – every condition against the request; Esc closes it

### Accessibility

- The rules are a table with column headers; each rule reads its number and whether it matched
- Every checked cell reads true, false or unknown; the rule's card lists each condition with the request's value
- A polite live region says which rule is being checked and which one matched
- Focus rings show for the keyboard only (:focus-visible)

### Motion

- Each rule is checked in turn – its cells tick or cross one after another while the value being checked lights up in the request
- A rule stops at its first cell that fails and fades back; the one that matches gets a light sweeping across it and its outputs pop in
- With prefers-reduced-motion the result simply shows

### Responsive

- Below 800px the notes column steps aside – each rule's card still shows its note
- Narrow: the request's chips wrap under the person, and the table scrolls sideways inside its frame
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Write conditions the DMN way – "-", "< 50", "[50..500]", '"Gold", "Platinum"', 'not("Basic")' – the table evaluates them itself
- Put a catch-all rule last ({} as when) with hit policy F, so every request ends somewhere
- Give a new id for each request; the same id doesn't check again

### Requirements

- React 19

Related: decision-tree, handoff-swimlanes, approval-card, model-router
