# Judge Bracket (Pro)

How an LLM judge picks the best of several attempts, as a tournament – two answers at a time, the one it prefers moves on, the other fades back; the winner's way through the bracket lights up, and every match opens both answers side by side with the scores and why

- Page: https://www.affectui.com/components/judge-bracket
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/judge-bracket.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/judge-bracket-clean.json` (needs the Pro access key) – lands as `judge-bracket-clean.tsx`, import from `@/components/ui/judge-bracket-clean` – its docs: `judge-bracket-clean.md`
- Import: `@/components/ui/judge-bracket`

### When to use

- LLM-as-a-judge: several models, prompts or temperatures answer the same task and a judge picks the best, two at a time
- Showing why a generated answer won – every match with both answers side by side, the scores and the judge's reason
- Best-of-n for coding agents: several fixes for the same bug, judged on whether they solve the cause, pass the tests and stay small

### When not to use

- Several attempts running at once, without a judge comparing them – use Parallel Attempts
- Trying models one after another until one works – use Fallback Chain
- Comparing many cells of work at a glance – use Fan-out Grid

### Usage

```tsx
import { JudgeBracket, type Contender } from "@/components/ui/judge-bracket";

const contenders: Contender[] = [
  { id: "a", name: "Sonnet · warm", meta: "142 words", output: "Subject: Your 14 days start now…" },
  { id: "b", name: "GPT-5 · formal", meta: "168 words", output: "Subject: Welcome to your trial…" },
  { id: "c", name: "Gemini · bullets", meta: "104 words", output: "Subject: 3 steps to your first project…" },
  { id: "d", name: "Sonnet · short", meta: "96 words", output: "Subject: Start your first project…" },
];

export function BestEmail() {
  return (
    <JudgeBracket
      contenders={contenders}
      verdicts={{ "0:0": { winner: "a", scores: [8.1, 7.4], reason: "Warmer, and it names the trial length." } }}
      judging="0:1"
      judge="Claude Opus"
      task="Welcome email for new trial users"
      onPick={(winner) => send(winner.output)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| contenders | `Contender[]` |  | Every attempt, in seed order – 2, 4, 8 or 16; neighbours meet in the first round |
| Contender | `{ id, name, icon?, meta?, output? }` |  | name – what makes this attempt different; icon – e.g. the model maker's logo; meta – a quiet line like "118 words · 2.1s"; output – what it produced |
| verdicts | `Record<string, { winner, reason?, scores? }>` |  | What the judge decided, by match "round:match" from 0 – e.g. "0:2" is the third match of the first round; scores are for the upper and the lower contender |
| judging | `string` |  | The match the judge works on right now, same key – both names shimmer |
| judge | `string` |  | Who judges – e.g. "Claude Opus" |
| task | `string` |  | What the attempts are for – shown muted next to the title |
| onPick | `(winner: Contender) => void` |  | Use the winner – without it, the final has no button |
| title | `string` | `"Judge"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Into the bracket, match by match, then to the answers and Use
- ← / →: To the match this one feeds, and back to the first one feeding it
- ↑ / ↓: The match above and below in the same round
- Enter / Space: Shows that match's answers; again goes back
- Esc: Back to what the judge works on

### Accessibility

- Every match is a button that says its round, both contenders and who won – or that it's being judged
- The match below the bracket is announced politely when it changes, and the bar says who's ahead
- Winning is never color alone: the winner keeps its full color and a check or its score, the other fades and its line is dashed

### Motion

- The match being judged shimmers; the one it prefers slides into the next round, the other fades back flat but stays
- When the final is decided, the winner's way through the bracket draws itself in blue, round after round, and a cup appears in the final
- The answers below ease to their new height when you open another match
- With prefers-reduced-motion everything simply appears

### Responsive

- Every slot has a fixed height, so nothing moves while the judge works; the rounds share the width
- When the rounds don't fit side by side it becomes a list per round, two contenders a row, and the answers stack
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Seed the contenders in the order they should meet – neighbours play each other first
- Only add a verdict for a match whose two contenders are both known; winner must be one of them
- Keep name to what makes the attempt different (model · prompt), and reason to one sentence
- The blue of the winner's way is --ui-jb-path; how far what you didn't pick fades is --ui-jb-dim

### Requirements

- React 19

Related: parallel-attempts, fallback-chain, fan-out-grid, model-picker
