export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type ViewType = 'kanban' | 'list' | 'timeline';
export type SortField = 'title' | 'priority' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
export const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export const PRIORITY_ORDER: Record<Priority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export interface User {
  id: string;
  name: string;
  color: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  priority: Priority;
  status: Status;
  startDate: string | null; // YYYY-MM-DD or null
  dueDate: string; // YYYY-MM-DD
}

export interface Filters {
  status: Status[];
  priority: Priority[];
  assignee: string[];
  dueDateFrom: string;
  dueDateTo: string;
}

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface CollabUser {
  id: string;
  name: string;
  color: string;
  initials: string;
  currentTaskId: string | null;
}

export const EMPTY_FILTERS: Filters = {
  status: [],
  priority: [],
  assignee: [],
  dueDateFrom: '',
  dueDateTo: '',
};
