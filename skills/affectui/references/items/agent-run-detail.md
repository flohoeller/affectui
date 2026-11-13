# Agent / Run Detail (Pro)

One agent run, step by step – thinking, tool calls with their app's logo, sub-agents and failures as tinted bars on one time axis that grow while it runs, live time, cost and tokens on top, and each step on the right with what went in and what came out

- Page: https://www.affectui.com/screens/agent-run-detail
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-run-detail.json` (needs the Pro access key)
- Import: `@/components/ui/agent-run-detail`

### When to use

- Showing what an agent did in one run – which steps, in which order, how long each took and what it cost
- Following a run live as it happens, and stopping it
- Finding the step that failed or was slow, and seeing exactly what went in and came out

### When not to use

- Every run of an agent over time – use Agent / Activity or Usage
- Many agents working at once – use Agent / Orchestration
- A trace as a component on its own – use Trace Waterfall

### Usage

```tsx
import { AgentRunDetailScreen } from "@/components/ui/agent-run-detail";

export default function Page({ run, elapsed }) {
  return (
    <AgentRunDetailScreen
      run={run}                  // the steps with start and duration in seconds
      elapsed={elapsed}          // while it runs: seconds since it started – bars grow, numbers count
      onStop={() => api.stop(run.id)}
      onRerun={() => api.rerun(run.id)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| run | `{ id; title; agent: { id; name; color }; model; startedAt; total?; steps: { id; label; kind: "llm" \| "tool" \| "agent"; start; duration?; depth?; app?; agent?; failed?; error?; tokens?: { in; out }; cost?; input?; output? }[] }` |  | The run. start and duration are seconds from the start; a step without a duration is still running. app shows its logo before a tool call, agent the sub-agent's pixel mark; depth 1 puts a step under the sub-agent that took it. total is how long the whole run took – leave it out while it runs |
| elapsed | `number` |  | Seconds since the run started – pass it while the run is live: steps appear as they begin, running bars grow with a sheen, a blue line marks now and the numbers count. Without it the run is shown as finished |
| defaultOpen | `string \| null` | `"write"` | The step open on the right when the screen starts |
| onStop | `() => void` |  | Called with Stop while the run is live |
| onRerun | `() => void` |  | Called with Rerun once it is done |
| loading | `boolean` |  | Gray rows and bars under the real axis, and the panel as gray lines in its own layout |
| empty | `boolean` |  | A run without any steps yet |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K / ↑ / ↓: From step to step
- Enter: Open the step on the right

### Accessibility

- Each step is a button named with what it was, its kind, its app and how long it took – or that it runs or failed
- A polite live region says whether the run is running and how many steps it has
- Input and output keep their line breaks and can be copied; rings show for the keyboard only

### Motion

- Bars grow in from the left; a running bar carries a sweeping sheen and a glowing leading edge, as in Trace Waterfall
- While the run is live a blue line marks now and slides along, and the agent's pixel mark twinkles
- With prefers-reduced-motion nothing moves

### Responsive

- The trace uses the full width; the axis picks a round step for runs of any length, and a time near the right edge moves before its bar
- Below 640px the label column narrows and the four numbers sit two by two; below 480px each step's name sits over its bar
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: trace-waterfall, agents, agent-inbox-board, agent-activity
