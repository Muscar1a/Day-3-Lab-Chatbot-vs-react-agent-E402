# STYLING.md — Editorial Circuit Chatbot UI

## 1. Purpose

This document defines a reusable visual system for a chatbot website inspired by an editorial control panel, technical blueprint, and retro-futurist document interface.

The design must feel:

- structured, analytical, and information-dense;
- editorial rather than glossy;
- technical without looking like a developer console;
- playful through geometry and diagram-like details;
- readable and calm despite strong visual framing.

This is a **generic design specification**. It should guide any AI or developer implementing the interface in React, Vue, Svelte, Flutter Web, or plain HTML/CSS.

---

## 2. Design Concept

### Visual identity

Use a light blueprint-blue canvas with dark navy framing, off-white content surfaces, and restrained coral accents.

The interface should resemble a combination of:

1. an editorial page-layout system;
2. a technical process diagram;
3. a modular control dashboard;
4. a contemporary chatbot workspace.

### Core visual language

- Strong dark outlines around panels and controls.
- Rounded rectangular frames with modest corner radii.
- Pill-shaped navigation and filter controls.
- Thin connector lines, nodes, labels, and arrows used as secondary decoration.
- Large readable headings paired with compact metadata.
- Mostly flat surfaces; shadows are subtle and functional.
- Coral is reserved for active states, warnings, progress, and primary actions.

Do not imitate the reference image literally. Preserve the **systematic visual grammar**, not its exact composition.

---

## 3. Non-Negotiable Rules

1. **Readability comes before decoration.** Diagram lines, nodes, and annotations may never overlap important text or controls.
2. **Every major region must be visibly framed.** Use borders, spacing, or background contrast to show hierarchy.
3. **Use one dominant accent color.** Coral is the primary accent. Blue-gray tones are secondary.
4. **Avoid generic glassmorphism.** Surfaces should be opaque or nearly opaque.
5. **Avoid excessive gradients.** A subtle background gradient is acceptable; components should remain mostly flat.
6. **Use consistent 1–2 px outlines.** Borders are part of the identity, not a fallback.
7. **The chatbot conversation must remain visually primary.** Sidebars and metadata must support, not overpower, the chat.
8. **Decorative technical elements must be sparse on mobile.** Reduce visual density rather than scaling everything down.
9. **Use real labels and real hierarchy.** Never fill the interface with meaningless pseudo-text.
10. **No uncontrolled rounded-card UI.** Cards must be grouped into a clear system, not scattered independently.

---

## 4. Design Tokens

### 4.1 Color palette

| Token | Value | Usage |
|---|---:|---|
| `--color-canvas` | `#B8D7E8` | Main page background |
| `--color-canvas-soft` | `#D6EAF3` | Secondary background regions |
| `--color-surface` | `#F7FAF7` | Main panel and document surfaces |
| `--color-surface-muted` | `#E9F0F2` | Secondary cards and inactive areas |
| `--color-ink` | `#071C2E` | Primary text, borders, dark panels |
| `--color-ink-soft` | `#17354A` | Secondary dark surfaces |
| `--color-text-muted` | `#526978` | Metadata and supporting text |
| `--color-accent` | `#F47F6B` | Primary actions, active markers, alerts |
| `--color-accent-soft` | `#FFD3C9` | Accent backgrounds |
| `--color-info` | `#6F9DBA` | Informational states |
| `--color-success` | `#4F8A72` | Success states |
| `--color-warning` | `#C78C3C` | Warning states |
| `--color-danger` | `#B84B4B` | Destructive states |
| `--color-white` | `#FFFFFF` | High-contrast text or highlights |

### Color usage ratio

- 50–60% light blue canvas and surrounding background.
- 25–35% off-white content surfaces.
- 10–15% dark navy framing and controls.
- Less than 5% coral accent.

Coral must not become a large background color except for small banners, tags, or critical actions.

---

### 4.2 Typography

#### Preferred font families

```css
--font-display: "Space Grotesk", "Arial Narrow", Arial, sans-serif;
--font-body: "IBM Plex Sans", Inter, system-ui, sans-serif;
--font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
```

#### Typography roles

| Role | Size | Weight | Notes |
|---|---:|---:|---|
| Display title | `32–44px` | `650–750` | Compact line height, slightly condensed feel |
| Page title | `24–32px` | `650–700` | Used once per page |
| Section title | `18–22px` | `650–700` | Strong visual divider |
| Component title | `15–18px` | `600–700` | Cards, panels, modal headers |
| Body | `15–17px` | `400–500` | Default chat and content text |
| Compact body | `13–14px` | `400–500` | Metadata and secondary panels |
| Label | `11–12px` | `600–700` | Uppercase or tracked text |
| Code/technical | `13–14px` | `400–500` | Monospace, high contrast |

#### Typography behavior

- Headings may use tight line height: `1.05–1.2`.
- Body copy should use `1.5–1.7` line height.
- Use uppercase only for short labels, not long headings.
- Use letter spacing between `0.04em` and `0.1em` for labels.
- Avoid centered paragraphs. Align long-form content left.

---

### 4.3 Borders, radii, and shadows

```css
--border-thin: 1px solid var(--color-ink);
--border-strong: 2px solid var(--color-ink);
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 18px;
--radius-pill: 999px;
--shadow-panel: 4px 4px 0 rgba(7, 28, 46, 0.16);
--shadow-floating: 0 12px 30px rgba(7, 28, 46, 0.16);
```

Rules:

- Main shells and important controls use dark borders.
- Standard cards use `8–12px` radius.
- Pills are reserved for compact actions, filters, tags, and status.
- Use hard offset shadows for editorial/diagrammatic character.
- Use soft floating shadows only for modals, menus, and elevated overlays.

---

### 4.4 Spacing

Use an 8 px base grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
```

Recommended density:

- Compact controls: `8–12px` internal padding.
- Standard cards: `16–24px` internal padding.
- Main chat canvas: `24–32px` padding on desktop.
- Section gap: `24–40px`.

---

### 4.5 Motion

```css
--duration-fast: 120ms;
--duration-normal: 200ms;
--duration-slow: 320ms;
--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
```

Motion principles:

- Use small translations of `2–6px`.
- Animate opacity, border color, background color, and transform.
- Avoid elastic or overly playful motion.
- Connector-line animations are allowed only for loading or process states.
- Respect `prefers-reduced-motion`.

---

## 5. Global Page Architecture

### Desktop layout

Use a three-region application shell:

```text
┌────────────────────────────────────────────────────────────┐
│ Utility / navigation strip                                 │
├───────────────┬──────────────────────────────┬─────────────┤
│ Conversation  │ Main chatbot workspace       │ Context /   │
│ sidebar       │                              │ detail rail  │
│               │                              │ (optional)   │
└───────────────┴──────────────────────────────┴─────────────┘
```

#### Recommended dimensions

- Maximum app width: `1600px`.
- Conversation sidebar: `260–320px`.
- Context rail: `280–360px`.
- Main chat column: fluid, minimum `520px`.
- Top utility strip: `56–72px`.

### Main composition

The central chat area should appear as a large framed editorial panel. Inside it:

1. conversation title and status;
2. optional workflow/progress strip;
3. message thread;
4. source/tool results;
5. fixed or sticky composer.

---

## 6. Background System

Use a light blue background with optional subtle texture.

Allowed effects:

- 1 px grid at very low opacity;
- faint blueprint dots;
- sparse horizontal connector lines;
- low-contrast radial lighting behind the main shell.

Example:

```css
body {
  background:
    linear-gradient(rgba(7, 28, 46, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(7, 28, 46, 0.035) 1px, transparent 1px),
    var(--color-canvas);
  background-size: 32px 32px;
}
```

The grid must not reduce text contrast.

---

## 7. Component Specifications

## 7.1 Application Shell

- Use a strong dark frame or dark structural bars around the primary workspace.
- Corners may include small nodes, labels, or index markers.
- Use `12–18px` outer radius.
- The shell should feel engineered, not soft or floating.

Recommended styling:

```css
.app-shell {
  background: var(--color-surface);
  border: var(--border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
  overflow: hidden;
}
```

---

## 7.2 Top Navigation / Utility Strip

The top strip may contain:

- product name;
- workspace selector;
- model selector;
- search;
- status;
- profile and settings;
- one primary action.

Visual rules:

- Use pill controls with dark outlines.
- Keep height compact.
- Use small labels and icons.
- Active navigation may use a dark fill with white text.
- Coral is appropriate for the primary action or active status dot.

---

## 7.3 Conversation Sidebar

The sidebar should feel like an indexed archive or document register.

### Structure

- Sidebar header.
- “New conversation” button.
- Search or filter control.
- Grouped conversation list.
- User/account region at the bottom.

### Conversation row

Each row may contain:

- title;
- timestamp;
- status or category tag;
- overflow action.

Interaction:

- Default: transparent or off-white.
- Hover: `--color-canvas-soft`.
- Active: dark navy fill with white text, or accent strip on the left.
- Focus: 2 px visible outline.

Avoid placing every row inside a separate heavy card. Use dividers or grouped blocks.

---

## 7.4 Chat Header

The chat header must clearly communicate context.

Include:

- conversation title;
- short description or workspace label;
- model/status badges;
- actions such as share, export, clear, or settings.

Styling:

- Framed or underlined section.
- Title on the left; actions on the right.
- Optional small coral node or marker showing an active session.

---

## 7.5 Workflow / Progress Strip

Use this optional component when the chatbot performs multi-step tasks.

Examples:

- Understanding request
- Searching sources
- Generating answer
- Verifying output

Visual form:

- Horizontal line with circular nodes.
- Completed node: dark fill or success color.
- Active node: coral fill with visible ring.
- Pending node: light surface with dark outline.
- Labels should remain concise.

Do not show it for routine one-step conversations.

---

## 7.6 Message Thread

The message thread is the main reading surface.

### General rules

- Maximum readable line length: `68–80ch`.
- Messages should have generous vertical separation.
- Do not make every message look like the same chat bubble.
- Assistant responses may use editorial blocks with headers, sections, tables, and citations.

### User message

- Align right on wide layouts.
- Use dark navy or muted blue fill.
- Use white text.
- Keep width between `55%` and `75%`.
- Use a moderate radius, not a fully rounded bubble.

```css
.message--user {
  background: var(--color-ink);
  color: var(--color-white);
  border: 1px solid var(--color-ink);
  border-radius: 14px 14px 4px 14px;
}
```

### Assistant message

- Align left.
- Use off-white or transparent background.
- Use a visible left rail, header marker, or framed content block.
- Allow rich content inside.

```css
.message--assistant {
  background: var(--color-surface);
  color: var(--color-ink);
  border: var(--border-thin);
  border-left-width: 4px;
  border-radius: 4px 14px 14px 14px;
}
```

### System message

- Use compact, full-width status strips.
- Use monospace or label typography.
- Use muted blue-gray background.
- Reserve coral for warning or important state change.

---

## 7.7 Rich Assistant Content

Assistant responses may include:

- section headings;
- numbered plans;
- tables;
- code blocks;
- quotes;
- source lists;
- callouts;
- downloadable artifacts.

### Internal content styling

- `h2/h3`: strong editorial heading with small top label or horizontal rule.
- Lists: compact, aligned, no oversized bullets.
- Tables: dark header row, thin grid lines, off-white body.
- Code blocks: dark navy background, light text, monospace font.
- Inline code: muted blue-gray background with a thin border.
- Blockquotes: left border in coral, soft accent background.

---

## 7.8 Tool, Search, and Agent Result Cards

Use these for external actions, citations, calculations, files, or tool calls.

### Card anatomy

- small uppercase type label;
- title;
- concise status;
- optional metadata row;
- expandable body;
- action area.

### Visual treatment

- Dark header strip or outlined header.
- Off-white body.
- Small circular status node.
- Coral for “running” or “needs attention.”
- Success green for completed.

Cards should look like technical report modules, not marketing tiles.

---

## 7.9 Source and Citation Chips

- Use small outlined pills.
- Include source index, favicon/icon, or short domain label.
- Hover reveals full title or details.
- Active/selected source may use dark fill.
- Do not use coral for all citations; reserve it for currently inspected sources.

---

## 7.10 Composer

The composer is the primary interaction control.

### Structure

- multiline input;
- attachment button;
- tool or mode selector;
- optional voice control;
- send button;
- helper text for shortcut or privacy state.

### Styling

- Place inside a strongly framed container.
- Use off-white input surface.
- Keep the send button coral or dark navy.
- The composer may appear slightly elevated from the thread.

```css
.composer {
  background: var(--color-surface);
  border: var(--border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-panel);
}
```

### Send button

- Coral fill with dark navy border and text, or dark navy fill with white icon.
- Minimum size: `44px × 44px`.
- Disabled state must be visibly muted.

---

## 7.11 Buttons

### Primary

- Coral background.
- Dark navy border.
- Dark navy text or icon.
- Offset shadow is allowed.

### Secondary

- Off-white background.
- Dark navy border.
- Dark navy text.

### Tertiary

- Transparent background.
- No border by default.
- Use underline, icon, or hover fill.

### Destructive

- Use danger color only when destructive intent is explicit.

Button states:

- Hover: translate `-1px` vertically or increase contrast.
- Active: remove offset shadow and translate `1–2px` down.
- Focus: visible 2 px outline with adequate offset.
- Disabled: reduce contrast, remove shadow, preserve legibility.

---

## 7.12 Inputs and Selectors

- Use off-white fill and dark border.
- Labels appear above or embedded as compact tags.
- Focus state uses coral or blue outline.
- Placeholder text must remain readable.
- Validation text appears directly below the field.

Avoid borderless form fields.

---

## 7.13 Tags and Status Indicators

Use three forms:

1. **Pill tags** for category and metadata.
2. **Circular nodes** for process status.
3. **Ribbon labels** for persistent state or environment.

Status mapping:

- Active/running: coral.
- Complete: success green.
- Informational: muted blue.
- Warning: amber.
- Error: red.
- Neutral: off-white with navy outline.

---

## 7.14 Context Rail

The optional right-side rail may contain:

- conversation summary;
- sources;
- task plan;
- memory/context;
- generated files;
- settings;
- model parameters.

Rules:

- Use stacked sections with clear headers.
- Prefer one shared outer frame rather than many floating cards.
- Allow collapse/expand.
- Hide or convert into a drawer below `1200px`.

---

## 7.15 Modals and Drawers

- Use off-white surface with 2 px dark border.
- Use soft floating shadow.
- Header may use a dark strip with white text.
- Close button should be explicit and keyboard accessible.
- Drawer width: `360–480px` desktop.
- Mobile drawers should occupy most of the viewport.

---

## 7.16 Empty States

Empty states should resemble a clean technical document cover, not a generic illustration card.

Include:

- concise title;
- one sentence of guidance;
- 2–4 suggested prompts;
- optional simple diagram or node motif;
- one primary action.

Keep decoration sparse.

---

## 8. Diagrammatic Decoration

Decorative lines and nodes are a major part of the visual identity, but they must remain secondary.

### Allowed elements

- thin horizontal or vertical connector lines;
- small circles at intersections;
- numbered nodes;
- short arrowheads;
- tiny labels or index codes;
- bracket-like section markers;
- ruler/timeline motifs.

### Placement

- page edges;
- between major sections;
- around headers;
- in empty background zones;
- inside loading or workflow components.

### Restrictions

- Never place decoration behind paragraph text.
- Never use more than one decorative system per component.
- Keep opacity between `0.25` and `0.65` unless the element is interactive.
- Remove most connector decoration on small screens.

---

## 9. Responsive Behavior

### Breakpoints

```css
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1536px;
```

### Desktop: `>= 1280px`

- Three-column layout is allowed.
- Full utility strip.
- Decorative connector lines may be visible.
- Context rail remains open.

### Tablet: `768–1279px`

- Collapse context rail into a drawer.
- Sidebar may remain narrow or collapsible.
- Reduce outer page margin.
- Simplify top navigation.

### Mobile: `< 768px`

- Single-column layout.
- Sidebar and context rail become drawers.
- Chat header becomes compact.
- User and assistant messages may use up to `92%` width.
- Composer stays sticky at the bottom.
- Remove nonessential connector lines and labels.
- Maintain 44 px minimum touch targets.
- Do not preserve desktop density by shrinking text below readable sizes.

---

## 10. Accessibility

Implementation must meet WCAG 2.2 AA where practical.

Required:

- Body text contrast of at least 4.5:1.
- Large text contrast of at least 3:1.
- Visible keyboard focus states.
- Semantic landmarks: `header`, `nav`, `main`, `aside`, `footer`.
- Real buttons for actions; real links for navigation.
- Labels for all form fields.
- `aria-live` regions for streaming messages and tool status.
- Keyboard-accessible menus, dialogs, and conversation controls.
- No status conveyed only through color.
- Respect reduced-motion and increased-contrast preferences.

Streaming responses must not repeatedly steal focus from the user.

---

## 11. Content and Microcopy Style

The interface language should be concise and operational.

Preferred:

- “New conversation”
- “Search conversations”
- “Sources”
- “Working”
- “Completed”
- “Review required”
- “Attach file”
- “Send message”

Avoid decorative or ambiguous labels such as:

- “Magic mode”
- “Explore the universe”
- “Ask anything” as the only input guidance

Use meaningful status language tied to actual system behavior.

---

## 12. CSS Starter Tokens

```css
:root {
  --color-canvas: #b8d7e8;
  --color-canvas-soft: #d6eaf3;
  --color-surface: #f7faf7;
  --color-surface-muted: #e9f0f2;
  --color-ink: #071c2e;
  --color-ink-soft: #17354a;
  --color-text-muted: #526978;
  --color-accent: #f47f6b;
  --color-accent-soft: #ffd3c9;
  --color-info: #6f9dba;
  --color-success: #4f8a72;
  --color-warning: #c78c3c;
  --color-danger: #b84b4b;
  --color-white: #ffffff;

  --font-display: "Space Grotesk", "Arial Narrow", Arial, sans-serif;
  --font-body: "IBM Plex Sans", Inter, system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;

  --border-thin: 1px solid var(--color-ink);
  --border-strong: 2px solid var(--color-ink);

  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-pill: 999px;

  --shadow-panel: 4px 4px 0 rgba(7, 28, 46, 0.16);
  --shadow-floating: 0 12px 30px rgba(7, 28, 46, 0.16);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --duration-fast: 120ms;
  --duration-normal: 200ms;
  --duration-slow: 320ms;
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

---

## 13. Suggested Component Naming

Use consistent component names so AI-generated code remains maintainable.

```text
AppShell
TopUtilityBar
WorkspaceSwitcher
ConversationSidebar
ConversationList
ConversationListItem
ChatWorkspace
ChatHeader
WorkflowStrip
MessageThread
UserMessage
AssistantMessage
SystemMessage
ToolResultCard
SourceChip
ContextRail
PromptComposer
AttachmentButton
ModeSelector
SendButton
StatusNode
SectionFrame
EmptyState
ModalFrame
DrawerPanel
ToastNotice
```

---

## 14. Implementation Contract for AI Agents

When building from this file, the implementation agent must:

1. Create reusable components rather than one large page component.
2. Define all colors, spacing, radii, shadows, and motion as design tokens.
3. Use semantic HTML and accessible controls.
4. Implement responsive behavior explicitly for desktop, tablet, and mobile.
5. Keep chat content readable at all viewport sizes.
6. Use coral only for intentional emphasis.
7. Use dark outlines consistently across major components.
8. Avoid adding unrequested gradients, glass effects, neon colors, or generic SaaS styling.
9. Avoid fake text, fake metrics, and decorative data without meaning.
10. Ensure loading, empty, error, disabled, hover, focus, and active states exist.
11. Keep decorative connectors in isolated layers with `pointer-events: none`.
12. Verify that decoration does not obstruct content at any breakpoint.
13. Preserve a central editorial reading column within the chat workspace.
14. Use the same component vocabulary across pages.
15. Prefer progressive disclosure for advanced controls.

---

## 15. Acceptance Checklist

A build is visually compliant when all answers below are “yes.”

### Visual system

- [ ] Is the background light blueprint blue?
- [ ] Are major regions framed with dark navy borders?
- [ ] Are content surfaces off-white rather than pure white everywhere?
- [ ] Is coral used sparingly and consistently?
- [ ] Do controls use a deliberate mix of framed rectangles and pills?
- [ ] Are decorative lines and nodes subtle and non-obstructive?

### Chat experience

- [ ] Is the conversation visually dominant?
- [ ] Are user and assistant messages clearly distinct?
- [ ] Can assistant responses support long-form structured content?
- [ ] Is the composer easy to find and use?
- [ ] Are tool and source results visually integrated?

### Responsive and accessible behavior

- [ ] Does the layout collapse cleanly on tablet and mobile?
- [ ] Are touch targets at least 44 px?
- [ ] Are all interactive controls keyboard accessible?
- [ ] Are focus states visible?
- [ ] Is text contrast sufficient?
- [ ] Is reduced motion supported?

### Code quality

- [ ] Are design tokens centralized?
- [ ] Are components reusable?
- [ ] Are state variants implemented?
- [ ] Are decorative layers separated from content layers?
- [ ] Is the interface free of meaningless placeholder UI?

---

## 16. Final Design Summary

Build the chatbot as a **framed editorial workspace on a blueprint-blue canvas**. Use off-white document surfaces, dark navy structure, coral action markers, compact pills, visible borders, restrained shadows, and sparse process-diagram ornamentation. The result should feel precise, engineered, and distinctive while remaining readable, accessible, and suitable for extended chatbot conversations.
