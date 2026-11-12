# Chat Composer, clean style (Pro)

Prompt composer with model picker, voice input, app connections and approval request

- Page: https://www.affectui.com/components/chat-composer
- Section: Components · Chat
- Install: `npx shadcn@latest add https://www.affectui.com/r/chat-composer-clean.json` (needs the Pro access key)
- Import: `@/components/ui/chat-composer-clean`

### When to use

- The main input of an AI assistant or agent that can act on connected tools
- Flows where the user has to grant extra permissions before a run

### When not to use

- Plain chat between people – a simple text field with a send button is enough
- Very narrow spaces below ~280px, where the toolbar labels get too small

### Usage

```tsx
import { ChatComposer } from "@/components/ui/chat-composer-clean";

export function Assistant() {
  return <ChatComposer onSend={(message) => console.log(message)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| placeholder | `string` | `"Start by typing..."` | Placeholder of the message field |
| models | `ChatModel[]` | `defaultModels` | Entries of the model picker (Auto, the Claude 5 models, GPT-5) – id, name, logo and an optional description; the first is selected |
| dictation | `string` | `"Draft a short update…"` | Demo transcript that appears word by word in gray while recording – replace with real speech-to-text |
| onSend | `(message: string, details: { model: string }) => void` |  | Called on send or Enter |
| onModelChange | `(model: ChatModel) => void` |  | Called when a model is picked |
| onAttach | `(item: string) => void` |  | Called with the entry picked in the plus menu – files, claude, folder (also opens the folder picker), goal, plan (toggles plan mode), skill, draw, documents or pdf |
| approval | `"ask" \| "auto" \| "full"` | `"ask"` | The approval mode to start with: Request approval, Approve for me or Full access |
| onApprovalChange | `(mode: ApprovalMode) => void` |  | Called when a mode is picked in the approval menu |
| onLearnMore | `() => void` |  | Called by “Learn more” in the approval menu |
| folders | `string[]` | `defaultFolders` | Folders in the “Work in a folder” picker at the bottom left; an empty list leaves it out |
| folder | `string` |  | The folder to start in – the row shows its name instead of “Work in a folder” |
| onFolderChange | `(folder: string \| null) => void` |  | Called when a folder is picked; null when the picked folder is picked again to leave it |
| apps | `ChatApp[]` | `defaultApps` | Apps in the “Connect apps” menu at the bottom right (Gmail, Slack, ClickUp) – id, name and logo; the first three show their marks in the row |
| connectedApps | `string[]` | `["gmail"]` | Ids of the apps that are connected to start with |
| onAppsChange | `(connected: string[]) => void` |  | Called when an app is connected or disconnected, with the ids of all connected apps |
| foot | `ReactNode` |  | Your own last row on the gray layer, in place of “Work in a folder” and “Connect apps” |
| tray | `boolean` | `true` | The gray layer with the folder and the apps. Turn it off once a chat has started: no folder to pick any more, the apps move into the plus menu |

### Keyboard

- Enter: Send the message
- Shift + Enter: New line
- Enter / Space / ↓: Open the menu of the focused button – plus, approval, model, folder or apps
- ↑ / ↓: Move through an open menu
- Home / End: Jump to the first or last entry of a menu
- Enter / Space: Pick the highlighted entry (in a menu); in the apps menu it connects or disconnects the app
- Esc: Close a menu and return to its button, or discard a recording
- Tab: Close a menu and move on from its button

### Accessibility

- Picked modes, models, folders and connected apps are announced through a polite live region
- The plus button opens a menu (menuitems, plan mode a menuitemcheckbox); approval, model and folder open listboxes; the apps menu uses menuitemcheckboxes; each button reports aria-expanded
- A long folder name shortens with an ellipsis – the full name is in its tooltip and in the picker
- Clicking anywhere on the white writing area focuses the message field; the last row sits on a gray layer under it
- Menus use aria-activedescendant, so screen readers follow the highlight; a closed menu leaves the layout

### Motion

- Picking an approval mode blurs the new icon and label into the button; Full access turns it red
- The menus morph out of the corner next to their button, open toward the side with more room and stay inside the visible frame; the plus menu spans the composer; the folder menu lines up with its button's left edge, the apps menu with its right edge
- A hover fill fades in under the pointer and glides between rows
- While recording, the heard words appear in gray and turn dark once confirmed; a dotted audio trace scrolls next to the controls
- All transitions collapse to instant changes with prefers-reduced-motion

### Responsive

- Fills its container up to 560px wide; fixed 13px type and 28px controls; below 400px the approval button keeps just its icon
- In the last row the folder's name shortens first, so “Connect apps” and its marks always keep their place on the right
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
