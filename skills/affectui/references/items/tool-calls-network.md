# Tool Calls Network (Pro)

Every LLM and tool call of an agent run as rows, like the Network tab of the browser's developer tools – status, name with the tool's logo, the agent that made it, size and time, and a small waterfall where each call is a bar on the run's timeline, split into queued, waiting for the first token, streaming and tool execution. New calls stream in at the bottom while running bars grow at the "now" edge; drag across the overview strip for a stretch of time, filter by LLM, tools, errors or retries, sort like DevTools, and open a call for its request and response as pretty JSON, its timing phase by phase and every retry

- Page: https://www.affectui.com/components/tool-calls-network
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/tool-calls-network.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/tool-calls-network-clean.json` (needs the Pro access key) – lands as `tool-calls-network-clean.tsx`, import from `@/components/ui/tool-calls-network-clean` – its docs: `tool-calls-network-clean.md`
- Import: `@/components/ui/tool-calls-network`

### When to use

- Debugging an agent run call by call – every LLM and tool call as a row, like the Network tab of the browser's developer tools
- Finding the slow, failed or retried calls: filter to errors or retries, sort by time or size, and open one for its request and response
- Watching a run live – new calls stream in at the bottom and the waterfall follows the leading edge while it runs

### When not to use

- Who called whom, as a tree of spans – use Trace Waterfall or Agent Flame Graph
- Which steps set the run's total time – use Critical Path
- A single tool call in a chat – use Tool Call Card

### Usage

```tsx
import { ToolCallsNetwork, type NetworkCall, type NetworkAgent } from "@/components/ui/tool-calls-network";

const agents: NetworkAgent[] = [
  { id: "planner", name: "Planner" },
  { id: "researcher", name: "Researcher" },
];

const calls: NetworkCall[] = [
  {
    id: "c1", agent: "planner", kind: "llm", name: "claude-opus-5.5", detail: "plan the release", icon: <ClaudeLogo />,
    status: "done", start: 0, end: 7400, phases: { queued: 120, waiting: 1400 }, tokensIn: 4210, tokensOut: 1850, code: 200,
    request: { model: "claude-opus-5.5", messages: [/* … */] }, response: { stop_reason: "end_turn" },
  },
  {
    id: "c2", agent: "researcher", kind: "tool", name: "github.search_code", detail: "round( in billing/", icon: <GitHubLogo />,
    status: "running", start: 19100, phases: { queued: 50 }, request: { q: "round( path:billing/" },
  },
];

export function Run({ now }: { now: number }) {
  return <ToolCallsNetwork title="Ship v2.4 – tool calls" calls={calls} agents={agents} now={now} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| calls | `NetworkCall[]` |  | Every call – { id, name, detail?, kind, status, agent, start, end?, phases?, tokensIn?, tokensOut?, bytes?, code?, icon?, request?, response?, error?, retries? } |
| kind / status | `"llm" \| "tool" / "queued" \| "running" \| "done" \| "failed"` |  | LLM calls are tinted indigo, tool calls teal, failures red; a running call grows at the live edge |
| start / end | `number` |  | ms from the start of the run – leave end out while the call runs |
| phases | `{ queued?: number; waiting?: number }` |  | Queued ms and the wait for the first token (LLM) – the rest is streaming or tool exec |
| request / response | `unknown` |  | An object or a string – JSON strings are pretty-printed, big bodies show their start with a Show all button |
| retries | `NetworkAttempt[]` |  | Earlier attempts, oldest first – { start, duration, code?, error? } |
| agents | `NetworkAgent[]` |  | { id, name, color? } – the pixel mark's color defaults to blue for the first agent, then a palette |
| now | `number` |  | The clock in ms from the start of the run – e.g. a faster one for a demo |
| startedAt | `number` |  | Epoch ms – without now the component keeps its own clock while anything runs |
| live | `boolean` |  | Whether the run still goes – defaults to true while a call is queued or running |
| openId / defaultOpenId / onOpenChange | `string \| null / (id, call?) => void` |  | The call whose details are open – controlled or not |
| rows | `number` |  | How many rows show before the list scrolls – 12 by default; the height stays fixed |
| title | `string` |  | Names the list for screen readers |
| className | `string` |  | An extra class on the root |

### Accessibility

- The list is a treegrid with one row in the tab order – ↑ ↓, PgUp PgDn, Home and End move; Enter or Space opens the details
- With the details open the arrows keep moving and the details follow; Esc closes them and focus goes back to the row
- The details' tabs move with ← → Home End; the request and response blocks can be focused and scrolled, each with a Copy button
- The filters are a radio group – one tab stop, the arrows pick; the column heads are buttons with aria-sort
- The overview strip takes the keyboard too: an arrow picks a time range, arrows move it, Shift and an arrow resize it, Esc clears it
- Every row reads as one line – "browser.open staging.acme.dev, Tool call by Test Runner, Failed 401, 1.4s"
- A focus ring shows only for the keyboard; the search field has none – its edge firms up instead
- The phases' legend is a tooltip on the Waterfall head – on hover and keyboard focus

### Motion

- New calls slide in at the bottom and their bars grow in; the list follows the newest call unless you scrolled up
- A running bar has a sweeping sheen and a glowing leading edge; running names and times shimmer
- While the run is live the waterfall follows its last ~36 seconds and slides along with "now"; a finished run, a time range or a re-sort eases over
- The details slide in from the right; rows glide to their place when sorted
- An agent's pixel mark twinkles while one of its calls runs
- The classic style has a rounder card with a hairline border, pill-shaped filters, search, chips and badges and firmer headings – the same behavior as the clean one
- Reduced motion turns all of it off

### Responsive

- Fills its container's width and never scrolls sideways; the list's height is fixed, so nothing jumps while calls stream in
- Narrower than 700px the agent column goes; narrower than 520px the size column too, the search gets its own row and the details take the whole width
- On a phone the footer keeps its marks and numbers on one line and "Live" becomes its dot
- Only the rows in view are drawn – 500 calls scroll as smoothly as 20
- Long names end in … with the full name on hover; big numbers shorten to 182.4K, 2.4B, 990 TB and are never cut
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- One NetworkCall per LLM completion or tool invocation, with times relative to the run's start
- Give LLM calls the model as the name and what it was for as the detail; tool calls the tool's full name, e.g. github.search_code
- Set waiting from time to first token when you have it – it is what makes slow models stand out
- Keep request and response as the real payloads – they're pretty-printed; put a short human sentence in error

### Requirements

- React 19

Related: trace-waterfall, agent-flame-graph, critical-path, tool-call-card
