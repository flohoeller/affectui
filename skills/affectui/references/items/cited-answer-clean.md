# Cited Answer, clean style (Pro)

An AI answer wired to its sources – point at a citation to light up its sentence and source, click to unfold the quoted passage with the matching words marked

- Page: https://www.affectui.com/components/cited-answer
- Section: Components · Chat
- Install: `npx shadcn@latest add https://www.affectui.com/r/cited-answer-clean.json` (needs the Pro access key)
- Import: `@/components/ui/cited-answer-clean`

### When to use

- Search, research and support answers where people need to check which sentence comes from which source before they trust it
- A finished answer from your RAG pipeline that already knows the passage behind each claim – the preview shows exactly that passage
- Next to AI Answer: use this one once the answer is done and the point is checking it, not watching it stream

### When not to use

- Answers that are still streaming, with follow-ups and feedback – use AI Answer
- Casual chat without sources – a plain message is lighter
- Long reports with dozens of sources – the source row is made for a handful of chips

### Usage

```tsx
import { CitedAnswer, type CitedSegment, type CitedSource } from "@/components/ui/cited-answer-clean";

const sources: CitedSource[] = [
  {
    id: "caching",
    site: "Tokenwise",
    title: "Prompt caching, explained",
    url: "https://tokenwise.dev/blog/prompt-caching",
    date: "Sep 18, 2026",
    quote: "A cached prefix is read instead of recomputed …",
    highlight: ["read instead of recomputed"],
  },
];

const segments: CitedSegment[] = [
  { text: "Prompt caching reuses the processed start of your prompt.", cite: ["caching"] },
  { text: " Streaming makes the rest feel faster." },
];

export function Answer() {
  return <CitedAnswer segments={segments} sources={sources} pagesRead={12} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| segments | `CitedSegment[]` |  | { text, cite?, paragraph? } – the answer in order. cite lists source ids (one marker each); paragraph starts a new paragraph. Spaces at the edges of text stay outside the highlight |
| sources | `CitedSource[]` |  | { id, title, site, url?, date?, quote?, highlight?, icon? } – numbered in this order, one chip each |
| pagesRead | `number` |  | Pages read while searching – shown in the head as "3 sources · 12 pages read" |
| defaultOpen | `string` |  | Id of the source whose preview is open at first |
| onOpenSource | `(source: CitedSource) => void` |  | Called by Open source. With it the link doesn't navigate on its own; without it the url opens in a new tab |
| onPreviewChange | `(id: string \| null) => void` |  | Called when a preview opens, switches or closes |
| action | `{ label: string; onClick: () => void }` |  | A button in the last row of the card, e.g. Follow up |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the citation markers in reading order, the source chips and "+N", the preview's buttons and the action
- Enter / Space: Opens or closes the preview of a marker or chip
- ← / → / Home / End: Move between the source chips and "+N"
- Esc: Closes the preview and puts focus on its chip

### Accessibility

- Markers and chips are buttons named "Source 2: Latency Notes – title", with aria-expanded and aria-controls pointing at the preview
- Focusing a marker or chip lights up the same sentences and chip as hovering does
- The preview is a named region; while closed it is inert
- The last row of the card is announced politely – what you point at, and "Quote copied"

### Motion

- Hovering a marker gives its sentence a soft tint and lights up its chip; hovering a chip tints every sentence that cites it and fades the rest of the answer
- The preview unfolds below the source chips and folds away again; switching to another source crossfades its content in place
- The line in the last row crossfades: the old line fades out underneath while the new one fades in
- With prefers-reduced-motion everything switches without movement

### Responsive

- Fills its container up to 460px and works from 300px. The source chips stay on one line – whatever doesn't fit goes into "+N", which shows them all. Below 400px the card gets tighter, below 360px the preview drops its number tag, below 280px Copy quote keeps only its icon
- Touch screens: larger hit areas around the markers and taller chips and buttons
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Numbers come from the order of sources, not from the text – cite by id, and reorder sources to renumber
- The last word of a cited sentence stays on the line with its markers, so a marker never starts a line on its own
- Ids in cite that aren't in sources are skipped, so a hallucinated citation never shows a broken marker
- Without highlight, words of five letters or more (and numbers) that the quote shares with its citing sentences are marked – pass highlight for exact phrases
- The component doesn't fetch pages – quote should be the passage your retrieval step actually used

### Requirements

- React 19

Related: ai-answer, tool-call-card, thinking-state
