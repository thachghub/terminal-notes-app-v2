This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Terminal Notes App v2 - EntryTerminal Development Session Summary

## Session Overview
This was an extensive development session focused on building and refining an EntryTerminal feature for a Next.js terminal-themed notes application with Firebase authentication and Firestore integration.

## Initial State
The session began with a working EntryTerminal feature that had some UI/UX issues that needed refinement.

## Major Improvements Implemented

### 1. UI Cleanup and Refinement
- **Removed "(edited)" indicators** from entries for cleaner interface
- **Updated placeholder text** from long version to "Type entry, press Cmd+Enter to submit..." then back to longer version with examples
- **Removed "$ terminal --entry" header** for minimal design
- **Removed ">" prompt characters** from both input area and entry display for cleaner look

### 2. Custom Animated Title Implementation
- **Modified TerminalTitle component** to accept `customTitle` and `customSubtitle` props
- **Updated TerminalDisplay component** to pass custom props to TerminalTitle
- **Changed title** from "HYPER TERMINAL" to "Entry Terminal" with same animations (sparkles, letter-by-letter typing, 30-second re-animation cycle)
- **Changed subtitle** from "// sending transmission..." to "// enter a note, reminder, or thought..." with same animated dots

### 3. Responsive Design Improvements
- **Fixed entry layout** to wrap on narrow screens using `flex-wrap`, `gap-2`, `shrink-0`, `min-w-0 break-words`
- **Resolved white box issue** on narrow screens by adding `resize: 'none'`, `overflow: 'hidden'`, `scrollbar-hide` to textarea
- **Improved timestamp and content alignment** by using same font family and size (`font-mono text-base`)

### 4. Enhanced Delete Confirmation System
- **Replaced browser confirm()** with custom terminal-themed modal
- **Added keyboard shortcuts** (Y to confirm, N/Escape to cancel)
- **Styled modal** with black background, cyan border, terminal aesthetics
- **Added keyboard event listeners** that auto-cleanup when modal closes

### 5. Advanced Keyboard Navigation
- **Implemented arrow key navigation** (↓/↑) through entry history
- **Added visual highlighting** for selected entries with cyan background and left border
- **Preserved original input** when navigating and restored with Escape
- **Auto-reset navigation** when user starts typing

### 6. Accomplished/Strikethrough System
- **First Delete/Backspace press** marks entry as "accomplished" with strikethrough and "✓ accomplished" label
- **Second Delete/Backspace press** prompts for actual deletion
- **Persistent state** using Set of entry IDs rather than single index
- **Multiple entries** can be marked accomplished simultaneously
- **Visual styling** with `line-through text-gray-500 opacity-60`

### 7. Timestamp Toggle Feature
- **Global timestamp toggle** using clock emoji initially, then changed to `--time` button
- **Positioned above entries list** in top-right corner
- **Clicking any timestamp** or `--time` button toggles ALL timestamps globally
- **Collapsed state** shows no prefix before entries (clean display)
- **Hover effects** with gold color (`hover:text-yellow-400`)

### 8. Visual Polish
- **Added text pulsating animation** to input field when empty (`animate-pulse` conditional on `!entry`)
- **Consistent hover colors** changed from cyan to gold for all interactive elements ([E], [X], --time buttons)
- **Improved button styling** with focus rings and transitions

### 9. Comprehensive Mouse Support
- **Beautiful hover effects** with subtle cyan glow (`bg-cyan-400/5 shadow-lg shadow-cyan-400/10`)
- **Direct click-to-edit** functionality on entry content with proper cursor positioning
- **Priority-based highlighting** system where mouse hover takes precedence over keyboard navigation
- **Strict single-highlight rule** - only one entry can be highlighted at a time
- **Smooth transitions** between mouse and keyboard navigation modes

### 10. Advanced Click-Away Functionality
- **Global click handler** that detects clicks outside entries and exits edit mode
- **Smart boundary detection** using multiple fallback methods (`.entry-container`, `[data-entry-content]`, buttons, textareas, inputs)
- **Proper event propagation** management to prevent click conflicts
- **Intuitive editing workflow** - click to edit, click away to exit
- **No stuck edit modes** - always easy to exit editing

### 11. Enhanced Inline Editing
- **Multi-line textarea support** with auto-sizing for inline editing
- **Cmd+Enter to save** instead of just Enter (allows line breaks)
- **Proper cursor positioning** within text fields for seamless editing
- **Independent workflows** - mouse and keyboard work seamlessly together

## Technical Implementation Details

### State Management
- `selectedIndex`: Tracks currently selected entry for keyboard navigation (-1 = input field)
- `accomplishedEntries`: Set<string> tracking accomplished entry IDs
- `timestampsCollapsed`: Boolean for global timestamp visibility
- `deleteConfirmId`: String for delete confirmation modal
- `hoveredIndex`: Tracks which entry is being hovered by mouse
- `isMouseActive`: Boolean tracking if mouse is actively controlling highlighting
- `editingId`: String tracking which entry is currently being edited inline
- `editContent`: String storing the content being edited

### Keyboard Controls
- **Cmd+Enter**: Submit entry (main input) or save edit (inline editing)
- **↓ Arrow**: Navigate down through entries
- **↑ Arrow**: Navigate up through entries or return to input
- **Delete/Backspace**: Mark as accomplished (first press) or prompt deletion (second press)
- **Enter**: Start editing selected entry (keyboard navigation)
- **Escape**: Cancel navigation/reset to original input or cancel editing
- **Y/N**: Confirm/cancel deletion in modal

### Mouse Controls
- **Click on entry content**: Start inline editing with proper cursor positioning
- **Hover over entries**: Subtle glow effect with priority over keyboard highlighting
- **Click away**: Exit edit mode and clear highlighting
- **Click on timestamps**: Toggle global timestamp visibility
- **Click on buttons**: Perform respective actions ([E] edit, [X] delete, save, cancel)

### Firebase Integration
- Collection: 'entryterminalentries'
- Real-time updates with onSnapshot
- User-specific data isolation
- CRUD operations with proper error handling

### Component Architecture
- Modified TerminalTitle for custom titles/subtitles
- Updated TerminalDisplay to pass custom props
- EntryHistory handles all functionality (input, display, navigation, CRUD, mouse interactions)
- Custom delete confirmation modal with animations
- Global click handler with smart boundary detection

## Final State
The EntryTerminal feature provides a sophisticated, dual-input interface where users can:
- Type multi-line entries with Cmd+Enter submission
- Navigate through history with arrow keys or mouse hover
- Click directly on any entry content to start inline editing with proper cursor positioning
- Mark entries as accomplished with visual feedback
- Toggle timestamp visibility globally
- Delete entries with terminal-themed confirmation
- Experience authentic terminal aesthetics with consistent gold hover effects
- Use mouse and keyboard independently or together seamlessly
- Click anywhere outside entries to exit edit mode intuitively
- Enjoy smooth transitions and visual feedback throughout all interactions

The implementation successfully creates a powerful, efficient note-taking tool that maintains authentic terminal aesthetics while providing modern UX conveniences including comprehensive mouse support, intuitive click-away behavior, and seamless editing workflows.
