import React, { memo } from 'react';
import { Task } from '../../types';
import { Avatar } from '../common/Avatar';
import { PriorityBadge } from '../common/PriorityBadge';
import { CollabAvatars } from '../common/CollabAvatars';
import { CollabUser } from '../../types';
import { formatDateLabel, isOverdue, isToday } from '../../utils/dates';
import { useApp } from '../../context/AppContext';

interface TaskCardProps {
  task: Task;
  collabUsersOnTask: CollabUser[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onTouchStart: (e: React.TouchEvent, taskId: string) => void;
}

export const TaskCard = memo(function TaskCard({
  task,
  collabUsersOnTask,
  onDragStart,
  onTouchStart,
}: TaskCardProps) {
  const { state } = useApp();
  const isDragging = state.draggedTaskId === task.id;
  const overdue = isOverdue(task.dueDate) && !isToday(task.dueDate);
  const dueToday = isToday(task.dueDate);
  const dateLabel = formatDateLabel(task.dueDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onTouchStart={(e) => onTouchStart(e, task.id)}
      className={`group relative bg-base-800 border rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all duration-150 select-none ${
        isDragging
          ? 'opacity-30 scale-95'
          : 'border-base-700 hover:border-base-500 hover:bg-base-750 hover:shadow-lg hover:shadow-black/30'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Collab indicators */}
      {collabUsersOnTask.length > 0 && (
        <div className="absolute -top-2 -right-1 z-10 transition-all duration-500">
          <CollabAvatars users={collabUsersOnTask} max={2} />
        </div>
      )}

      {/* Title */}
      <p className="text-xs font-medium text-base-100 leading-snug mb-2 pr-2 line-clamp-2">
        {task.title}
      </p>

      {/* Priority badge */}
      <div className="mb-2">
        <PriorityBadge priority={task.priority} compact />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <Avatar userId={task.assigneeId} size="xs" />
        <span
          className={`font-mono text-[9px] font-medium ${
            overdue
              ? 'text-red-400'
              : dueToday
              ? 'text-yellow-400'
              : 'text-base-500'
          }`}
        >
          {dateLabel}
        </span>
      </div>
    </div>
  );
});
