# Agent Trail, clean style (Pro)

The steps an agent works through, as one quiet trail – a header with the task and "3/5", done ones with a check and their time, the one it is on says what it is doing and branches into its sub-steps with a live timer, a step that needs approval waits with a dashed ring; a short fading light runs down the trail into the sub-step it is on

- Page: https://www.affectui.com/components/agent-trail
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-trail-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-trail-clean`

### When to use

- Showing where an agent is in a task while it runs – what's done, what it is doing right now and what comes next
- A chat answer, a side panel or a task card that should show the agent's steps without a full trace
- Plans with a step that needs approval – merging, sending, paying – so people see the stop coming

### When not to use

- Reviewing or editing a plan before it runs – use Agent Plan
- Timing and cost of every call in a run – use Trace Waterfall or Cost Waterfall
- The decision itself, when a step waits – use Approval Card or Decision Card

### Usage

```tsx
import { AgentTrail, type TrailStep } from "@/components/ui/agent-trail-clean";

const steps: TrailStep[] = [
  { id: "read", title: "Read the bug report", state: "done", duration: 8000 },
  { id: "repro", title: "Reproduce the crash", state: "done", duration: 34000 },
  {
    id: "patch",
    title: "Patch the checkout form",
    state: "running",
    status: "Testing",
    startedAt: Date.now(),
    substeps: [
      { title: "Found the empty-cart case", detail: "cart.ts:142" },
      { title: "Added a guard and 2 tests", detail: "+18 −3" },
      { title: "Running the test suite", detail: "182/214", state: "running" },
    ],
  },
  { id: "notes", title: "Write the release note", state: "pending" },
  { id: "pr", title: "Open a pull request", state: "pending", gate: true },
];

export function Progress() {
  return <AgentTrail title="Fix the checkout crash" steps={steps} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `TrailStep[]` |  | { id, title, state, duration?, status?, startedAt?, gate?, substeps? } – in the order the agent walks them |
| title | `string` |  | The task, in a header over the trail with how many steps are done – "3/5". Leave it out for no header |
| agent | `{ name: string; logo?: ReactNode }` |  | Who works on it – the agent or model's logo and name in the header, before the count |
| state | `"done" \| "running" \| "pending" \| "waiting" \| "failed" \| "declined"` |  | Per step – done shows a tinted check and its time, running a spinning ring with its status, waiting an orange disc with a pause and Needs you, failed a red mark, declined (you said no at Needs you) a quiet gray dash with its title struck through |
| duration | `number \| string` |  | How long a done step took – ms as a number (12s, 1m 4s, 1h 2m, 3d 4h), or your own text |
| status / startedAt | `string / number` |  | What a running step does right now, shimmering – "Testing" – and when it started (Date.now()) for a live timer next to it |
| gate | `boolean` |  | Needs approval before it runs – a dashed orange ring and "Approval" until it is reached, then "Needs you" while state is waiting |
| tool | `{ logo: ReactNode; name: string }` |  | Per step – the tool or system it works in (GitHub, Linear, Notion …); its 14px logo sits before the title, faded while the step is still to come |
| substeps | `{ id?, title, state?, detail? }[]` |  | What the agent does inside a step – state done (default), running or pending, and a short fact on the right (long ones keep their end: "src/…Wrapper.tsx:1284"). The light runs to the running one; more than six fold to five around it with "+N earlier" and "+N more" |
| expanded / onExpandedChange | `string[] / (ids) => void` |  | Which steps show their sub-steps. By default the running one opens, the rest open with a click |
| onApprove | `(step: TrailStep) => void` |  | A waiting step was approved – with this (or onDecline) "Needs you" becomes a button that opens Approve and Decline under the row |
| onDecline | `(step: TrailStep) => void` |  | A waiting step was declined – update its state in your data to declined |
| ask | `string` |  | Per step – what a waiting step asks you to approve, shown above Approve and Decline: "Open PR #482 against main – 3 files, 214 tests passing" |
| labels | `Partial<AgentTrailLabels>` |  | Every word: title (the list's name without a header), running, approval, waiting, failed, declined, done, pending, empty (no steps – "No steps yet"), untitled (a step without a title), earlier / more / fewer (the rows that fold long sub-step lists), approve / decline (the two answers to Needs you) |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Keyboard

- Tab: Moves to each step that has sub-steps
- Enter / Space: Opens or closes its sub-steps
- Tab / Enter: On "+N earlier" or "+N more": shows every sub-step; "Show fewer" folds them again – focus stays on the row
- Enter: On "Needs you": opens Approve and Decline – focus lands on Approve
- Esc: Closes the answer panel and returns to "Needs you"

### Accessibility

- An ordered list named after the task; the running step and sub-step carry aria-current="step"
- The header count reads "3 of 5 steps done"
- Each step reads its title, state and time – "Read the bug report – Done, 8s"; a step with sub-steps is a button with aria-expanded
- Closed sub-steps are inert, so the keyboard and screen readers skip them
- A step that loses its sub-steps while focused keeps the focus; times, badges and status read in their own direction, so "<1s" stays "<1s" in right-to-left pages
- A polite live region says when a step finishes, fails or waits for you
- Focus rings show for the keyboard only (:focus-visible), in light and dark

### Motion

- A short light – full at the front, fading to nothing at the back – runs from the running step down its branch into the sub-step it is on, and that dot rings once as it arrives
- The running marker's arc goes round, its status shimmers and the timer counts up
- A finished step's check pops in and draws itself; the line to the next step fills
- Sub-steps fold open and closed, the branch line follows
- With prefers-reduced-motion everything changes at once and the light stays off

### Responsive

- Rows are fixed – 32px for a step, 24px for a sub-step, 40px and 28px on touch screens – so a changing status, timer or detail never moves another row
- Long sub-step lists fold to five rows around where the agent is, so the card and the light stay short
- No steps: the header stays and a quiet "No steps yet" takes the list's place; a missing title reads "Untitled step"
- Long titles end in … with the full text on hover; the right side never takes more than 40% of the row, so the title keeps its room
- Right-to-left: the trail moves to the right edge and the branch bends the other way
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every step a stable id – opening, closing and the live region track steps by it
- Keep status to one word in the present – "Testing", "Writing"
- Sub-step titles say what happened – "Found the empty-cart case" – and detail a short fact: a file, a diff, a count
- Only one step should be running; the light goes to its running sub-step
- Colors are variables on .ui-atrc – --ui-atrc-accent and --ui-atrc-wash set the trail, --ui-atrc-loop the light's speed

### Requirements

- React 19

Related: agent-plan, agent-monitor, thinking-state, approval-card
