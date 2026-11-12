# Example: AI chat with tools and approvals

Request: "Our agent chat (Vercel AI SDK) shows a spinner, raw tool JSON and a browser confirm() before it sends an email. Make it look like a real product."

## Plan

```
Regions: thread (messages), composer
Waiting:  status "submitted"           → thinking-loader, phases={["Thinking"]} (nothing more is known)
Tools:    tool parts                    → tool-call-card, calls that follow each other in one ToolCallGroup
Approval: sendEmail (no execute)        → approval-card, stays in the thread with its decision
Actions:  under assistant messages      → message-actions (copy, regenerate, feedback)
Input:    textarea                      → chat-composer, tray only before the first message
Style:    clean for the whole app
```

```bash
npx shadcn@latest add @affectui/chat-composer-clean @affectui/thinking-loader-clean @affectui/tool-call-card-clean @affectui/approval-card-clean @affectui/message-actions-clean
```

chat-composer and approval-card are Pro (access key, see SKILL.md Setup); without Pro keep a plain textarea and use the Free **tool-call-card**, **thinking-loader** and **message-actions**.

## Chat.tsx

```tsx
import { useChat } from "@ai-sdk/react";
import { getToolName, isToolUIPart, type ToolUIPart, type UIMessage } from "ai";
import { Fragment, type ReactNode } from "react";
import { ApprovalCard } from "@/components/ui/approval-card-clean";
import { ChatComposer } from "@/components/ui/chat-composer-clean";
import { MessageActions } from "@/components/ui/message-actions-clean";
import { ThinkingLoader } from "@/components/ui/thinking-loader-clean";
import { ToolCallCard, ToolCallGroup, type ToolCallStatus } from "@/components/ui/tool-call-card-clean";

/** Tools the server defines without `execute`: the user decides, the client sends the answer back */
const NEEDS_APPROVAL = new Set(["sendEmail"]);

const toolStatus = (part: ToolUIPart): ToolCallStatus =>
  part.state === "output-available" ? "success" : part.state === "output-error" ? "error" : "running";

/** One human line per tool – write one for each of your tools */
function toolSummary(name: string, input: unknown, done: boolean): string {
  const args = (input ?? {}) as Record<string, unknown>;
  if (name === "searchWeb") return `${done ? "Searched" : "Searching"} the web for “${args.query ?? "…"}”`;
  if (name === "sendEmail") return `${done ? "Sent" : "Sending"} an email to ${args.to ?? "…"}`;
  return name;
}

function ToolCall({ part }: { part: ToolUIPart }) {
  const name = getToolName(part);
  return (
    <ToolCallCard
      name={name}
      status={toolStatus(part)}
      summary={toolSummary(name, part.input, part.state === "output-available")}
      args={part.input}
      result={part.state === "output-available" ? part.output : undefined}
      error={part.state === "output-error" ? part.errorText : undefined}
    />
  );
}

/** The email the agent wants to send, as an approval – it stays in the thread with its decision */
function EmailApproval({ part, onDecide }: { part: ToolUIPart; onDecide: (approved: boolean) => void }) {
  const input = (part.input ?? {}) as { to?: string; subject?: string };
  const decided = part.state === "output-available" ? (part.output === "approved" ? "approved" : "denied") : "pending";
  return (
    <ApprovalCard
      title="Send email"
      description={`To ${input.to ?? "…"}`}
      risk="medium"
      details={[
        { label: "To", value: input.to ?? "–" },
        { label: "Subject", value: input.subject ?? "–" },
      ]}
      status={decided}
      allowAlways={false}
      onApprove={() => onDecide(true)}
      onDeny={() => onDecide(false)}
    />
  );
}

/** Text, approvals and tool calls in their order; tool calls that follow each other share one group */
function MessageParts({ message, onApprove }: { message: UIMessage; onApprove: (part: ToolUIPart, approved: boolean) => void }) {
  const out: ReactNode[] = [];
  let run: ToolUIPart[] = [];
  const flush = () => {
    if (!run.length) return;
    const parts = run;
    out.push(
      parts.length === 1 ? (
        <ToolCall key={parts[0].toolCallId} part={parts[0]} />
      ) : (
        <ToolCallGroup key={parts[0].toolCallId}>
          {parts.map((p) => (
            <ToolCall key={p.toolCallId} part={p} />
          ))}
        </ToolCallGroup>
      ),
    );
    run = [];
  };
  message.parts.forEach((part, i) => {
    if (isToolUIPart(part) && NEEDS_APPROVAL.has(getToolName(part))) {
      flush();
      if (part.state !== "input-streaming") out.push(<EmailApproval key={part.toolCallId} part={part} onDecide={(ok) => onApprove(part, ok)} />);
    } else if (isToolUIPart(part)) run.push(part);
    else {
      flush();
      if (part.type === "text") out.push(<p key={i}>{part.text}</p>);
    }
  });
  flush();
  return <Fragment>{out}</Fragment>;
}

export function AiChat() {
  const { messages, sendMessage, status, addToolResult, regenerate } = useChat();
  const last = messages.at(-1);

  return (
    <section style={{ display: "grid", gap: 16, maxWidth: 720, margin: "0 auto" }}>
      {messages.map((m) => (
        // data-ui-message lights up the actions bar while the message is hovered
        <div key={m.id} data-ui-message>
          <MessageParts
            message={m}
            onApprove={(part, ok) =>
              addToolResult({ tool: getToolName(part), toolCallId: part.toolCallId, output: ok ? "approved" : "denied" })
            }
          />
          {m.role === "assistant" && (
            <MessageActions
              text={m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}
              actions={["copy", "regenerate", "feedback"]}
              regenerating={status !== "ready" && m.id === last?.id}
              onRegenerate={() => regenerate({ messageId: m.id })}
            />
          )}
        </div>
      ))}

      {/* Only `status` is known here, so the label says no more than that */}
      {status === "submitted" && <ThinkingLoader phases={["Thinking"]} />}

      <ChatComposer
        placeholder="Ask the agent…"
        tray={messages.length === 0}
        // The composer doesn't know the chat status – ignore sends while a reply is on its way
        onSend={(text) => status === "ready" && sendMessage({ text })}
      />
    </section>
  );
}
```

## Notes

- **AI SDK 5** (above): an approval tool has no `execute` on the server; the client answers with `addToolResult` (renamed `addToolOutput` in later 5.x). **AI SDK 6** has approvals built in: tools with `needsApproval` arrive in state `approval-requested`; answer with `addToolApprovalResponse({ id: part.approval.id, approved })` and show the same **approval-card**.
- The approval card is controlled by the part: pending while `input-available`, then approved or denied from the output. It stays in the thread, so the decision can be read later.
- `toolSummary` is where the UI stops looking generic: one human line per tool.
- `chat-composer` ships demo models and apps: pass your own `models` and `apps`, or `tray={false}` and no apps if the agent has none.
