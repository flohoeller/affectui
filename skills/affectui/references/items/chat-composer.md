# Chat Composer (Pro)

Prompt composer with model picker, voice input, app connections and approval request

- Page: https://www.affectui.com/components/chat-composer
- Section: Components · Chat
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/chat-composer.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/chat-composer-clean.json` (needs the Pro access key) – lands as `chat-composer-clean.tsx`, import from `@/components/ui/chat-composer-clean` – its docs: `chat-composer-clean.md`
- Import: `@/components/ui/chat-composer`

### When to use

- The main input of an AI assistant or agent that can act on connected tools
- Flows where the user has to grant extra permissions before a run

### When not to use

- Plain chat between people – a simple text field with a send button is enough
- Very narrow spaces below ~280px, where the toolbar labels get too small

### Usage

```tsx
import { ChatComposer } from "@/components/ui/chat-composer";

export function Assistant() {
  return <ChatComposer onSend={(message) => console.log(message)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| placeholder | `string` | `"Start by typing..."` | Placeholder of the message field |
| models | `ChatModel[]` | `defaultModels` | Entries of the model picker (Auto, Claude, ChatGPT); the first is selected |
| loadMs | `number` | `1300` | Duration of the “Request approval” loading state |
| dictation | `string` | `"Draft a short update…"` | Demo transcript that appears word by word in gray while recording – replace with real speech-to-text |
| onSend | `(message: string, details: { model: string }) => void` |  | Called on send or Enter |
| onModelChange | `(model: ChatModel) => void` |  | Called when a model is picked |
| onAttach | `() => void` |  | Called when the plus button is clicked – open your own picker here |
| onRequestApproval | `() => void` |  | Called when “Request approval” is clicked |
| folders | `string[]` | `defaultFolders` | Folders in the “Work in a folder” picker at the bottom left; an empty list leaves it out |
| folder | `string` |  | The folder to start in – the row shows its name instead of “Work in a folder” |
| onFolderChange | `(folder: string \| null) => void` |  | Called when a folder is picked; null when the picked folder is picked again to leave it |
| apps | `ChatApp[]` | `defaultApps` | Apps in the “Connect apps” menu at the bottom right (Gmail, Slack, ClickUp) – id, name and logo; the first three show their marks in the row |
| connectedApps | `string[]` | `["gmail"]` | Ids of the apps that are connected to start with |
| onAppsChange | `(connected: string[]) => void` |  | Called when an app is connected or disconnected, with the ids of all connected apps |

### Keyboard

- Enter: Send the message
- Shift + Enter: New line
- Enter / Space / ↓: Open the menu of the focused button – model, folder or apps
- ↑ / ↓: Move through an open menu
- Home / End: Jump to the first or last entry of a menu
- Enter / Space: Pick the highlighted entry (in a menu); in the apps menu it connects or disconnects the app
- Esc: Close a menu and return to its button, or discard a recording
- Tab: Close a menu and move on from its button

### Accessibility

- Loading, picked models, folders and connected apps are announced through a polite live region
- The approval button exposes aria-busy while it loads
- Clicking anywhere on the white card focuses the message field
- Model and folder pickers are listboxes, the apps menu uses menuitemcheckboxes – all with aria-activedescendant, so screen readers follow the highlight
- A long folder name shortens with an ellipsis – the full name is in its tooltip and in the picker

### Motion

- Requesting approval waves the hand, then morphs into the “Unrestricted access” pill
- The menus morph out of the corner next to their button, open toward the side with more room and stay inside the visible frame
- A hover fill fades in under the pointer and glides between rows
- While recording, the heard words appear in gray and turn dark once confirmed; a dotted audio trace scrolls next to the controls
- All transitions collapse to instant changes with prefers-reduced-motion

### Responsive

- Fills its container up to 680px wide; all sizes follow the width via container query units and stop growing at a compact maximum
- In the last row the folder's name shortens first, so “Connect apps” and its marks always keep their place on the right
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
