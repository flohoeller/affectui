# Example: approvals in a running agent

Request: "Our agent pauses before risky steps (tool calls, file changes, sub-agents, messages) and waits for a person. Show all of them for a run, with approve, reject and edit."

## Plan

```
Data:      the run's interrupts in order of arrival – poll while the run is live (or a server-sent event stream)
Region:    one block for the run → approval-gates (open ones stack, decided ones list below)
Decide:    show it at once, POST it, keep it through polls that still say pending, reopen with a message on failure
Edit:      "edited" sends the changed input; the agent resumes with it
Single:    only ever one approval, inline in a chat → approval-card instead (see example-ai-chat.md)
Many runs: a queue across runs sorted by risk → review-center instead
```

```bash
npx shadcn@latest add @affectui/approval-gates-clean
```

## RunApprovals.tsx

```tsx
import { useEffect, useRef, useState } from "react";
import { ApprovalGates, type ApprovalGate, type GateDecision } from "@/components/ui/approval-gates-clean";

/** What the backend stores for each point where the run waits for a person – fields marked ? are optional */
type Interrupt = {
  id: string;
  agent: string;
  type: "tool_call" | "file_change" | "subagent" | "message";
  action: string;
  reason: string;
  state: "pending" | "approved" | "edited" | "rejected";
  createdAt: number;
  decidedAt?: number; // without it, "at" shows when the gate came up
  args?: unknown; // shown as the editable input
  patch?: { file: string; before: string; after: string }[]; // shown as a diff
  blocks?: string[]; // the steps that wait for this gate
  comment?: string; // what the person changed or said
};

const KIND = { tool_call: "tool", file_change: "file", subagent: "agent", message: "message" } as const;

function ago(ms: number) {
  const s = Math.round((Date.now() - ms) / 1000);
  return s < 60 ? "just now" : s < 3600 ? `${Math.round(s / 60)}m ago` : `${Math.round(s / 3600)}h ago`;
}

function toGate(i: Interrupt): ApprovalGate {
  return {
    id: i.id,
    agent: i.agent,
    kind: KIND[i.type],
    action: i.action,
    reason: i.reason,
    status: i.state === "pending" ? "open" : i.state,
    at: ago(i.decidedAt ?? i.createdAt),
    input: i.args === undefined ? undefined : JSON.stringify(i.args, null, 2),
    diff: i.patch?.map((p) => ({
      file: p.file,
      lines: [
        ...p.before.split("\n").map((text) => ({ type: "del" as const, text })),
        ...p.after.split("\n").map((text) => ({ type: "add" as const, text })),
      ],
    })),
    holds: i.blocks,
    note: i.comment,
  };
}

export function RunApprovals({ runId, task, live }: { runId: string; task: string; live: boolean }) {
  const [items, setItems] = useState<Interrupt[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Decisions on their way to the server: a poll that still says "pending" must not reopen them
  const sending = useRef(new Map<string, Interrupt["state"]>());

  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const res = await fetch(`/api/runs/${runId}/interrupts`);
        if (res.ok && !stop) {
          const next: Interrupt[] = await res.json();
          setItems(next.map((i) => (sending.current.has(i.id) && i.state === "pending" ? { ...i, state: sending.current.get(i.id)! } : i)));
        }
      } catch {}
      if (!stop && live) timer = setTimeout(load, 2000); // or a server-sent event stream when the backend has one
    };
    load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [runId, live]);

  async function decide(id: string, decision: GateDecision, value?: string) {
    setError(null);
    sending.current.set(id, decision);
    // Show the decision at once; the next poll brings the stored state
    setItems((list) => list.map((i) => (i.id === id ? { ...i, state: decision, decidedAt: Date.now(), comment: value ?? i.comment } : i)));
    try {
      const res = await fetch(`/api/runs/${runId}/interrupts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, value }), // the agent resumes with the approved, edited or rejected call
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setItems((list) => list.map((i) => (i.id === id ? { ...i, state: "pending", decidedAt: undefined } : i)));
      setError("The decision wasn't saved – it's open again.");
    } finally {
      sending.current.delete(id);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <ApprovalGates gates={items.map(toGate)} task={task} live={live} onDecide={decide} />
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
```

## Notes

- Map the backend's states onto the four gate statuses; `pending` → `"open"`. Keep the order in which the gates came up.
- Only `id`, `agent`, `kind`, `action`, `reason` and `status` are needed. `input`, `diff`, `holds` and `note` show more when the backend has them; leave them out otherwise.
- `holds` lists the steps that wait for a gate – that is what makes a person decide quickly. Send it if the agent knows its next steps.
- `at` is already formatted ("2m ago"); without a decided time it shows when the gate came up.
- LangGraph `interrupt()`, the OpenAI Agents SDK's tool approval and AI SDK 6 `needsApproval` all produce these interrupts; the resume call is the POST above.
