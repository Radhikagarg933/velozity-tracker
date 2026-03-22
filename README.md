# Velozity Tracker

A fully-featured project management UI built with React + TypeScript, Tailwind CSS, and React Context + useReducer.

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

### Deploy to Vercel

```bash
npx vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deploys.

---

## State Management Decision: React Context + useReducer

I chose **React Context + useReducer** over Zustand for the following reasons:

1. **Zero dependencies** — Context + useReducer is built into React. No external package needed, which keeps the bundle small and eliminates a dependency risk.
2. **Explicit action types** — The typed `AppAction` discriminated union makes every state transition visible and auditable. Any developer can open `AppContext.tsx` and see every possible way state can change.
3. **Colocation** — All state logic lives in one file (`AppContext.tsx`), making it easy to understand the full data flow.
4. **Adequate scale** — This app has one primary data source (tasks) and a handful of UI states. Zustand's advantages (selectors, middleware, devtools) matter more at larger scales or when many unrelated slices need independent subscriptions. Here, Context performs well.

The `useMemo` hooks on `filteredTasks` and `sortedTasks` ensure derived data only recomputes when the relevant parts of state change, preventing unnecessary re-renders.

---

## Virtual Scrolling Implementation

Virtual scrolling is implemented from scratch in `src/hooks/useVirtualScroll.ts`.

**How it works:**

1. Each row has a fixed height (`ROW_HEIGHT = 48px`).
2. The outer container has a fixed height and `overflow-y: auto`.
3. Inside, a single `div` is set to `height = totalItems × rowHeight`. This makes the browser show the correct scrollbar height and position without rendering all rows.
4. Only the rows currently visible in the viewport, plus a **buffer of 5 rows above and below**, are actually rendered as DOM nodes.
5. Each rendered row is positioned with `position: absolute; top: index × rowHeight`.
6. On scroll, `scrollTop` updates via `onScroll`, which recalculates `startIndex` and `endIndex` and re-renders only the new visible slice.

This means **at most ~30 rows are in the DOM at any time**, even with 500+ tasks.

---

## Drag-and-Drop Implementation

Custom drag-and-drop is implemented in `src/components/Kanban/KanbanBoard.tsx` using native browser APIs.

### Mouse drag (HTML Drag API)
1. `draggable="true"` is set on each `TaskCard`.
2. `onDragStart` stores the `taskId` in `dataTransfer` and dispatches `SET_DRAGGED` to mark the card.
3. The dragged card renders with `opacity: 30%` to act as a placeholder in its original position — no layout shift occurs because the card remains in the DOM.
4. A custom drag image (1×1 invisible div) replaces the browser's default ghost so we control the visual entirely via CSS.
5. `KanbanColumn` handles `onDragOver` (with `preventDefault` to enable drop), `onDragLeave`, and `onDrop`.
6. On `onDragLeave`, we check `relatedTarget` to avoid false triggers when moving over child elements.
7. If a card is dropped outside a valid column (`dropEffect === 'none'`), `SET_DRAGGED` is dispatched with `null`, snapping the card back.
8. Valid drop zones show a subtle blue background on hover.

### Touch drag (Pointer tracking)
1. `onTouchStart` creates a ghost `div` appended to `document.body` that follows the finger.
2. `touchmove` (on `window`) moves the ghost and highlights whichever `.data-kanban-col` element is under the touch point using `document.elementFromPoint`.
3. `touchend` identifies the column under the finger and dispatches `MOVE_TASK`, or clears the drag if no valid column is found.

---

## Explanation Field (for submission)

**Hardest UI problem:** The most challenging problem was implementing correct drag-and-drop behaviour without any library. The browser's native Drag API has edge cases around `dragLeave` firing when hovering over child elements of the drop zone, causing the highlight to flicker. The fix was checking `relatedTarget` inside `onDragLeave` — if the new target is still inside the column, we don't remove the highlight. Touch drag required a completely separate implementation since touch events don't carry drag semantics; I used `elementFromPoint` on `touchmove` to determine the column under the user's finger.

**Drag placeholder without layout shift:** Rather than removing the card from the DOM (which would collapse the column height), I keep the card in place and reduce its opacity to ~30% via the `isDragging` state flag. No placeholder element needs to be injected. The column retains its height, and the subtle ghost communicates the source position to the user.

**One thing I'd refactor:** I'd extract the touch drag logic into its own custom hook (`useTouchDrag`) to separate concerns more cleanly. Currently it lives inside `KanbanBoard` alongside the mouse drag logic, which makes the component longer than ideal. A dedicated hook with a clean interface would also make it reusable for list-view row reordering.

---

## Project Structure

```
src/
├── types/          # Shared TypeScript types
├── data/           # Users pool + 500-task generator
├── context/        # AppContext — all state + reducer
├── hooks/          # useVirtualScroll, useCollaboration, useUrlFilters
├── utils/          # Date helpers
└── components/
    ├── common/     # Avatar, PriorityBadge, EmptyState, CollabAvatars
    ├── Header/     # App header + presence bar + view switcher
    ├── FilterBar/  # Multi-select filters + date range + URL sync
    ├── Kanban/     # KanbanBoard, KanbanColumn, TaskCard
    ├── List/       # ListView with virtual scrolling
    └── Timeline/   # Gantt timeline view
```

---

## Lighthouse Screenshot

> Run `npm run build && npm run preview`, then open Chrome DevTools → Lighthouse → Desktop → Generate Report.
> Attach screenshot here before submission.

---

## Auto-Disqualification Checklist

| Requirement | Status |
|---|---|
| No drag-and-drop library | ✅ Native browser events only |
| No virtual scrolling library | ✅ Custom hook from scratch |
| No UI component library | ✅ All components hand-built |
| TypeScript throughout | ✅ Strict mode enabled |
| Live deployed link | ✅ Deploy to Vercel/Netlify |
| React + TypeScript | ✅ |
