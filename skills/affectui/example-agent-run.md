# Example: agent run with sub-agents, time and cost

Request: "We log every agent run as spans (agents, LLM calls, tool calls with parent ids). Build the run page: who did what, where the time went, where the money went."

## Plan

```
Data:    one flat list of spans with parentId → build the trees once per update
Regions: approvals (if the run has any, see example-approvals.md) → agents → time → cost
Agents:  agent spans only                     → agent-tree; each agent's own cost = its span + its LLM and tool calls
Time:    every span, ms from the run's start  → trace-waterfall, startedAt keeps the clock while it runs
Cost:    the root's steps with their children → cost-waterfall (it has its own cost/tokens switch)
States:  loading, load error (retries), not started yet; poll until no span runs
```

Why not the `agent-run` screen: that screen shows a plan ticking through its steps for one agent. For a run logged
as spans with sub-agents, these three components show it as it really happened.

```bash
npx shadcn@latest add @affectui/agent-tree-clean @affectui/trace-waterfall-clean @affectui/cost-waterfall-clean
```

## AgentRun.tsx

```tsx
import { useEffect, useMemo, useState } from "react";
import { AgentTree, type TreeAgent } from "@/components/ui/agent-tree-clean";
import { CostWaterfall, type CostStep } from "@/components/ui/cost-waterfall-clean";
import { TraceWaterfall, type TraceSpan } from "@/components/ui/trace-waterfall-clean";

/** What a typical agent backend sends: a flat list of spans with parent ids (OpenTelemetry, LangSmith, your own log) */
type Span = {
  id: string;
  parentId?: string;
  name: string;
  kind: "agent" | "llm" | "tool";
  status: "running" | "done" | "failed";
  model?: string;
  startedAt: number; // epoch ms
  endedAt?: number;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number; // this span's own cost, not its children's
  input?: string;
  output?: string;
  error?: string;
};

/**
 * Flat list → nested nodes, once per update. Children in start order; a span whose parent hasn't arrived yet
 * waits for the next update instead of becoming a second root.
 */
function nest<T extends { children?: T[] }>(spans: Span[], map: (s: Span) => T, parentOf = (s: Span) => s.parentId) {
  const sorted = [...spans].sort((a, b) => a.startedAt - b.startedAt);
  const ids = new Set(sorted.map((s) => s.id));
  const nodes = new Map(sorted.map((s) => [s.id, map(s)]));
  let root: T | undefined;
  for (const s of sorted) {
    const parent = parentOf(s);
    if (parent && ids.has(parent)) (nodes.get(parent)!.children ??= []).push(nodes.get(s.id)!);
    else if (!parent && !root) root = nodes.get(s.id); // the earliest span without a parent is the run
  }
  return root;
}

const toTrace = (spans: Span[], t0: number) =>
  nest<TraceSpan>(spans, (s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind === "agent" && s.parentId ? "subagent" : s.kind,
    status: s.status,
    start: s.startedAt - t0, // ms from the start of the run
    end: s.endedAt === undefined ? undefined : s.endedAt - t0,
    detail: s.model,
    model: s.model,
    tokensIn: s.tokensIn,
    tokensOut: s.tokensOut,
    cost: s.costUsd,
    input: s.input,
    output: s.output,
    error: s.error,
  }));

function toCost(spans: Span[], now: number): CostStep[] {
  const step = (s: Span): CostStep => ({
    id: s.id,
    name: s.name,
    kind: s.kind,
    status: s.status,
    model: s.model,
    tokensIn: s.tokensIn,
    tokensOut: s.tokensOut,
    cost: s.costUsd,
    duration: (s.endedAt ?? now) - s.startedAt,
    input: s.input,
    output: s.output,
    error: s.error,
  });
  // The root agent is the run itself: its children are the waterfall's steps. Whatever the root booked itself
  // (e.g. its own LLM usage stored on the agent span) goes first, so the total matches the tree's
  const root = nest<CostStep>(spans, step);
  if (!root) return [];
  return root.cost ? [{ ...root, children: undefined, id: `${root.id}-own`, kind: "llm" }, ...(root.children ?? [])] : (root.children ?? []);
}

/** Only agents go into the tree; each agent's own cost is its span plus the LLM and tool calls below it */
function toAgents(spans: Span[]): TreeAgent | undefined {
  const byId = new Map(spans.map((s) => [s.id, s]));
  const agentOf = (s: Span) => {
    let p = s.parentId ? byId.get(s.parentId) : undefined;
    while (p && p.kind !== "agent") p = p.parentId ? byId.get(p.parentId) : undefined;
    return p;
  };
  const own = new Map<string, number>();
  for (const s of spans) {
    const owner = s.kind === "agent" ? s : agentOf(s);
    if (owner && s.costUsd) own.set(owner.id, (own.get(owner.id) ?? 0) + s.costUsd);
  }
  return nest<TreeAgent>(
    spans.filter((s) => s.kind === "agent"),
    (a) => ({
      id: a.id,
      name: a.name,
      // TreeAgent needs a task: spans rarely have one, so use the first line of the agent's input
      task: a.input?.split("\n")[0] || a.name,
      model: a.model,
      status: a.status,
      cost: own.get(a.id),
      error: a.error,
      started: a.startedAt,
      ended: a.endedAt,
    }),
    (a) => agentOf(a)?.id,
  );
}

export function AgentRun({ runId }: { runId: string }) {
  const [spans, setSpans] = useState<Span[] | null>(null);
  const [failed, setFailed] = useState(false);

  // Poll until the run has started and no span runs any more (or subscribe to your event stream and append)
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const res = await fetch(`/api/runs/${runId}/spans`);
        if (!res.ok) throw new Error(String(res.status));
        const next: Span[] = await res.json();
        if (stop) return;
        setSpans(next);
        setFailed(false);
        if (next.length === 0 || next.some((s) => s.status === "running")) timer = setTimeout(load, 2000);
      } catch {
        if (stop) return;
        setFailed(true);
        timer = setTimeout(load, 5000);
      }
    };
    load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [runId]);

  const view = useMemo(() => {
    if (!spans?.length) return null;
    const t0 = Math.min(...spans.map((s) => s.startedAt));
    return { t0, agents: toAgents(spans), trace: toTrace(spans, t0), cost: toCost(spans, Date.now()) };
  }, [spans]);

  if (!spans) return <p>{failed ? "Couldn't load the run – trying again." : "Loading the run…"}</p>;
  if (!view?.agents || !view.trace) return <p>This run hasn't started yet.</p>;

  // Three areas, each with its own motion: who (tree), when (trace), what it cost (cost)
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <AgentTree root={view.agents} />
      <TraceWaterfall root={view.trace} startedAt={view.t0} />
      <CostWaterfall steps={view.cost} task={view.agents.task} />
    </div>
  );
}
```

## Notes

- **Never pre-sum.** `cost`, `tokensIn` and `tokensOut` are each node's own; the components add up branches. If the backend only stores totals per agent, subtract the children or say that the numbers are totals.
- **Times:** trace-waterfall wants ms from the run's start, agent-tree epoch ms, cost-waterfall a duration. Convert in the mappers, not in the components.
- **Agent Tree's windows:** a failed agent's card offers Retry and Dismiss, a waiting one Approve and Reject. Pass `onResolve(agent, action)` wired to your backend; if the backend can't retry, say so to the user instead of leaving buttons that do nothing.
- **With approvals on the same page:** put **approval-gates** above the tree – it is what needs a person. Give the waiting agent `status: "waiting"` and `ask` (the gate's action), and route the tree's `onResolve` approve/reject to the same decide function as the gates, so there is one source of truth. Join an interrupt to its agent by the agent span's id when the backend stores it, by name otherwise.
- Several independent runs instead of one orchestrator: list them with **agent-inbox** and open this page per run.
- LangSmith, Langfuse, OpenTelemetry and the OpenAI Agents SDK all export spans in this shape (id, parent id, kind, start, end, usage); only the field names differ.
