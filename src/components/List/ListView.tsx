import React, { useRef, useMemo } from 'react';
import { Task, Status, STATUSES, SortField, SortDirection } from '../../types';
import { useApp } from '../../context/AppContext';
import { useVirtualScroll } from '../../hooks/useVirtualScroll';
import { Avatar } from '../common/Avatar';
import { PriorityBadge } from '../common/PriorityBadge';
import { EmptyState } from '../common/EmptyState';
import { CollabUser } from '../../types';
import { CollabAvatars } from '../common/CollabAvatars';
import { formatDateLabel, isOverdue, isToday } from '../../utils/dates';

const ROW_HEIGHT = 48;
const CONTAINER_HEIGHT = window.innerHeight - 200; // approx visible area

interface ListViewProps {
  collabUsers: CollabUser[];
}

function SortIcon({ field, sort }: { field: SortField; sort: { field: SortField; direction: SortDirection } }) {
  if (sort.field !== field) return <span className="text-base-600 text-[10px] ml-1">⇅</span>;
  return (
    <span className="text-blue-400 text-[10px] ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
  );
}

export function ListView({ collabUsers }: ListViewProps) {
  const { sortedTasks, state, dispatch, hasActiveFilters } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  const { virtualItems, totalHeight, handleScroll } = useVirtualScroll(
    sortedTasks,
    ROW_HEIGHT,
    CONTAINER_HEIGHT
  );

  const handleSort = (field: SortField) => {
    const isSame = state.sort.field === field;
    dispatch({
      type: 'SET_SORT',
      payload: {
        field,
        direction: isSame && state.sort.direction === 'asc' ? 'desc' : 'asc',
      },
    });
  };

  const handleStatusChange = (taskId: string, status: Status) => {
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status } });
  };

  const collabMap = useMemo(() => {
    const map: Record<string, CollabUser[]> = {};
    for (const u of collabUsers) {
      if (u.currentTaskId) {
        if (!map[u.currentTaskId]) map[u.currentTaskId] = [];
        map[u.currentTaskId].push(u);
      }
    }
    return map;
  }, [collabUsers]);

  if (sortedTasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon="🔍"
          title="No tasks match your filters"
          description="Try adjusting or clearing your active filters to see tasks"
          action={
            hasActiveFilters
              ? { label: '✕ Clear filters', onClick: () => dispatch({ type: 'CLEAR_FILTERS' }) }
              : undefined
          }
        />
      </div>
    );
  }

  const thClass = 'px-3 py-2 text-left text-[10px] font-display font-semibold uppercase tracking-wider text-base-500 select-none cursor-pointer hover:text-base-300 transition-colors';
  const thFixed = 'px-3 py-2 text-left text-[10px] font-display font-semibold uppercase tracking-wider text-base-500';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Counter */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-base-800 flex-shrink-0">
        <span className="text-[10px] font-mono text-base-500">
          Showing <span className="text-base-300 font-medium">{sortedTasks.length}</span> tasks
        </span>
      </div>

      {/* Table header */}
      <div className="flex-shrink-0 border-b border-base-800 bg-base-900 sticky top-0 z-10">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: '36%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>
              <th className={thClass} onClick={() => handleSort('title')}>
                Title <SortIcon field="title" sort={state.sort} />
              </th>
              <th className={thClass} onClick={() => handleSort('priority')}>
                Priority <SortIcon field="priority" sort={state.sort} />
              </th>
              <th className={thFixed}>Status</th>
              <th className={thFixed}>Assignee</th>
              <th className={thClass} onClick={() => handleSort('dueDate')}>
                Due <SortIcon field="dueDate" sort={state.sort} />
              </th>
              <th className={thFixed}>Viewers</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtual scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ height: CONTAINER_HEIGHT }}
      >
        {/* Full-height spacer keeps scrollbar correct */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          <table className="w-full table-fixed" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <colgroup>
              <col style={{ width: '36%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <tbody>
              {virtualItems.map(({ item: task, index, offsetTop }) => {
                const overdue = isOverdue(task.dueDate) && !isToday(task.dueDate);
                const dueToday = isToday(task.dueDate);
                const dateLabel = formatDateLabel(task.dueDate);
                const viewers = collabMap[task.id] ?? [];

                return (
                  <tr
                    key={task.id}
                    style={{
                      position: 'absolute',
                      top: offsetTop,
                      left: 0,
                      right: 0,
                      height: ROW_HEIGHT,
                      display: 'table',
                      width: '100%',
                      tableLayout: 'fixed',
                    }}
                    className={`border-b border-base-800/60 transition-colors ${
                      index % 2 === 0 ? 'bg-base-900' : 'bg-base-900/50'
                    } hover:bg-base-800`}
                  >
                    {/* Title */}
                    <td className="px-3 py-2 text-xs text-base-200 truncate max-w-0" style={{ width: '36%' }}>
                      <span className="truncate block">{task.title}</span>
                    </td>

                    {/* Priority */}
                    <td className="px-3 py-2" style={{ width: '13%' }}>
                      <PriorityBadge priority={task.priority} compact />
                    </td>

                    {/* Status — inline dropdown */}
                    <td className="px-3 py-2" style={{ width: '13%' }}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Status)}
                        className="text-[10px] font-medium bg-base-700 border border-base-600 rounded-lg px-2 py-1 text-base-200 focus:outline-none focus:border-base-400 cursor-pointer w-full"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Assignee */}
                    <td className="px-3 py-2" style={{ width: '14%' }}>
                      <Avatar userId={task.assigneeId} size="sm" />
                    </td>

                    {/* Due date */}
                    <td className="px-3 py-2" style={{ width: '14%' }}>
                      <span
                        className={`font-mono text-[10px] font-medium ${
                          overdue ? 'text-red-400' : dueToday ? 'text-yellow-400' : 'text-base-500'
                        }`}
                      >
                        {dateLabel}
                      </span>
                    </td>

                    {/* Collab viewers */}
                    <td className="px-3 py-2" style={{ width: '10%' }}>
                      {viewers.length > 0 && <CollabAvatars users={viewers} max={2} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
