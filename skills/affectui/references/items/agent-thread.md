# Agent / Thread (Pro)

One conversation with your orchestrator – it answers in plain text with small task and decision cards, folds its parallel tools into one line, and keeps working through a dropped connection, a slow upload or a long time away

- Page: https://www.affectui.com/screens/agent-thread
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-thread.json` (needs the Pro access key)
- Import: `@/components/ui/agent-thread`

### When to use

- You work through one orchestrator in one thread – it launches the sub-agents in the background and you only see the conversation, the tasks it mentions and the decisions it needs
- A chat that has to hold up in real life: parallel tool calls, reading back while it streams, a dropped connection, slow uploads, dictation on a bad network, coming back after an hour

### When not to use

- Picking a model per message – the orchestrator chooses its models itself; pass `models` for a picker, or use AI Chat / Start
- Watching every agent and trace of a run – use Agent / Orchestration or AI Chat / Run

### Usage

```tsx
import { AgentThreadScreen } from "@/components/ui/agent-thread";

export default function Page() {
  const { messages, send, stop, retry } = useOrchestrator(); // your stream – append to the last message as tokens arrive
  return (
    <AgentThreadScreen
      messages={messages}
      onSend={(text, attachments) => send(text, attachments)}
      onStop={stop}
      onRetry={retry}
      lastSeen={user.lastSeenAt}
      running={{ running: tasks.running, needs: inbox.open }}
      decisions={inbox.open}
      onDecide={(id, answer) => api.answer(id, answer)}
      onLater={(id) => api.snooze(id)}
      tasks={taskDetails}
      onShowTask={(id) => router.push(`/tasks?task=${id}`)}
      onOpenInbox={(item) => router.push(item ? `/inbox?item=${item}` : "/inbox")}
      upload={(file, progress, signal) => uploadWithProgress(file, progress, signal)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item – and with "Tasks" / "Inbox" when onOpenTask / onOpenInbox are left out |
| workspace | `string` | `"Fieldwork"` | The workspace in the sidebar |
| messages | `({ id; role: "user"; text; at; attachments?; status?: "sent" \| "queued" \| "sending" \| "failed" } \| { id; role: "agent"; at; parts; streaming?; stopped? })[]` |  | The conversation. An agent message is parts: { kind: "text", text } · { kind: "tools", id, tools: { id, label, icon?, status: "running" | "done" | "failed" | "stopped", startedAt?, ms?, error? }[] } · { kind: "task", task: { id, title, status, steps?: { done, total }, done? } } · { kind: "decision", ask: { id, question, task, kind? } } · { kind: "artifacts", names } · { kind: "error", text, retry? }. Stream by appending to the last text part and keep streaming: true until it ends. Pass a stable array (state) – the screen follows it. Left out: sample content, and anything you send gets a sample reply |
| onSend | `(text: string, attachments: ThreadAttachment[]) => void` |  | Called when a message goes out – written offline, it waits as "Waiting to send" and is called once you're back online. Attachments are the uploads that finished |
| onStop | `() => void` |  | Stop, or Esc in the field, while an answer streams |
| onRetry | `(messageId: string) => void` |  | Retry on a failed message – or on an error line in an answer (that answer's id) |
| connection | `"online" \| "offline" \| "reconnecting"` |  | The connection, when your app knows it best (e.g. your socket's state). Left out, the screen follows the browser's online / offline events and retries on a countdown of 5, 10, 20, 30s |
| onReconnect | `() => void` |  | Retry now in the banner – with `connection` set, reconnect here |
| lastSeen | `number` |  | When you were last here, in ms – a "While you were away" card sums up what came after (done tasks, what needs you) where you left, and the thread opens there |
| awayAfter | `number` | `5` | Minutes in another tab after which coming back shows the away card too (visibilitychange) |
| onMarkRead | `() => void` |  | Mark as read on the line under the away card |
| decisions | `{ id; kind?: "decision" \| "pick" \| "approval"; question; task; taskId?; options?: { id; title; summary?; recommended?; wireframe? }[]; facts?: { label; value }[] }[]` |  | The decisions waiting on you, in order. The first docks as its own card just above the composer, with a "1 of 2" pager when there are more; 3–5 options, facts for an approval, wireframe tiles for a pick. Pass a stable array (state) – the screen follows it. Left out, the sample's |
| onDecide | `(id: string, answer: { option?: string; text?: string } \| "approve" \| "decline") => void` |  | Called when you answer – a click or 1–5 on a row, Enter on the focused row, or your own words typed in the card's last row, "Something else…". The answer shows as your message with "Answered: …" above it, the dock folds away and the next one docks; the head's "need you" counts down |
| onLater | `(id: string) => void` |  | Later (or Esc in the dock): it folds to a one-line "1 decision waiting · Show" above the field |
| tasks | `Record<string, { goal?; project?; started?; steps?: { label; done? }[]; history?; artifacts?; decided? }>` |  | What a task's tab in the work area shows, by task id – opened from a card's Open or the away card; another task takes the tab over, artifact tabs stay |
| onShowTask | `(taskId: string) => void` |  | "Show in Tasks" in a task's tab – the only way to the Tasks screen (default: onNavigate("Tasks")) |
| running | `{ running: number; needs: number }` | `{ running: 9, needs: 5 }` | The head's quiet "9 running · 5 need you" – running opens Tasks, need you brings up the dock (the Inbox when nothing is docked); needs counts down as you answer and is the Inbox count in the sidebar too |
| onOpenTask | `(taskId: string) => void` |  | Called when a task opens as a tab in the work area – no page switch |
| onOpenInbox | `(itemId?: string) => void` |  | The head's "need you" when nothing is docked, the away card's Open Inbox, an "Asked" line for a question that isn't docked (default: onNavigate("Inbox")) |
| artifacts | `Record<string, ShellArtifact>` |  | What each artifact chip opens in the work area – doc, table / sheet, code, image or files, as in the App Shell |
| suggested | `WorkspaceSource[]` |  | Suggested in a New tab of the work area (its + and the corner button) |
| models | `ChatModel[]` |  | Models to pick from in the composer – left out, there is no picker, since the orchestrator chooses its models itself |
| upload | `(file: File, progress: (p: number) => void, signal: AbortSignal) => Promise<void>` |  | Uploads a file you attached: report 0–1, stop on the signal (Cancel), reject for "Upload failed · Retry". Left out, uploads are simulated at 3 MB/s and pause while offline |
| transcribe | `(clip: ThreadAttachment) => Promise<string>` |  | Turns a voice note into text for the field – offline the clip waits as a chip and is transcribed once you're back. Left out, a sample sentence |
| simulate | `"live" \| "scrolled" \| "offline" \| "uploading" \| "dictating" \| "away" \| "error"` |  | A preset for previews: plays the sample story (you ask → parallel tools → streaming → a task card → the decision docks) or decision: the dock with four options and a second one to page to; or starts in one hard state. The switcher on this page's full-screen view is demo chrome that only sets this prop – it isn't part of the component |
| labels | `{ title?; orchestrator?; placeholder?; offline?; backOnline?; waiting?; away?; markRead?; jump?; needsYou?; decide?; open?; retry?; … }` |  | Labels, e.g. for a translation – title is the head's "Today" |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the thread opens from history: gray messages in the column – your bubbles on the right, the orchestrator's mark, folded tool lines, text lines and task cards – and a gray Task tab, in the shape of the real ones (the shared Skeleton). The head's counts hide, the composer stays (sending waits), and nothing streams, counts or scrolls; `simulate` waits and starts once loading ends |
| empty | `boolean` |  | No chat at all yet: the column shows the shared EmptyState – No chats yet, one line on what shows up here and Start a chat (→ onNavigate("New chat")) – in place of the conversation. Pass empty `messages` with it; `loading` wins |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter: Send – offline it queues and goes out once you're back
- Shift Enter: A new line – the field grows up to about ten lines, then scrolls
- Esc: In the field: stop the answer while it streams; while dictating, discard the clip
- End: Jump to the latest and follow it again – anywhere in the screen, as long as you're not typing
- /: Focus the field
- 1 / 2 / 3 / 4 / 5: Answer the docked decision with that row; the number after the last option goes to "Something else…"
- ↑ ↓ / ← → / Home / End / Enter: In the dock: move through the rows (← → on tiles), Enter answers the focused one; a click answers at once, like Claude
- Esc: In the dock: Later – it folds to one line above the field
- Tab: Through the tool groups (Enter opens or folds one), every card's Open or Decide, the artifact chips, Retry and the composer's buttons

### Accessibility

- The conversation is role="log" with aria-live="polite" and aria-busy while an answer streams – a screen reader reads the finished answer, not every word
- The connection banner is role="status"; "Waiting to send", "Back online", "Stopped" and upload failures are announced in a polite live region
- The Jump pill is named with its count – "Jump to latest, 12 new lines, still writing" – and lists End as its shortcut
- Each tool group is a button with aria-expanded; folded rows are inert, so Tab skips them; each row says whether it runs, failed or is done
- Task cards are reached by their own Open, named with the task and its status
- The dock is a role="group" labelled by its question; its rows are a listbox with a roving tabindex and aria-keyshortcuts 1–5; "Answered: Kafka" is announced politely and, answered from the keyboard, the focus moves to the composer
- Where it asked, a button says "Asked: … · waiting" or "· answered below" – it brings the dock up (the focus lands on its option) or scrolls to your answer
- Every control shows the 2px accent focus ring for the keyboard only (:focus-visible); the text field never shows one – only its edge firms up while you type
- Shortcuts never fire while you type, apart from Enter, Shift Enter and Esc in the field

### Motion

- One signature: parallel tools finish at their own moments – each check pops in – then, a beat after the last, the rows fold together into "Ran 3 tools · 4.2s"
- The answer types in word by word behind a soft, breathing caret; running tool names carry a slow sheen
- Messages and cards rise in by 8px; the banner drops in, the Jump pill rises in
- The dock folds away smoothly once the last decision is answered; the next one fades in; brought up from elsewhere it pulses gray once
- With prefers-reduced-motion nothing slides, folds or breathes – states simply change; spinners slow down

### Responsive

- Fills its container – give it the full viewport height in your app
- One width, --th-col (680px): the orchestrator's text, every block – task cards, tool groups, the away card, error lines – the dock and the composer share the same edges; your bubbles stay right-aligned at most 80%
- The decision is its own card, 8px above the composer and as wide – not an overlay: the thread above shrinks with it, so the latest message and the Jump pill stay above it. The composer always starts a new prompt; your own answer goes in the card's last row
- Below 560px the column and the composer fill the width with 12px sides, bubbles take up to 88%, cards go full width and the composer hugs the edges
- Artifacts open in the App Shell's work area – a panel on the right, on phones the shell's sheet
- Touch: every control at least 36px. Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- There is deliberately no model picker, effort selector or agent list – the orchestrator decides; keep it that way
- Stream by updating the last agent message: append to its last text part, set tools' status as they finish, then streaming: false
- The sample story and the simulate presets live in the component for previews; the demo page's state switcher is demo-only chrome
- Decisions are answered in the thread, never by switching pages: put them in `decisions`, answer them in onDecide; the inline decision part is only the "Asked" line

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell and Chat Composer – installed with it

Related: inbox, agent-tasks, agent-chat, chat-composer, thinking-state, tool-call-card
