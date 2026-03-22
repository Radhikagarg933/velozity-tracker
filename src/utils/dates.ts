export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

export function isOverdue(dateStr: string): boolean {
  return dateStr < todayStr();
}

export function getDaysOverdue(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - due.getTime()) / 86_400_000);
}

export function formatDueDate(dateStr: string): string {
  if (isToday(dateStr)) return 'Due Today';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDateLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'Due Today';
  const overdue = isOverdue(dateStr);
  if (overdue) {
    const days = getDaysOverdue(dateStr);
    if (days > 7) return `${days}d overdue`;
  }
  return formatDueDate(dateStr);
}
