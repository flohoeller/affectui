# Dropzone (Pro)

Drag files in and watch them upload – fanning documents, colored type badges, progress with time left, errors with retry

- Page: https://www.affectui.com/components/dropzone
- Section: Components · Inputs
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/dropzone.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/dropzone-clean.json` (needs the Pro access key) – lands as `dropzone-clean.tsx`, import from `@/components/ui/dropzone-clean` – its docs: `dropzone-clean.md`
- Import: `@/components/ui/dropzone`

### When to use

- Uploading documents, images or media – attachments, imports, asset libraries, onboarding
- Several files at once, where people want to see what's done, what's still running and what failed

### When not to use

- A single avatar or logo – a simple picker with a preview is lighter
- Huge uploads that run in the background for minutes – show them in a separate transfer panel

### Usage

```tsx
import { Dropzone } from "@/components/ui/dropzone";

export function Attachments() {
  return (
    <Dropzone
      accept={[".pdf", ".png", ".jpg", ".xlsx"]}
      maxSize={25 * 1024 * 1024}
      onUpload={(file, onProgress) =>
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => onProgress(e.loaded / e.total);
          xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
          xhr.onerror = () => reject(new Error("Upload failed – connection lost"));
          xhr.open("POST", "/api/upload");
          xhr.send(file);
        })
      }
      onChange={(items) => setAttachments(items.filter((i) => i.status === "done"))}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| accept | `string[]` |  | Allowed extensions, e.g. [".pdf", ".png"]; any file when left out. Other files get a row with an error |
| maxSize | `number` | `25 MB` | Largest file in bytes; bigger files get a "Too large" row |
| onUpload | `(file: File, onProgress: (p: number) => void) => Promise<void>` |  | Uploads one file and reports progress from 0 to 1; reject to mark it as failed (the message is shown, Retry calls it again). Simulated when left out |
| onChange | `(items: UploadItem[]) => void` |  | Every change of the list: { id, name, size, status, progress, error?, file? } |
| hint | `string` |  | Text under the title; defaults to the accepted types and the size limit |
| autoplay | `boolean` | `false` | Plays a sample drop of four files – for previews and landing pages |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Reaches the drop area, then Retry and Remove in every row
- ↵: On the drop area: opens the file picker (Space works too)

### Accessibility

- The drop area is a button that opens the file picker, described by the accepted types and size
- Every row has a progress bar with its value; Retry and Remove are named after the file
- Finished, failed and rejected files are announced in a polite live region

### Motion

- Dragging files over the area fans the three little documents out, the outline turns solid blue and the title counts the files
- Rows grow in one after another; the bar fills in one solid color, a small check pops in when a file is done
- A failed row gives a short shake and its bar turns red; removed rows fold away
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container up to 520px; long file names are cut with an ellipsis
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: chat-composer, ai-answer, glass-folder
