# affectUI catalog

Generated from the registry – every item with its slug, Free or Pro, and what it is. Read `items/<slug>.md` before using one.
Components install as `<slug>` (classic style) or `<slug>-clean` (clean style) where both exist.

## Components

### Agents

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Agent Checkpoints | `agent-checkpoints` | Pro | An agent's run as a line of checkpoints, like git for agents – rewind to any of them and a new attempt branches out of it, while the one it left fades back but stays |
| Agent Crew | `agent-crew` | Pro | A lead and its sub-agents as one live tree of cards – each card shows what the agent does right now, its context and tools, with handoffs running along the connectors |
| Agent Cursors | `agent-cursors` | Pro | Agents working in a document like teammates in a multiplayer editor – live pointers with names, suggestions typed letter by letter and comments beside the page |
| Agent Finder | `agent-finder` | Pro | A multi-agent run as a macOS Finder window – every agent a folder, every tool call a document, with Quick Look for what was sent and what came back |
| Agent Findings | `agent-findings` | Pro | A swarm of agents checking something – one calm row per agent with its progress, and their findings sliding into a short feed as they're found |
| Agent Flame Graph | `agent-flame-graph` | Pro | A multi-agent run's call stack as a flame graph – the orchestrator on top, then subagents and their LLM and tool calls, every block as wide as it took |
| Agent Fleet | `agent-fleet` | Pro | Several agents side by side – each card sums up its sub-agents, and a click opens its tree to the right while the last one folds back into its card |
| Agent Graph | `agent-graph` | Pro | Agents and the tools they call as a living network – a pulse along the link for every call and its answer, and agents that turn amber when they need you |
| Agent Handoff | `agent-handoff` | Pro | A task passed from agent to agent like a relay – at every handoff what went along to the next one, and what got lost on the way |
| Agent Inbox | `agent-inbox` | Pro | All your background agent tasks in one calm list – live status tags, filter tabs, and rows that unfold to the last steps with Approve, Reject, Retry or Open |
| Agent Issue Stack | `agent-issue-stack` | Pro | Issues your agents found or are working on, one card at a time – kind, pull request, priority, users touched and the agent on it, as a stack or a cycling strip |
| Agent Lanes | `agent-lanes` | Pro | Where every agent is right now – a live timeline with a lane per agent, tasks growing into “now”, hand-offs drawn between agents and approvals right on the block |
| Agent Ledger | `agent-ledger` | Pro | Everything an agent changed in your systems, each change with an undo – pointing at Undo shows what builds on it and what can't be taken back |
| Agent Loop | `agent-loop` | Pro | A run of agents working in steps – Plan, Build, QA, Review, Security – as a row of cards, with every time the run went back drawn as a counted arc underneath |
| Agent Metro Map | `agent-metro-map` | Pro | A multi-agent run drawn as a metro map – every agent a line, every step a station, lines meeting at an interchange where work is handed over, a train riding each one |
| Agent Monitor | `agent-monitor` | Pro | One agent at work, as a card – its current step with a clock and the bill so far, the finished steps with each tool's logo, and the exact command when it needs your OK |
| Agent Org Chart | `agent-org-chart` | Pro | An org chart of people and AI agents – people own agents, reporting lines run between them, and an escalation travels up to the person who owns the agent |
| Agent Overlap Map | `agent-overlap-map` | Pro | Where the work of people's AI agents collides – every agent a chip, every open conflict a badge with a curve to each agent involved, ranked by how urgent it is |
| Agent Plan | `agent-plan` | Pro | An agent's step-by-step plan to review before it runs – rename, drag to reorder, remove or add steps, then watch each one run with live timers and retry from a failed step |
| Agent Queue | `agent-queue` | Pro | The work waiting for your agents, and how fast it moves – jobs glide into worker slots and land in Done or Failed, while a depth chart shows the backlog build up and drain |
| Agent Recap | `agent-recap` | Pro | What the agents did while you were away – the night as a small chart with a peak per event, then a board of what needs you, what failed and what's done, acted on right on the card |
| Agent Router | `agent-router` | Pro | A router agent sorting incoming requests to the agents that handle them – a light runs to the chosen agent with a confidence, and unsure requests go to a person |
| Agent Sequence | `agent-sequence` | Pro | One agent run as a sequence diagram – a lifeline for you, every agent and every tool, with calls solid, replies dashed and parallel or retried messages in frames |
| Agent State Machine | `agent-state-machine` | Pro | One agent as a state diagram – every state a card, every transition a line with a count of how often the run took it, retries as loops and the current state glowing |
| Agent Steering | `agent-steering` | Pro | Steer an agent while it works – queue a note for the next step and watch it glide into the plan when the agent picks it up, or interrupt right away |
| Agent Timing | `agent-timing` | Pro | An agent run as a timing diagram – a signal line per agent that steps up when it thinks or calls a tool, with hand-offs drawn straight between rows |
| Agent Trail | `agent-trail` | Pro | The steps an agent works through, as one quiet trail – done steps with their time, the current one branching into live sub-steps, approvals waiting with a dashed ring |
| Agent Tree | `agent-tree` | Pro | Who started whom – an orchestrator and its sub-agents as a live tree, with status, cost and time on every card, costs rolling up each branch, and branches that fold to one line |
| Agent Workbench | `agent-workbench` | Pro | One agent at work: the person who asked, the agent with a work area, the files it was given and its tools as cards, joined by soft connectors with a light on the one in use |
| Approval Card | `approval-card` | Pro | An agent asks before it acts – risk badge, preview, Approve and Deny with shortcuts, a pausing countdown, and a smooth morph into a resolved row |
| Approval Gates | `approval-gates` | Pro | The approval requests of an agent run as a stack of cards – the one to decide now on top with the diff or arguments, approve, reject or change it, then the next rises |
| Autonomy Dial | `autonomy-dial` | Pro | How much an agent may do on its own – a three-stop dial, and its real actions gliding between “Runs on its own” and “Asks you first”, with a lock for what always asks |
| Away Summary | `away-summary` | Pro | The “While you were away” card for a chat thread – how long you were gone, what needs you, what failed and what's done, with one action per row |
| Collaboration Stream | `collaboration-stream` | Pro | What agents actually say to each other – a quiet chat showing who each message is from and for, handoffs and questions for you tagged, files as chips and a composer with @ |
| Commit Trail | `commit-trail` | Pro | One line per commit on a blue trail – message, a colored tag for the kind of change and how long ago, open for who wrote it, and merges that fold the commits they brought in |
| Conflict Radar | `conflict-radar` | Pro | Agents on their own branches at once, and where they collide – a row per file, a column per agent, each one's way in a sentence to pick from, and Merge once all are settled |
| Context Compaction | `context-compaction` | Pro | An agent's context window filling up and being compacted – a bar of slices as wide as their tokens, folding into one summary row, or by hand with Compact now |
| Context Map | `context-map` | Pro | What fills an agent's context window, as a living treemap – system prompt, tools, memory, files and chat as tiles that glide as it grows, and compaction squeezing old turns |
| Context Window | `context-window` | Pro | What fills the model's context, as a field of cells – hover a part to light it up, remove files, and compact the conversation while its cells shimmer and clear |
| Cost Waterfall | `cost-waterfall` | Pro | Where the money and tokens of an agent run go – every LLM call, tool call and sub-agent as a waterfall step, the most expensive on top, with a switch between cost and tokens |
| Critical Path | `critical-path` | Pro | An agent run's spans on a timeline, one lane per agent – the critical path that decides when the run ends in full tint, and drag a span to see a what-if |
| Decision Card | `decision-card` | Pro | An agent's question, asked the way Claude asks one – its own card above the chat composer with numbered options, Approve / Decline, previews and a row for your own words |
| Decision Table | `decision-table` | Pro | An agent deciding by a DMN decision table – the request on top, rules below checked row by row until the matching rule lights up with its outputs |
| Decision Tree | `decision-tree` | Pro | An agent stuck on a decision lays out its options as a tree – consequences of each branch, risky ones marked, its pick highlighted – and you choose a path or write your own |
| Deep Research Progress | `deep-research-progress` | Pro | An agent researching a question – the sources it finds on the left, the report taking shape section by section on the right, a line running from each source to the section it feeds |
| Delegate Board | `delegate-board` | Pro | Hand work to your agents by dragging it onto them – each agent previews its new “busy until” time, or switch to Auto and every new task goes to whoever is free first |
| Diff Timeline | `diff-timeline` | Pro | What an agent changed in a pull request, edit by edit – lines added and removed as two lines laid over each other, a diff bar per file, and every edit's diff on hover |
| Fallback Chain | `fallback-chain` | Pro | One request finding a model that answers, as a flow diagram – it branches to each model in fallback order, failed branches break red, the one that answers runs on to the response |
| Fan-out Grid | `fan-out-grid` | Pro | One agent hands a big job to many workers – every task a cell on a live grid that fills in as they get through it, with retries, failures, cost and the time left |
| Flow Builder | `flow-builder` | Pro | An automation drawn as a top-down flow you build in place – a + on every line adds a step, If / else forks into named paths, and a test run sends a light down the line |
| Guardrail Funnel | `guardrail-funnel` | Pro | The guardrails an agent's traffic passes through, as a funnel – input check, PII redaction, tool allowlist, output check – with how many each stage stopped and what it caught |
| Handoff Relay | `handoff-relay` | Pro | One task passed from agent to agent like a baton, played back live – every agent a tile with its pixel mark that fills in as the baton travels, and a log of the run |
| Handoff Swimlanes | `handoff-swimlanes` | Pro | Who does what in an agent run, and where work changes hands – a lane per person, agent and tool, handoffs as arrows, approvals as diamonds you can approve in place |
| Inline Diff | `inline-diff` | Pro | AI edits to prose shown inline – struck and added words you accept or reject one by one, with keys, a popover and undo |
| Judge Bracket | `judge-bracket` | Pro | How an LLM judge picks the best of several attempts, as a tournament – two answers at a time, the preferred one moves on, and every match opens both side by side with why |
| Memory Graph | `memory-graph` | Pro | An agent in the middle with what it remembers and the tools it can reach in a ring around it – every memory a card with its source, a light running to each tool it uses |
| Memory Panel | `memory-panel` | Pro | What the assistant remembers about you, grouped and editable – a master switch, category filters, and on every memory edit in place, pause or forget with Undo on the tray |
| Model Router | `model-router` | Pro | How a gateway splits its traffic across AI models – streaks of light into each model's line, as wide as its share; pick Cost, Balanced or Quality and the split and price change |
| Parallel Attempts | `parallel-attempts` | Pro | An agent tries the same task several ways at once and the best one wins – every attempt races as a row with its model and live bar, gets a score, and the best is picked |
| Permission Request | `permission-request` | Pro | An agent asks for one specific right – who, why and exactly what will happen – and you allow it once, for an hour or always; then it folds into one line with Revoke |
| Petri Net | `petri-net` | Pro | Agents working in parallel and waiting on each other, as a Petri net – tokens in places, steps that fire only when every input is ready, a person's step waiting for approval |
| Plan vs Actual | `plan-vs-actual` | Pro | An agent's plan against what really happens – every step's bar grows over its dashed planned ghost, overruns turn amber, and the expected finish moves away from the planned one |
| Rate Limit Planner | `rate-limit-planner` | Pro | Plan when your agents run so they stay under the API's rate limit – the day's load as a line chart, one row per run to drag; Spread out lowers the peak, overflow hatched red |
| Reasoning Summary | `reasoning-summary` | Pro | How an agent spent its time on one answer, in one small card – a bar with a segment per step, the time per kind, the models that took part and the sources it searched |
| Repo Map | `repo-map` | Pro | A codebase as a treemap with coding agents working on it – every file a tile as large as its lines, each agent hopping from file to file and coloring what it edits |
| Response Stream | `response-stream` | Pro | One agent answer through every state – words streaming in, stopped and continued from the exact word, failed and retried from there, done – with steer and queued messages |
| Review Center | `review-center` | Pro | A focused workspace for what your agents want to do – the queue sorted by risk, one item at a time with the shaky spans marked, and Approve, Edit, Reject and Skip on single keys |
| Root Cause Tree | `root-cause-tree` | Pro | How an agent finds out why a run failed, as a fault tree – it checks one hypothesis after another, rules some out, confirms the cause, and the way up to the failure lights up |
| Run Controls | `run-controls` | Pro | Every control a running agent needs, in one composer – stop it, resume from the word it stopped at, retry, steer it mid-answer or queue what's next, with Chat or Act |
| Running Now | `running-now` | Pro | A live status of background agent tasks for a header or sidebar – one quiet pill that opens into the tasks with their steps, Pause and Resume, and Open on the ones waiting for you |
| Scheduled Runs | `scheduled-runs` | Pro | Agent tasks sorted into a week of sessions – each session has a usage limit, small tasks fill the gaps and big ones are split across sessions |
| Token Flow | `token-flow` | Pro | Where an agent's tokens and cost go, as a Sankey diagram of cards – system prompt, tool results and memory flow into the models and on into answered, retried or cancelled |
| Tool Access Map | `tool-access-map` | Pro | An agent in the middle with every tool it can reach around it – which ones it used, which failed and which it calls right now; open a tool for its calls and replay one on its own |
| Tool Call Card | `tool-call-card` | Free | An agent's tool call in one line – live timer, status and summary, folds open to highlighted arguments and result with copy, retry on errors and a group that sums them up |
| Tool Calls Network | `tool-calls-network` | Pro | Every LLM and tool call of an agent run as rows, like the Network tab of DevTools – a waterfall per call, filters, sorting, and each call's request, response and retries as JSON |
| Trace Waterfall | `trace-waterfall` | Pro | Where the time and money of an agent run go – every LLM call, tool call and sub-agent as a bar on a live timeline, with cost per step and the slowest call marked |
| Voice Session | `voice-session` | Pro | A live voice call with an agent – both voices as audio waves with the pause between them measured, the words as they are spoken, voice-to-voice latency split up against a budget |

### Chat

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| AI Answer | `ai-answer` | Pro | Streamed answer with source cards, citation chips that preview their source, copy, regenerate, feedback and follow-ups |
| Chat Composer | `chat-composer` | Pro | Prompt composer with model picker, voice input, app connections and approval request |
| Cited Answer | `cited-answer` | Pro | An AI answer wired to its sources – point at a citation to light up its sentence and source, click to unfold the quoted passage with the matching words marked |
| Comment Thread | `comment-thread` | Free | One comment with replies – an assistant reports what it did, folds open details and answers @mentions |
| Comments Panel | `comments-panel` | Pro | Comment feed with filters, runnable /edit commands, resolve and a composer |
| Message Actions | `message-actions` | Free | The quiet bar under an AI message – copy turns into a check, regenerate spins and unfolds a version switcher, thumbs pop and ask why, read aloud becomes a tiny equalizer |
| Model Picker | `model-picker` | Pro | The model menu of an AI chat – point at a model and its speed, quality and cost bars fill, switch on extended thinking and its effort unfolds, with first-token time and price |
| Thinking Loader | `thinking-loader` | Free | A small working pill for AI replies – an eight-ray spinner and a shimmering label that rolls through phases and settles on a check |
| Thinking State | `thinking-state` | Pro | AI working panel with a live timer, searched sources and thinking steps that appear one by one |
| Writing Assistant | `writing-assistant` | Pro | AI chat card with a soft gradient glow, suggestions, streaming replies and live voice dictation |

### Data display

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Avatar | `avatar` | Free | A person's picture or initials on a soft color of their own – rounded squares for workspaces, an agent's pixel mark, a status dot and an overlapping group ending in +N |
| Badge | `badge` | Free | A small status label that carries the color – six soft tones, a leading dot or icon, a live dot that pulses while something runs and a round count up to 99+ |
| Breakdown Chart | `breakdown-chart` | Pro | Stacked bar chart with measure, slice and segment pickers, a hover breakdown and a linked table |
| Change Summary | `change-summary` | Free | What moved since last time – one metric per row with a colored trend |
| Compact Breakdown | `compact-breakdown` | Pro | A total split into its parts in one small card – numbers roll, the bar glides and the ranked rows trade places when the period changes |
| Data Table | `data-table` | Pro | Spreadsheet-style table: select cells and ranges, edit in place, copy and paste, undo and sort |
| Experiment Card | `experiment-card` | Pro | An A/B test in two lines that quietly unfolds on hover – variants linked to a tiny chart, a metric switch with rolling numbers, and a winner you pick with a click |
| Hover Card | `hover-card` | Free | A preview of what a link or name points to – opens after a short rest of the pointer or on keyboard focus, stays while you move into it, never on touch, flips to stay on screen |
| KPI Chart | `kpi-chart` | Pro | Metric card with a multi-line chart and a tooltip that follows the pointer |
| Metering Chart | `metering-chart` | Pro | Usage per day as soft gradient bars drifting from blue to lilac, with a live bar for today that keeps growing, a Real-time badge and rolling totals |
| Model Usage | `model-usage` | Pro | How much each AI company's models were used – one stacked bar per company with a segment per model, switch between tokens, cost and requests, and see what it all went into |
| Resizable | `resizable` | Free | Panes side by side or stacked with a line between them you can drag – sizes in percent, minimum and maximum sizes, panes that fold away, and full keyboard control on the handle |
| Scroll Area | `scroll-area` | Free | A box that scrolls the browser's own way with a slim scrollbar of its own – it shows on hover and while scrolling, with a draggable thumb, both directions and soft fades |
| Separator | `separator` | Free | A thin line between groups – across or upright between tools, an optional word in its middle like "or" or "Earlier", decorative or a real separator for screen readers |
| Stat Card | `stat-card` | Pro | One number with its label, how it changed – green or red, lower can be better – and room for a chart below or beside it; numbers roll, the card can be a link |
| Tree View | `tree-view` | Free | A nested list of folders and files or any hierarchy – branches that open with a chevron, indent guides, one selected row, and arrow keys and type-ahead as in a WAI-ARIA tree |
| Trend Chart | `trend-chart` | Pro | The chart on its own for any card or layout – line, area, bars or a sparkline from the same data, with a tooltip and this period against the last |
| Usage Meter | `usage-meter` | Pro | Plan usage and AI credits – a stacked credits meter by category, daily sparkline, limits and a button that speaks up near the limit |

### Inputs

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Billing Schedule | `billing-schedule` | Pro | Build a billing phase – start date, duration, products with repeats and timing, discount, minimum and live totals |
| Checkbox | `checkbox` | Free | A real checkbox with a label and a second line, a some-of-them state for Select all, an error and a card row – the check draws itself |
| Color Picker | `color-picker` | Free | A swatch button that opens a color card – saturation, brightness, hue and optional opacity, a hex field that also reads rgb(), and named presets |
| Combobox | `combobox` | Pro | Pick one or many from a searchable, grouped list – chips with avatars, highlighted matches, create-on-the-fly and full keyboard support |
| Date Picker | `date-picker` | Free | Pick one day in the Text Field's look – a month in a small card, today marked, days outside min and max or ruled out stay visible, full keyboard control and the locale's own week |
| Date Range Picker | `date-range-picker` | Pro | Presets and two calendars with a hover preview, comparison with the previous period or year, full keyboard control |
| Dropzone | `dropzone` | Pro | Drag files in and watch them upload – fanning documents, colored type badges, progress with time left, errors with retry |
| Filter Menu | `filter-menu` | Free | Grouped filters with removable chips, collapsible checkbox groups, Clear all and full keyboard control |
| Form Field | `form-field` | Free | The frame around any control – label with a required mark or Optional, a hint, an error in its place and a count, all wired up with ids and aria |
| Integration Settings | `integration-settings` | Pro | Settings card for a connected service – on/off switch, API key, validated site address, time zone and a save bar |
| Number Input | `number-input` | Free | A field for one number – − and + that repeat while held, arrow keys and Page Up / Down, min, max and step, a unit like tokens or %, formatted for the locale |
| OTP Input | `otp-input` | Free | The verification code field done right – a gliding focus ring, paste and SMS autofill, a calm shake on errors and a morph into Verified |
| Prompt Library | `prompt-library` | Pro | Saved prompt templates with variables – type straight into the sentence, watch the finished prompt assemble below, and use it once every variable is filled |
| Rating | `rating` | Free | Stars or thumbs up and down for an AI answer – hover previews, a press sets it and a second press clears it, arrows in one tab stop, read-only with halves ("4.5 out of 5") |
| Select | `select` | Free | Pick one option in the Text Field's look – icons and a second line per option, a gliding highlight, type-ahead and a list that never gets cut off |
| Stepper Form | `stepper-form` | Pro | A multi-step flow for onboarding and setup – steps that fill and check off, sliding steps, a card that morphs to each step, inline validation and a success state |
| Switch | `switch` | Free | On or off for things that apply right away – label and second line, at the start or across a settings row, a thumb that stretches as you press it |
| Tag Input | `tag-input` | Free | Several values in one field as chips – paste a whole list, a check per value, duplicates flash, Backspace and arrow keys to edit |
| Text Area | `text-area` | Free | The multi-line twin of the Text Field – grows with the text, a character count, a button for more room and ⌘ Enter to send |
| Text Field | `text-field` | Free | One input for every form – label, hint and error in place, prefix and suffix, clear, show-password and copy buttons, a character count |
| Time Picker | `time-picker` | Free | A time of day you type or pick – a list every few minutes with a gliding highlight, 12 or 24 hours by locale, min and max, and typing that understands 930, 9:30 pm or 21.30 |

### Navigation

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Breadcrumb | `breadcrumb` | Free | Where a page sits and the way back up – links with quiet separators, the current page last, a long middle folded into a … menu, long names shortened with the full one on hover |
| Command Menu | `command-menu` | Pro | Search and run anything from one field – tool actions with logos and ⌘1–⌘5, everyday commands with icons |
| Context Menu | `context-menu` | Free | The menu a right-click opens, right at the pointer – a long press on touch, Shift F10 from the keyboard, with icons, shortcuts, checks, red items and submenus |
| Dropdown Menu | `dropdown-menu` | Free | Actions and choices behind any trigger – icons, shortcuts, checks, red items and submenus, a gliding highlight, type-ahead and the full menu keyboard |
| Integration Picker | `integration-picker` | Pro | Integrations page of a command menu – search, a list of services and the picked one with its connection on two tiles |
| Pagination | `pagination` | Free | Pages of a long list – the range you see, previous and next, page numbers with … between them and rows per page, tabular numbers that keep the row still from 1 page to 10,000 |
| Popover | `popover` | Free | A small floating card attached to its trigger – a title and quiet line, any content, flips to stay on screen, closes on a press outside or Escape and hands the focus back |
| Profile Menu | `profile-menu` | Free | Account card with the signed-in user, menu actions and profile setup progress |
| Segmented Control | `segmented-control` | Free | Switch between two to six options – a raised pill or underline that glides, stretches a little and can be dragged across, with icons, counts and badges |

### Buttons

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Button | `button` | Free | Primary, secondary, ghost and destructive buttons with icons, sizes and a shimmering loading state |
| Icon Button | `icon-button` | Free | A square button that is only an icon – ghost, outlined or solid, two sizes, a pressed state for toggles and its label as the tooltip |
| Reaction Bar | `reaction-bar` | Free | Like, comment, repost and share in one pill – icons pop and fill, counts roll in digit by digit |
| Toggle Group | `toggle-group` | Free | A row of toggle buttons – several on at once or one that can be cleared, labels or icons, a tray or separate chips, one tab stop with arrow keys |

### Cards

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Card | `card` | Free | The card every screen is built from – header with title, quiet line and an action, content and a footer, the whole card a click target and a gray fill when selected |
| Email Draft | `email-draft` | Free | Agent-written email for review – switch recipient and tone, edit inline, remove the attachment, send or discard with undo |
| Project Card | `project-card` | Pro | A two-line project summary that quietly unfolds on hover – a progress ring with one segment per subtask, a people filter and a status picker, all linked by hover |
| Smart Recommendation | `smart-recommendation` | Free | Suggestion card with a confidence signal, alternatives to switch to and accept with undo |
| Tips Panel | `tips-panel` | Free | Grid of short tips with one action each – taken tips turn into a done state |

### Text

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Code Block | `code-block` | Free | Code to read and copy – a header with the file name or language and a copy button, line numbers, highlighted lines, long lines that scroll inside and a small built-in colorizer |
| Kbd | `kbd` | Free | A key chip for shortcuts – one key or a combo in one chip, ⌘ on a Mac and Ctrl elsewhere from a single mod key, spelled out for screen readers |

### Feedback

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Decision Inbox | `decision-inbox` | Free | Open decisions with two quick answers each – answered ones confirm and fold away |
| Dialog | `dialog` | Free | A modal window on a dimmed backdrop – content that scrolls under a fixed header and footer, focus kept inside, a sheet on phones, and an AlertDialog to confirm with a red button |
| Empty State | `empty-state` | Free | What a list, table or panel shows while it has nothing yet – an icon on a soft tile, a title, one line and a button for the first step, framed or bare |
| Notification Stack | `notification-stack` | Free | Notice cards stacked behind each other – dismiss the front one to reveal the next |
| Progress Tracker | `progress-tracker` | Free | Onboarding checklist with an animated progress bar, ticks that draw themselves and auto play |
| Setup Guide | `setup-guide` | Pro | Onboarding panel with a progress bar and collapsible task groups that strike through when done |
| Skeleton | `skeleton` | Free | Gray shapes in the exact size of the content they stand in for – a soft sheen sweeping across all of them, and a Loading wrapper that fades in late so fast loads never flash |
| Spinner | `spinner` | Free | A small turning arc for work that runs right now – a faint ring in the text color, any size, inside a button or a status row, announced only when it has a label |
| Toaster | `toaster` | Pro | Calm toasts from anywhere – a stack that fans out on hover, promise toasts that morph from spinner to check, swipe to dismiss |
| Tooltip | `tooltip` | Free | A small dark label for one control – shows on hover after a short wait and at once under keyboard focus, neighbours follow instantly, an optional shortcut inside, flips on screen |

## Screens

### App screens

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Agent / Activity | `agent-activity` | Pro | What your agent did – every step as a sentence with its app's logo, who let it, grouped by day, and Undo while it can still be taken back |
| Agent / Agents | `agents` | Pro | Your team of agents in one place – calm cards with each agent's pixel mark, role and status; one opens on the right with its runs, and New agent draws the mark as you type |
| Agent / Inbox | `inbox` | Pro | What your orchestrator needs from you, one question at a time – pick an option, a variant or approve, send it in a keystroke and the next one glides in |
| Agent / Inbox Board | `agent-inbox-board` | Pro | Every background task your agents work on, as a board – Needs you, Running, Done – with cards that open on the right to approve, retry or open |
| Agent / Memory | `agent-memory` | Pro | What your agent knows about you and your work – grouped by where it applies, with where each came from and was used; what it picks up on its own waits for your OK |
| Agent / Model Usage | `agent-analytics` | Pro | How a project's agents use AI models – runs, success rate and tokens in one strip, tokens by model as a line per model, and every model as a row with its share, cost and last run |
| Agent / Orchestration | `agent-orchestration` | Pro | A live multi-agent run as a tree on a canvas – watch work flow to the running agents, follow every call in the trace below and open an agent for its tasks, context and cost |
| Agent / Permissions | `agent-permissions` | Pro | What your agent may do without asking – one choice (Careful, Balanced, Hands-off) in plain words, the apps it works in, red lines that always ask, and each app's actions |
| Agent / Run Detail | `agent-run-detail` | Pro | One agent run, step by step – thinking, tool calls, sub-agents and failures as bars on one time axis, with time, cost and tokens on top and what went in and out of each step |
| Agent / Schedules | `agent-schedules` | Pro | What your agent does again and again – the hours around now on one line, each run a mark that fills while it runs, and every schedule with its rhythm, next run and a pause switch |
| Agent / Skills | `agent-skills` | Pro | What your agent knows how to do – your skills as calm cards with a switch, skills to discover and install, and each skill with its recent runs, when it steps in and what it needs |
| Agent / Tasks | `agent-tasks` | Pro | Your work as tasks, not agents – a calm list grouped by project, each row a ring and where it is in words, and a click opens what happened so far and what it made |
| Agent / Thread | `agent-thread` | Pro | One conversation with your orchestrator – plain text with small task and decision cards, parallel tools folded into one line, and it keeps working through a dropped connection |
| Agent / Tool Calls | `agent-tool-calls` | Pro | One agent and the tools it can call, as an org chart – see which one it calls right now, solve what failed, pause or connect tools, and every call below with what went in and back |
| Agent / Usage | `agent-usage` | Pro | What your agent costs – the month added up day by day against the budget, where it lands at this pace in one plain line, and where it went by project or model |
| AI Chat / Agent Run | `ai-chat-agents` | Pro | A narrow chat beside the agents working on your prompt – watch each one's steps on a dot grid; when one gets stuck it says so in the chat and you answer right there |
| AI Chat / Agents | `agent-chat` | Pro | Chat with an orchestrating agent, the agents at work, and a brief to fill in beside it |
| AI Chat / Double Sidebar | `agent-chat-rail` | Pro | A plain assistant chat with web search in a double sidebar, like Codex and ChatGPT – icons on the page, the chats with a project switcher, and what it found on the right |
| AI Chat / Overview | `assistant-overview` | Pro | The AI workspace start page with your numbers under the composer – activity day by day, recent chats, usage, the files it made and this month against the last |
| AI Chat / Progress | `agent-chat-progress` | Pro | A plain chat with what the assistant is doing beside it, part of the page – its progress step by step, what it made, and the uploads, apps, web search and skills it used |
| AI Chat / Revenue Analyst | `ai-chat-revenue` | Pro | A chat that answers with charts – ask about revenue and get KPI cards and a weekly line against last year, split by region or a forecast with its likely range |
| AI Chat / Run | `agent-run` | Pro | One autonomous agent run: the plan ticking through its steps, the tool calls, an approval it waits on and the draft it wrote |
| AI Chat / Spend Planner | `ai-chat-spend` | Pro | A chat about what AI costs you – spend by provider and model, the weekly trend and a plan to play with: move three levers and the savings and the forecast follow |
| AI Chat / Start | `assistant-home` | Pro | AI assistant start page: greeting, prompt box with tools, connected apps and suggestions |
| AI Search / Prompt Explorer | `prompt-explorer` | Pro | What people ask AI assistants – type a prompt on a soft gradient hero and see related searches with their volume, analyse them, and browse popular and trending keywords |
| AI Search / Regions | `brand-regions` | Pro | Where a brand shows up in AI answers, country by country – a world map shaded by visibility, share of voice or sentiment, with the regions ranked beside it |
| Analytics | `analytics` | Pro | Revenue dashboard: key figures, revenue by channel, breakdown, top products and weekly trends |
| App Shell Flat | `app-shell-flat` | Pro | The App Shell laid flat – gray sidebar, an edge-to-edge page and the work area beside it, split by single hairlines |
| App Shell Inset | `app-shell` | Pro | Collapsible sidebar with workspace, menu, projects and account, and a resizable work area on the right – tools, browser and suggested sources – the frame every screen sits in |
| CRM | `crm` | Pro | Company list with pipelines, open views as tabs and an editable data table |
| Evals | `evals` | Pro | Prompt evaluation dashboard: pass rate by version, reviewable prompt changes and test cases you can re-run |
| Folders / Detail | `folder` | Pro | Inside one folder: breadcrumbs, file cards with previews, and an empty state |
| Folders / Overview | `files` | Pro | Folder overview with tabs, search, sort, grid/list toggle and file templates |
| Integrations | `integrations` | Pro | App directory with a sticky header, categories, search and connect states |
| Kanban Board | `kanban` | Pro | Issues on a board by priority – drag cards between columns, switch to a list, filter and sort |
| Onboarding | `onboarding` | Pro | First-run flow of an AI workspace: workspace setup, tool connections, team invites and a first agent, with a getting-started checklist |
| Onboarding / Brand | `onboarding-brand` | Pro | Second step of setting up an AI assistant: the company's name and the short forms customers use, suggested from the website, while the assistant's card fills in as you type |
| Onboarding / Ready | `onboarding-ready` | Pro | Last step of setting up an AI assistant: a quiet summary of what it learned from, its name, voice and handover, each with Edit, before the dashboard comes alive |
| Onboarding / Tone | `onboarding-tone` | Pro | Third step of setting up an AI assistant: a short form for its name, tone, reply length and who takes over when it isn't sure, with a test chat that answers in that tone |
| Onboarding / Website | `onboarding-website` | Pro | First step of setting up an AI assistant: the website, docs and help center it should learn from as chips, while the dashboard shows each domain landing in its Knowledge table |
| Settings / Billing | `settings-subscription` | Pro | Billing in the settings: the plan with the upcoming bill and usage, plans with monthly or yearly pricing and an add-on, billing address and card, invoices and cancel |
| Settings / General | `settings-general` | Pro | Workspace settings with a settings sidebar: icon, name and address as rows, a company context for the assistant and a danger zone that asks for the name |
| Settings / Models | `settings-models` | Pro | Model settings with a settings sidebar: default chat and image models, every provider's models grouped by hosting region with a switch each, custom endpoints and your own API keys |
| Settings / Notifications | `settings-notifications` | Pro | Notification settings with a settings sidebar: a daily digest with its time, a table of notification types by email, mobile, both or inbox only, and quiet hours at night |
| Settings / Preferences | `settings-preferences` | Pro | Personal preferences with a settings sidebar: default models with Auto, language and appearance, chat tools as tiles, custom instructions and the memories it kept |
| Settings / Privacy | `settings-privacy` | Pro | Privacy settings with a settings sidebar: switches for analytics and training on chats, active sessions to sign out, shared chats and a danger zone to export or delete every chat |
| Settings / Profile | `settings-profile` | Pro | Profile settings with a settings sidebar: picture, name, role and email as rows, time preferences, personal context for the assistant and the password |
| Settings / Security | `settings-security` | Pro | Security settings with a settings sidebar: email domains to verify, sign-in rules with SSO and two-step verification, an IP allowlist and a danger zone that signs everyone out |
| Settings / Teams | `settings-members` | Pro | Members and teams in the settings: seats at a glance, search, role filter, export and invite, members with role, plan and usage, bulk changes, and teams |
| Workflow Builder | `workflow-builder` | Pro | Nodes on a canvas joined by curves – drag them in from a palette, set each one up, then run the workflow and watch every step light up |

## Blocks

### Feature sections

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Agent Gallery | `agent-gallery` | Pro | Slim gradient panels with one open product screen in the middle – pick a panel and it glides open |

### Integrations

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| App Directory | `app-directory` | Pro | Browse, search and connect integrations – categories, filters and app cards with a connect flow |

### Productivity

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Client Context | `client-context` | Pro | A client workspace with live numbers and a shared context timeline – switch clients, search, filter and add notes or files |
| Task Board | `task-board` | Pro | Kanban board with drag and drop, quick add, a detail panel, search, label filters and a compact view |

### Billing

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Invoice & Credit Note | `invoice-credit` | Pro | An invoice and its credit note stacked like paper – switch between them, pick lines to credit, adjust amounts and issue |

### Analytics

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| KPI Board | `kpi-board` | Pro | The top of a dashboard – three trend cards, an overview chart that compares this period with the last, and a focus card; every number rolls when the range changes |
| Metrics Dashboard | `metrics-dashboard` | Pro | Sales overview – KPI cards pick the metric, one Trend Chart switches between area and bars, with top products and channels – built from Stat Card and Trend Chart |
| Revenue Chat | `revenue-chat` | Pro | A chat that answers with charts, on its own – KPI cards, a trend against last year, a split by region or a forecast; drag across a line or click a bar to ask about just that part |

### Agents

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Live Session | `live-session` | Pro | Work with a team of agents while they work – their conversation in the middle, the team's plan ticking off beside it and the shared context under it |
| Mission Control | `mission-control` | Pro | All agents at a glance – what happened since you looked on top, who runs under whom in the middle and what needs you on the side, with one filter for all three |
| Mission Timeline | `mission-timeline` | Pro | All agents at a glance on one clock – what happened since you looked, every agent on its own lane and what needs you on the side, with one filter for all three |
| Run Inspector | `run-inspector` | Pro | One agent run on one screen – who started whom as a live tree, every agent's calls as small bars on its card, and a click opens a call with its error right under it |

### Social proof

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Logo Marquee | `logo-marquee` | Free | The endless “Trusted by” strip – a seamless loop that eases to a stop on hover, scrubs with inertia and lifts the hovered logo to colour |
| Testimonial Wall | `testimonial-wall` | Free | The landing-page wall of quotes – columns that scroll endlessly in opposite directions, ease to a stop on hover and scrub with inertia |

### Pricing

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Pricing Plans | `pricing-plans` | Pro | Pricing section with a monthly / yearly switch, three plan cards and collapsible details |

## Illustrations

### Card illustrations

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Agent Team | `agent-team` | Free | A prompt types itself and branches out into three agents, each with a role and overlapping tool logos |
| Cover Flow | `cover-flow` | Free | Browse covers in 3D – drag, flick or scrub the row, it springs to the nearest cover; images drift in their frames over a soft reflection |
| Empty Calendar | `empty-calendar` | Free | Stack of calendar cards marked empty, fanning out on hover |
| Enrichment Orbit | `enrichment-orbit` | Free | Grok tile inside two rings with comets and data nodes orbiting around it |
| Frost Cloud | `frost-cloud` | Free | A frosted white cloud with eyes cut out of it, on a blue or red-orange sky – it floats, turns to look around, blinks, follows the pointer and bounces with a wink when clicked |
| Ghosted Chat | `ghosted-chat` | Free | Unanswered chat messages marked as read, with a thumbs-down reply on hover |
| Glass Folder | `glass-folder` | Pro | Glassy blue folder with documents behind a frosted pocket that tips open on hover |
| Glow Cloud | `glow-cloud` | Free | A glowing cloud with eyes in red-orange or blue – it floats, turns to look around, blinks, follows the pointer and bounces with a wink when clicked |
| Integration Grid | `integration-grid` | Free | Honeycomb-like wall of integration logos around a bright centre tile with your product mark, fading out toward the edges |
| Layer Stack | `layer-stack` | Free | Isometric stack of five layers with a list beside it – the chosen entry lifts its layer out in color |
| Lead Sourcing | `lead-sourcing` | Free | ChatGPT tile linked to Gmail and Grok, with a shine running along the connection |
| Logo Cluster | `logo-cluster` | Free | Your mark on a white disc in the middle – company logos bounce out of it and settle around it |
| Model Orbit | `model-orbit` | Free | AI model makers evenly around a slanted track – app tiles leaning back with it and blue beams arcing to a hub with the agent's pixel mark; point at a logo for its name |
| Model Wheel | `model-wheel` | Free | AI model names on a turning drum – the rows bend away at the edges and each model lands on a soft gray fill |
| Outreach Branches | `outreach-branches` | Pro | Lines branching out to Gmail, Slack and Notion with colored pulses flowing down |
| Side Folder | `side-folder` | Free | Glassy blue folder on its side, documents sliding out to the right as the pocket swings open on hover |
| Tab Overload | `tab-overload` | Free | Overlapping browser windows where the highlight follows the hovered tab |
| Team Invite | `team-invite` | Free | Connected teammates – a cursor drags a new one into the empty slot, the line turns solid and they go online |

### Maps

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| DACH Region | `region-dach` | Free | DACH map with fading neighbours and a pastel band along the border, switchable to the US, China, India, Brazil or Japan |
| World Map Continental | `world-map` | Pro | World map with one highlighted continent and a pastel band along its coastline, switchable between all six |

### Product scenes

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Glow Keyboard | `glow-keyboard` | Pro | AI chat input that types itself over a glass keyboard – every key press sends a wave up the gradient floor |
| Inspect Agent Card | `inspect-agent-card` | Pro | An agent card seen like a selection in a design tool – tilted back, with a blue frame, spacing numbers and a red guide walking through its rows |
| Inspect Composer | `inspect-composer` | Pro | A chat composer seen like a selection in a design tool – tilted back, with a blue frame, spacing numbers and a red guide walking through its rows |
| Integration Beam | `integration-beam` | Free | Your product between the tools it connects – light pulses flow along curved beams, hover to focus a tool, click to pause it |
| Integration Flow | `integration-flow` | Pro | Integration pills rotating along a dashed arc, each beaming its data into a central analysis hub |
| Model Menu | `model-menu` | Pro | A model picker – DeepSeek, GPT, Claude, Gemini and more with their marks, a pink band gliding to the picked one, its right edge and foot fading into the page |
| Progress Pill | `progress-pill` | Pro | An agent building a report as a slim pill – its pixel mark, the title and how far it is, the step it's on as a subtitle, a thin bar with a shimmer, a soft color glow beneath |
| Project Flow | `project-flow` | Pro | Animated scene of a client task branching into subtasks, notes and assigned roles |
| Voice Capture | `voice-capture` | Pro | A dictation panel while someone speaks – the voice in a quiet well as thin bars rising and falling with the loudness, the time ticking, a soft color glow beneath it |
| Voice Orb | `voice-orb` | Pro | The face of a voice assistant – a sphere of dots that breathes, catches sound, collapses into a spinning ring while thinking and ripples when it speaks |

## Motion

### Transitions

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Blur Crossfade | `blur-crossfade` | Pro | Swaps content with a soft blur while the box glides smoothly to the size of what comes next |

### Backgrounds

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Gradient Floor | `gradient-floor` | Pro | A blurred colour gradient that glows up from the bottom edge – two layers that drift and morph |
| Grid Background | `grid-background` | Free | A fine line grid that drifts slowly behind your content and fades out towards the edges |

### Text

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Gradient Text | `gradient-text` | Pro | Letters cut from a liquid, ever-flowing gradient – the color sweeps across the word the first time it's seen |
| Text Reveal | `text-reveal` | Free | Text that arrives word by word or letter by letter – each piece rises out of a soft blur as it scrolls into view |

### Numbers

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Number Ticker | `number-ticker` | Free | Odometer-style numbers – every digit rolls to its new value and counts in from zero when it scrolls into view |

### Loaders

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Shimmer Loader | `shimmer-loader` | Free | Skeleton blocks that share one soft light sweep, plus shimmering text for “Thinking…” states |

### Hover

| Item | Slug | | What it is |
| --- | --- | --- | --- |
| Tilt Card | `tilt-card` | Pro | A card that tilts in 3D towards the pointer, with a soft glare that follows it and a smooth spring back |
