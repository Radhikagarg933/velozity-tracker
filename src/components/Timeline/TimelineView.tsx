import React, { useMemo } from 'react';
import { Task, Priority, CollabUser } from '../../types';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { CollabAvatars } from '../common/CollabAvatars';
import { todayStr } from '../../utils/dates';
import { USERS } from '../../data/users';

const PRIORITY_COLORS: Record<Priority, { bar: string; border: string }> = {
  Critical: { bar: 'bg-red-500/70', border: 'border-red-500/40' },
  High: { bar: 'bg-orange-500/70', border: 'border-orange-500/40' },
  Medium: { bar: 'bg-blue-500/70', border: 'border-blue-500/40' },
  Low: { bar: 'bg-green-500/70', border: 'border-green-500/40' },
};

const ROW_H = 36;
const LABEL_W = 160; // Left label column width in px

function getMonthDays(): { date: string; label: string; isToday: boolean; isWeekend: boolean }[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayS = todayStr();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      label: String(i + 1),
      isToday: dateStr === todayS,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });
}

function dayIndex(dateStr: string, days: { date: string }[]): number {
  return days.findIndex((d) => d.date === dateStr);
}

interface TimelineViewProps {
  collabUsers: CollabUser[];
}

export function TimelineView({ collabUsers }: TimelineViewProps) {
  const { filteredTasks, dispatch, hasActiveFilters } = useApp();

  const days = useMemo(() => getMonthDays(), []);
  const DAY_W = 32; // px per day column

  const todayIndex = days.findIndex((d) => d.isToday);

  // Sort by due date for nicer layout
  const sorted = useMemo(
    () => [...filteredTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [filteredTasks]
  );

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

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon="📅"
          title="No tasks match your filters"
          description="Adjust filters to see tasks on the timeline"
          action={
            hasActiveFilters
              ? { label: '✕ Clear filters', onClick: () => dispatch({ type: 'CLEAR_FILTERS' }) }
              : undefined
          }
        />
      </div>
    );
  }

  const monthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Month label */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-base-800 flex-shrink-0">
        <span className="font-display font-semibold text-xs text-base-300 tracking-wide uppercase">
          {monthName}
        </span>
        <span className="font-mono text-[10px] text-base-500">— {sorted.length} tasks</span>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: LABEL_W + days.length * DAY_W }}>
          {/* Day header */}
          <div
            className="flex sticky top-0 z-20 bg-base-950 border-b border-base-800"
            style={{ height: 36 }}
          >
            {/* Left spacer */}
            <div
              className="flex-shrink-0 border-r border-base-800"
              style={{ width: LABEL_W }}
            />
            {/* Day columns */}
            {days.map((day) => (
              <div
                key={day.date}
                className={`flex-shrink-0 flex items-center justify-center border-r border-base-800/40 text-[9px] font-mono font-medium ${
                  day.isToday
                    ? 'text-blue-400 bg-blue-500/10'
                    : day.isWeekend
                    ? 'text-base-600'
                    : 'text-base-600'
                }`}
                style={{ width: DAY_W }}
              >
                {day.label}
              </div>
            ))}
          </div>

          {/* Task rows */}
          {sorted.map((task) => {
            const colors = PRIORITY_COLORS[task.priority];
            const user = USERS.find((u) => u.id === task.assigneeId);
            const viewers = collabMap[task.id] ?? [];

            // Calculate bar position
            let startIdx = task.startDate ? dayIndex(task.startDate, days) : -1;
            const endIdx = dayIndex(task.dueDate, days);

            // If startDate is outside current month or missing, use dueDate as single-day marker
            const isSingleDay = startIdx < 0 || startIdx === endIdx;
            if (isSingleDay) startIdx = endIdx;

            const barLeft = startIdx >= 0 ? startIdx * DAY_W : 0;
            const barWidth = isSingleDay ? DAY_W : (endIdx - startIdx + 1) * DAY_W;
            const visible = endIdx >= 0; // skip tasks entirely outside current month

            return (
              <div
                key={task.id}
                className="flex border-b border-base-800/40 hover:bg-base-800/30 transition-colors group"
                style={{ height: ROW_H }}
              >
                {/* Task label */}
                <div
                  className="flex-shrink-0 flex items-center gap-2 px-3 border-r border-base-800 overflow-hidden"
                  style={{ width: LABEL_W }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: user?.color }}
                  />
                  <span className="text-[10px] text-base-300 truncate leading-tight">
                    {task.title}
                  </span>
                  {viewers.length > 0 && (
                    <div className="ml-auto flex-shrink-0">
                      <CollabAvatars users={viewers} max={1} size="xs" />
                    </div>
                  )}
                </div>

                {/* Timeline cells */}
                <div className="flex-1 relative" style={{ height: ROW_H }}>
                  {/* Weekend shading */}
                  {days.map((day, i) =>
                    day.isWeekend ? (
                      <div
                        key={day.date}
                        className="absolute top-0 bottom-0 bg-base-800/30"
                        style={{ left: i * DAY_W, width: DAY_W }}
                      />
                    ) : null
                  )}

                  {/* Today line */}
                  {todayIndex >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-blue-400/60 z-10"
                      style={{ left: todayIndex * DAY_W + DAY_W / 2 }}
                    />
                  )}

                  {/* Task bar */}
                  {visible && (
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 rounded-md border ${colors.bar} ${colors.border} flex items-center px-1.5 overflow-hidden`}
                      style={{
                        left: barLeft,
                        width: Math.max(barWidth, 8),
                        height: 22,
                      }}
                      title={`${task.title} — ${task.priority}`}
                    >
                      {!isSingleDay && barWidth > 40 && (
                        <span className="text-[9px] text-white/80 truncate font-medium leading-none">
                          {task.title}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
