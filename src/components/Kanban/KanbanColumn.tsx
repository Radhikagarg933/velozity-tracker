import React, { useState } from 'react';
import { Task, Status, CollabUser } from '../../types';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../common/EmptyState';
import { useApp } from '../../context/AppContext';

const STATUS_STYLES: Record<Status, { dot: string; label: string }> = {
  'To Do': { dot: 'bg-base-500', label: 'text-base-400' },
  'In Progress': { dot: 'bg-blue-400', label: 'text-blue-400' },
  'In Review': { dot: 'bg-yellow-400', label: 'text-yellow-400' },
  Done: { dot: 'bg-green-400', label: 'text-green-400' },
};

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  collabUsers: CollabUser[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onTouchStart: (e: React.TouchEvent, taskId: string) => void;
  draggedTaskId: string | null;
}

export function KanbanColumn({
  status,
  tasks,
  collabUsers,
  onDragStart,
  onTouchStart,
  draggedTaskId,
}: KanbanColumnProps) {
  const { dispatch } = useApp();
  const [isDragOver, setIsDragOver] = useState(false);
  const style = STATUS_STYLES[status];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger if leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      dispatch({ type: 'MOVE_TASK', payload: { taskId, status } });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl border transition-all duration-150 min-h-[200px] ${
        isDragOver
          ? 'bg-blue-500/5 border-blue-500/30'
          : 'bg-base-900 border-base-800'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-base-800 flex-shrink-0">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
        <span className={`font-display font-semibold text-xs tracking-wide uppercase ${style.label}`}>
          {status}
        </span>
        <span className="ml-auto text-[10px] font-mono font-medium text-base-500 bg-base-800 px-1.5 py-0.5 rounded-md">
          {tasks.length}
        </span>
      </div>

      {/* Cards list — independently scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
        {tasks.length === 0 ? (
          <EmptyState icon="🗂" title="No tasks here" description="Drag tasks here or adjust your filters" />
        ) : (
          tasks.map((task) => (
            <React.Fragment key={task.id}>
              {/* Drag placeholder */}
              {draggedTaskId === task.id && (
                <div
                  className="rounded-xl border-2 border-dashed border-base-600 bg-base-800/30"
                  style={{ height: 96 }}
                />
              )}
              <TaskCard
                task={task}
                collabUsersOnTask={collabUsers.filter((u) => u.currentTaskId === task.id)}
                onDragStart={onDragStart}
                onTouchStart={onTouchStart}
              />
            </React.Fragment>
          ))
        )}

        {/* Drop zone hint when dragging into empty column */}
        {isDragOver && tasks.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-blue-500/40 bg-blue-500/5 h-20 flex items-center justify-center">
            <span className="text-xs text-blue-400">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}
