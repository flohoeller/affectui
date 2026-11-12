# AI Answer, clean style (Pro)

Streamed answer with source cards, citation chips that preview their source, copy, regenerate, feedback and follow-ups

- Page: https://www.affectui.com/components/ai-answer
- Section: Components · Chat
- Install: `npx shadcn@latest add https://www.affectui.com/r/ai-answer-clean.json` (needs the Pro access key)
- Import: `@/components/ui/ai-answer-clean`

### When to use

- Answers from an assistant that searched your docs, the web or connected tools and should show where each claim comes from
- Research, support or knowledge-base products where people need to check the source before they act

### When not to use

- Casual chat without sources – a plain message bubble is lighter
- Long documents or code – the answer is made for a few paragraphs and lists

### Usage

```tsx
import { AIAnswer, type AnswerSource } from "@/components/ui/ai-answer-clean";

const sources: AnswerSource[] = [
  { name: "Notion", title: "Offsite plan – shortlist and budget", href: "https://notion.so/…", snippet: "Budget €4,500 for three nights…" },
  { name: "Slack", title: "#team-offsite – who can make which dates", href: "https://slack.com/…" },
];

export function Answer({ text, done }: { text: string; done: boolean }) {
  return (
    <AIAnswer
      question="Where should we hold the team offsite?"
      sources={sources}
      // Blank lines: paragraphs · "- ": list · **bold** · [1] or [1,2]: citations (1-based)
      answer={text}
      streaming={!done}
      onRegenerate={() => regenerate()}
      onFeedback={(value, reason) => track("answer_feedback", { value, reason })}
      // No surface of its own – add framed when it stands alone on the page
      framed
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| question | `string` |  | Shown as the title above the sources |
| sources | `AnswerSource[]` |  | Each { title, name, href?, icon?, snippet? }; name is the short label on the citation chip |
| answer | `string` |  | Blank lines make paragraphs, lines starting with "- " a list, **bold**, [1] or [1,3] cite sources (1-based). It may grow while streaming; a different text starts over |
| streaming | `boolean` | `false` | More text is still coming from your model – keeps the cursor going once it has caught up |
| animate | `boolean` | `true` | Stream the text in; false shows it at once |
| speed | `number` | `38` | Words per second while streaming in |
| followUps | `string[]` |  | Related questions shown below the finished answer |
| onFollowUp | `(question: string) => void` |  | A follow-up was clicked |
| onRegenerate | `() => void` |  | Regenerate was clicked – the answer streams in again; pass a new answer to replace it |
| onStop | `() => void` |  | Stop was clicked while writing – cancel your request here |
| onFeedback | `(value: "up" \| "down", reason?: string) => void` |  | Thumbs up, or thumbs down with the reason that was picked |
| feedbackReasons | `string[]` | `["Not accurate", "Wrong source", "Too long", "Out of date"]` | Reasons offered after a thumbs down |
| onCopy | `(text: string) => void` |  | Called with the copied text: the answer without markup plus a numbered source list |
| framed | `boolean` | `false` | Puts the answer on its own white card with hairline shadows. Off, it has no background, shadow or padding and takes on the thread, panel or sheet it sits in |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through source cards, citation chips, follow-ups and actions
- Esc: Closes the source preview of the focused chip

### Accessibility

- Citation chips are buttons named after their sources; the preview is a tooltip linked to the chip
- The answer is marked busy while it streams, so screen readers read it once it's complete
- Copy, feedback and status changes are announced in a polite live region

### Motion

- Source cards pop in one after another while the label reads "Reading 6 sources"
- Words fade in out of a light blur, citation chips pop in, a pulsing dot marks where the text grows
- Hovering a chip lights up its source card (or the "+N" tile), hovering a card or the tile lights up its chips
- The answer glides to its new height; with prefers-reduced-motion the answer appears at once

### Responsive

- Fills its container up to 640px; up to three source cards fit the row, the rest are a "+N" tile – two cards below 480px
- Tap a citation chip to open its preview on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: thinking-state, chat-composer, comment-thread
