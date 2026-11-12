# Toaster, clean style (Pro)

Calm toasts from anywhere – a stack that fans out on hover, promise toasts that morph from spinner to check, swipe to dismiss

- Page: https://www.affectui.com/components/toaster
- Section: Components · Feedback
- Install: `npx shadcn@latest add https://www.affectui.com/r/toaster-clean.json` (needs the Pro access key)
- Import: `@/components/ui/toaster-clean`

### When to use

- Short confirmations after an action – saved, copied, sent, moved to trash (with Undo)
- Background work people started and want to hear back from – uploads, syncs, exports (toast.promise)
- Errors that don't block the page, e.g. a sync that failed and can be retried later

### When not to use

- Errors in a form – show them next to the field
- Anything people must read or decide on – use a dialog or an inline banner
- Long-running progress with details – a progress panel or tracker fits better

### Usage

```tsx
import { Toaster, toast } from "@/components/ui/toaster-clean";

// Once, near the root of the app
export function App() {
  return (
    <>
      <Routes />
      <Toaster position="bottom-right" />
    </>
  );
}

// Anywhere – no hook or context needed
function save() {
  toast.success("Draft saved", { description: "Q3 Board Report · all changes kept" });
}

function remove(file: File) {
  trash(file.id);
  toast("File moved to trash", {
    description: file.name,
    action: { label: "Undo", onClick: () => restore(file.id) },
  });
}

function upload(file: File) {
  toast.promise(api.upload(file), {
    loading: { title: "Uploading report…", description: file.name },
    success: (res) => ({ title: "Report uploaded", description: `Shared with ${res.people} people` }),
    error: (err) => ({ title: "Upload failed", description: String(err) }),
  });
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| position | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"bottom-right"` | Corner or edge the stack sits in; new toasts come in from that edge |
| inline | `boolean` | `false` | Positions the stack inside the nearest positioned ancestor instead of the viewport |
| id | `string` |  | Only shows toasts sent with { toaster: id } – for a second, separate stack |
| duration | `number` | `4000` | Default time on screen in ms; each toast can override it, Infinity keeps it open |
| visibleToasts | `number` | `3` | Toasts visible at once; older ones wait (with a paused timer) until there's room |
| expand | `boolean` | `false` | Always shows the stack fanned out instead of on hover and focus |
| offset | `number` | `24 (20 inline)` | Distance from the edges in px; phones always use 12px gutters |
| gap | `number` | `10` | Space between toasts when fanned out, in px |
| hotkey | `string \| null` | `"F8"` | Key (KeyboardEvent.key or .code) that moves focus to the newest toast |
| hairline | `boolean` | `true` | A 1px line along the bottom that runs down with the timer and stops when it pauses |
| closeButton | `boolean` | `true` | Small close button on hover and focus – always visible on touch screens |
| label | `string` | `"Notifications"` | Name of the region for screen readers (the hotkey is added) |
| className | `string` |  | Extra class on the region |
| toast(title, options?) | `(ReactNode, ToastOptions) => ToastId` |  | Shows a plain toast; also toast.success, toast.error, toast.info and toast.loading. Returns the id |
| toast.promise(promise, messages, options?) | `<T>(Promise<T> \| () => Promise<T>, { loading, success, error }) => Promise<T>` |  | A loading toast that turns into success or error; each message is a title, { title, description } or a function of the result |
| toast.dismiss(id?) | `(ToastId?) => void` |  | Closes one toast, or all of them without an id |
| ToastOptions | `{ id?, description?, action?: { label, onClick }, duration?, icon?, toaster?, onDismiss? }` |  | Pass an existing id to update that toast in place (the timer restarts, the text crossfades). action.onClick closes the toast unless it calls event.preventDefault() |

### Keyboard

- F8: Moves focus to the newest toast and fans the stack out
- Tab: Goes from toast to toast, through their action and close buttons
- Esc: Closes the focused toast (or the newest) and moves focus to the next one; focus returns where it was after the last

### Accessibility

- The stack is a labelled region ("Notifications (F8)"); every toast is focusable
- New and updated toasts are read out in a polite status region – errors in an alert region, so they come first
- The timer pauses while the pointer or keyboard focus is in the stack and while the tab is hidden, so nothing vanishes mid-read
- Swiping is never the only way out: there's Esc and a named close button
- Icons are decorative; color is limited to the status icons (green, red, blue for info), the text says what happened

### Motion

- New toasts lift in from the edge; the ones behind move back, shrink a little and peek out
- Hover or focus fans the stack out into a list – every toast is measured, so positions and heights glide
- Promise toasts: the spinning arc closes into a ring while a check or cross draws in; the text crossfades and the card resizes
- Closed toasts fade and sink a few pixels while the rest of the stack moves up; swiped toasts fly out in the swipe direction, short swipes rubber-band back
- With prefers-reduced-motion everything switches instantly – only the spinner keeps turning

### Responsive

- 356px wide on larger screens; under 600px it spans the width with 12px gutters (and respects the home indicator)
- Touch: tap the stack to fan it out, swipe sideways or down to dismiss; close and action buttons get bigger hit areas
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Render <Toaster /> once; call toast() from event handlers or effects, not during render
- Use toast.promise for async work instead of separate loading and success toasts
- Keep titles to a few words and put details in description

### Requirements

- React 19

Related: notification-stack, progress-tracker, dropzone
