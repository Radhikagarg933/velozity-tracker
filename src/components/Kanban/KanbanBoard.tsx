import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { Status, STATUSES, CollabUser } from '../../types';
import { useApp } from '../../context/AppContext';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  collabUsers: CollabUser[];
}

export function KanbanBoard({ collabUsers }: KanbanBoardProps) {
  const { filteredTasks, state, dispatch } = useApp();

  // Ghost element for custom drag visual
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const dragOriginStatus = useRef<Status | null>(null);
  const touchDragId = useRef<string | null>(null);
  const activeTouchTarget = useRef<Element | null>(null);

  // ── Mouse drag events ─────────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      e.dataTransfer.setData('taskId', taskId);
      e.dataTransfer.effectAllowed = 'move';

      const task = state.tasks.find((t) => t.id === taskId);
      dragOriginStatus.current = task?.status ?? null;
      dispatch({ type: 'SET_DRAGGED', payload: taskId });

      // Transparent ghost image so our CSS handles the drag visual
      const blank = document.createElement('div');
      blank.style.width = '1px';
      blank.style.height = '1px';
      blank.style.position = 'fixed';
      blank.style.top = '-9999px';
      document.body.appendChild(blank);
      e.dataTransfer.setDragImage(blank, 0, 0);
      setTimeout(() => document.body.removeChild(blank), 0);
    },
    [state.tasks, dispatch]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      // If dropped outside a valid column (dropEffect = 'none'), snap back
      if (e.dataTransfer.dropEffect === 'none' || e.dataTransfer.dropEffect === undefined) {
        dispatch({ type: 'SET_DRAGGED', payload: null });
      }
    },
    [dispatch]
  );

  // ── Touch drag events (custom pointer tracking) ───────────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, taskId: string) => {
      touchDragId.current = taskId;
      const task = state.tasks.find((t) => t.id === taskId);
      dragOriginStatus.current = task?.status ?? null;
      dispatch({ type: 'SET_DRAGGED', payload: taskId });

      // Create ghost
      const ghost = document.createElement('div');
      ghost.style.cssText = `
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        width: 200px;
        padding: 10px 12px;
        background: #1e2530;
        border: 1px solid #3d4b5c;
        border-radius: 12px;
        font-size: 11px;
        color: #d1dae4;
        opacity: 0.9;
        box-shadow: 0 24px 48px rgba(0,0,0,0.6);
        transform: scale(1.05) rotate(1deg);
        font-family: 'DM Sans', sans-serif;
      `;
      ghost.textContent = task?.title ?? '';
      document.body.appendChild(ghost);
      ghostRef.current = ghost;

      const touch = e.touches[0];
      ghost.style.left = `${touch.clientX - 100}px`;
      ghost.style.top = `${touch.clientY - 30}px`;
    },
    [state.tasks, dispatch]
  );

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchDragId.current) return;
      const touch = e.touches[0];

      // Move ghost
      if (ghostRef.current) {
        ghostRef.current.style.left = `${touch.clientX - 100}px`;
        ghostRef.current.style.top = `${touch.clientY - 30}px`;
      }

      // Track which column is under finger
      ghostRef.current!.style.display = 'none';
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      ghostRef.current!.style.display = '';
      activeTouchTarget.current = el;

      // Highlight drop zone
      document.querySelectorAll('[data-kanban-col]').forEach((col) => {
        const colEl = col as HTMLElement;
        if (colEl.contains(el)) {
          colEl.style.background = 'rgba(59,130,246,0.06)';
          colEl.style.borderColor = 'rgba(59,130,246,0.3)';
        } else {
          colEl.style.background = '';
          colEl.style.borderColor = '';
        }
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchDragId.current) return;

      // Find which column the finger ended on
      const touch = e.changedTouches[0];
      ghostRef.current!.style.display = 'none';
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      ghostRef.current!.style.display = '';

      let dropped = false;
      document.querySelectorAll('[data-kanban-col]').forEach((col) => {
        const colEl = col as HTMLElement;
        colEl.style.background = '';
        colEl.style.borderColor = '';
        if (colEl.contains(el)) {
          const status = colEl.getAttribute('data-kanban-col') as Status;
          dispatch({ type: 'MOVE_TASK', payload: { taskId: touchDragId.current!, status } });
          dropped = true;
        }
      });

      if (!dropped) {
        dispatch({ type: 'SET_DRAGGED', payload: null });
      }

      // Cleanup
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
      }
      touchDragId.current = null;
      activeTouchTarget.current = null;
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dispatch]);

  // Group tasks by status — memoized
  const tasksByStatus = useMemo(
    () =>
      STATUSES.reduce<Record<Status, typeof filteredTasks>>(
        (acc, s) => {
          acc[s] = filteredTasks.filter((t) => t.status === s);
          return acc;
        },
        {} as Record<Status, typeof filteredTasks>
      ),
    [filteredTasks]
  );

  return (
    <div
      className="grid gap-3 p-4 h-full overflow-y-auto"
      style={{ gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))' }}
      onDragEnd={handleDragEnd}
    >
      {STATUSES.map((status) => (
        <div key={status} data-kanban-col={status} className="h-full">
          <KanbanColumn
            status={status}
            tasks={tasksByStatus[status]}
            collabUsers={collabUsers}
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
            draggedTaskId={state.draggedTaskId}
          />
        </div>
      ))}
    </div>
  );
}
